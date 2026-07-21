import { createServer as createHttpServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { handleApiRequest, sendJson } from "./api.mjs";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = path.join(rootDir, "dist");
const production = process.argv.includes("--production");
const preferredPort = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2"
};

async function serveStatic(response, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    sendJson(response, 400, { code: "INVALID_PATH" });
    return;
  }
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let filePath = path.resolve(distDir, requested);
  if (!filePath.startsWith(`${distDir}${path.sep}`) && filePath !== path.join(distDir, "index.html")) {
    sendJson(response, 403, { code: "FORBIDDEN" });
    return;
  }
  try {
    if (!(await stat(filePath)).isFile()) throw new Error("NOT_FILE");
  } catch {
    filePath = path.join(distDir, "index.html");
  }
  const body = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(body);
}

const vite = production
  ? null
  : await createViteServer({
      root: rootDir,
      server: {
        middlewareMode: true,
        watch: {
          // Browser QA profiles and generated output change constantly and
          // must never be interpreted as application source edits.
          ignored: ["**/output/**", "**/dist/**"]
        }
      },
      appType: "spa"
    });

const server = createHttpServer(async (request, response) => {
  if (await handleApiRequest(request, response)) return;
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    sendJson(response, 404, { code: "API_NOT_FOUND" });
    return;
  }
  if (vite) {
    vite.middlewares(request, response, () => sendJson(response, 404, { code: "NOT_FOUND" }));
    return;
  }
  await serveStatic(response, url);
});

function listen(port) {
  return new Promise((resolve, reject) => {
    const handleError = (error) => {
      server.removeListener("listening", handleListening);
      reject(error);
    };
    const handleListening = () => {
      server.removeListener("error", handleError);
      const address = server.address();
      resolve(typeof address === "object" && address ? address.port : port);
    };

    server.once("error", handleError);
    server.once("listening", handleListening);
    server.listen(port, host);
  });
}

async function listenOnAvailablePort() {
  try {
    return await listen(preferredPort);
  } catch (error) {
    if (error.code !== "EACCES" && error.code !== "EADDRINUSE") {
      throw error;
    }
    // Windows can reserve large, shifting port ranges. Port 0 asks the OS for
    // a genuinely available port instead of guessing through that range.
    return listen(0);
  }
}

listenOnAvailablePort()
  .then((actualPort) => {
    if (actualPort !== preferredPort) {
      console.warn(`Port ${preferredPort} unavailable; using ${actualPort} instead.`);
    }
    console.log(`Fridge Fresh Squad running at http://localhost:${actualPort}`);
  })
  .catch((error) => {
    console.error(`Unable to start the local server (preferred port ${preferredPort}).`);
    throw error;
  });
