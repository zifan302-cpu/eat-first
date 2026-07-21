const debugPort = Number(process.env.CDP_PORT || 9224);
const appUrl = process.env.APP_URL || "http://127.0.0.1:3501/#/add";
const origin = new URL(appUrl).origin;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let pages = [];
for (let attempt = 0; attempt < 20; attempt += 1) {
  try {
    pages = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json());
    if (pages.length > 0) break;
  } catch {
    // Edge may still be starting.
  }
  await delay(250);
}

const page = pages.find((entry) => entry.type === "page" && entry.url.startsWith(origin));
if (!page) throw new Error(`Local app page not found on CDP port ${debugPort}`);

const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
let mainFrameId = null;
let mainFrameNavigations = 0;
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
  if (message.method === "Page.frameNavigated") {
    if (!message.params.frame.parentId) {
      mainFrameId = message.params.frame.id;
      mainFrameNavigations += 1;
    }
    return;
  }
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
await send("Page.navigate", { url: appUrl });
await delay(2500);

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

// Recreate the stale-development-worker condition once. The app should remove
// it, perform no more than one cleanup reload, and then remain stable.
await evaluate(`navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready)`);
await send("Page.reload", { ignoreCache: true });
await delay(4000);

const testValue = "刷新稳定性测试番茄";
await evaluate(`(() => {
  const input = document.querySelector('form input:not([type]), form input[type="text"]');
  if (!input) throw new Error('Food name input not found');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, ${JSON.stringify(testValue)});
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input.value;
})()`);

const baselineNavigations = mainFrameNavigations;
const baselineTimeOrigin = await evaluate("performance.timeOrigin");
await delay(20000);

const result = await evaluate(`(() => {
  const input = document.querySelector('form input:not([type]), form input[type="text"]');
  return {
    value: input?.value ?? null,
    timeOrigin: performance.timeOrigin,
    controlledByServiceWorker: Boolean(navigator.serviceWorker.controller),
    href: location.href
  };
})()`);

const extraNavigations = mainFrameNavigations - baselineNavigations;
const stable =
  mainFrameId !== null &&
  extraNavigations === 0 &&
  result.timeOrigin === baselineTimeOrigin &&
  result.value === testValue &&
  result.controlledByServiceWorker === false;

console.log(JSON.stringify({ stable, extraNavigations, ...result }, null, 2));
socket.close();
if (!stable) process.exitCode = 1;
