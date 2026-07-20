import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pages = await fetch("http://127.0.0.1:9223/json").then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url.startsWith("http://127.0.0.1:4173"));
if (!page) throw new Error("Local preview page not found on CDP port 9223");

const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const handler = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 430,
  height: 900,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 430,
  screenHeight: 900
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const date = (offset) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
};
const at = new Date().toISOString();

const makeFood = (id, name, category, dateLabelType, labelDate, status = "active", history = []) => ({
  id,
  name,
  normalizedName: name.toLowerCase(),
  category,
  dateLabelType,
  ...(labelDate ? { labelDate } : {}),
  status,
  source: "manual",
  createdAt: at,
  updatedAt: at,
  actionHistory: [{ id: `${id}-created`, type: "created", at }, ...history]
});

const sampleState = {
  schemaVersion: "1.1.0",
  appId: "eat-first",
  preferences: { locale: "zh-CN", topN: 3, showSafetyBanner: true, hasSeenOnboarding: true },
  foods: [
    makeFood("tomato", "番茄", "vegetable", "use_by", date(0)),
    makeFood("mushroom", "蘑菇", "vegetable", "use_by", date(1)),
    makeFood("broccoli", "西兰花", "vegetable", "best_before", date(-1)),
    makeFood("carrot", "胡萝卜", "vegetable", "best_before", date(3)),
    makeFood("eggplant", "茄子", "vegetable", "none"),
    makeFood("saved", "昨天的胡萝卜", "vegetable", "best_before", date(-1), "eaten", [
      { id: "saved-eaten", type: "eaten", at }
    ])
  ],
  meta: { createdAt: at, updatedAt: at }
};

async function evaluate(expression) {
  return send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
}

async function reload() {
  await send("Page.reload", { ignoreCache: true });
  await delay(1600);
  await evaluate("document.fonts.ready");
  await delay(400);
}

async function capture(name) {
  const result = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  const output = join(tmpdir(), `eat-first-v05-${name}.png`);
  await writeFile(output, Buffer.from(result.data, "base64"));
  console.log(output);
}

await evaluate("localStorage.removeItem('eat-first:v1:state')");
await reload();
await capture("onboarding-430x900");

await evaluate(`localStorage.setItem('eat-first:v1:state', ${JSON.stringify(JSON.stringify(sampleState))})`);
await reload();

for (const [name, hash] of [
  ["home-430x900", "#/"],
  ["add-430x900", "#/add"],
  ["fridge-430x900", "#/fridge"],
  ["squad-430x900", "#/squad"],
  ["stats-430x900", "#/stats"],
  ["settings-430x900", "#/settings"]
]) {
  await evaluate(`location.hash = ${JSON.stringify(hash)}`);
  await delay(750);
  await capture(name);
}

socket.close();
