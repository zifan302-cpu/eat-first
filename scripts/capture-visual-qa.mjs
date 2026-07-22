import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const cdpPort = process.env.EAT_FIRST_CDP_PORT ?? "9223";
const pages = await fetch(`http://127.0.0.1:${cdpPort}/json`).then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url.startsWith("http://127.0.0.1:4173"));
if (!page) throw new Error(`Local preview page not found on CDP port ${cdpPort}`);

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

const makeFood = (id, name, category, dateLabelType, labelDate, quantityAmount, quantityUnit = "item", status = "active", history = []) => ({
  id,
  name,
  normalizedName: name.toLowerCase(),
  category,
  dateLabelType,
  ...(labelDate ? { labelDate } : {}),
  ...(quantityAmount ? { quantityAmount, quantityUnit } : {}),
  status,
  source: "manual",
  createdAt: at,
  updatedAt: at,
  actionHistory: [{ id: `${id}-created`, type: "created", at }, ...history]
});

const sampleState = {
  schemaVersion: "1.3.0",
  appId: "eat-first",
  preferences: {
    locale: "zh-CN",
    topN: 3,
    showSafetyBanner: true,
    hasSeenOnboarding: true,
    recipe: {
      cuisine: "auto",
      defaultServings: 1,
      defaultMaxMinutes: 30,
      dietaryNotes: "少辣",
      appliances: { oven: false, microwave: false, air_fryer: false, rice_cooker: true }
    }
  },
  foods: [
    makeFood("tomato", "番茄", "vegetable", "use_by", date(0), 4),
    makeFood("mushroom", "蘑菇", "vegetable", "use_by", date(1), 250, "g"),
    makeFood("broccoli", "西兰花", "vegetable", "best_before", date(-1), 1),
    makeFood("carrot", "胡萝卜", "vegetable", "best_before", date(3), 3),
    makeFood("eggplant", "茄子", "vegetable", "none", 2),
    makeFood("yogurt", "希腊酸奶", "dairy_eggs", "use_by", date(4), 500, "g"),
    makeFood("noodles", "鸡汤方便面", "dry_goods", "best_before", date(35), 4, "pack"),
    makeFood("soy", "生抽", "condiment", "best_before", date(90), 1, "bottle"),
    makeFood("berries", "蓝莓", "fruit", "use_by", date(2), 200, "g"),
    makeFood("milk", "牛奶", "dairy_eggs", "opened", date(-2), 1, "l"),
    makeFood("bread", "全麦面包", "bakery", "best_before", date(1), 1, "pack"),
    makeFood("saved", "昨天的胡萝卜", "vegetable", "best_before", date(-1), 1, "item", "eaten", [
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
  const outputDir = resolve("output/playwright");
  await mkdir(outputDir, { recursive: true });
  const output = join(outputDir, `eat-first-v07-${name}.png`);
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
  if (name === "home-430x900") {
    await evaluate("Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('\u751f\u6210\u83dc\u8c31\u7075\u611f'))?.click()");
    await delay(350);
    await capture("recipe-setup-430x900");
    await evaluate("Array.from(document.querySelectorAll('button')).find((button) => button.getAttribute('aria-label')?.includes('\u5173\u95ed'))?.click()");
  }
  if (name === "fridge-430x900") {
    await evaluate("document.querySelector('section.space-y-2 article button')?.click()");
    await delay(350);
    await capture("fridge-actions-430x900");
    await evaluate("Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('用了一些'))?.click()");
    await delay(250);
    await capture("fridge-partial-430x900");
  }
}

await evaluate("location.hash = '#/add'");
await delay(500);
await evaluate("document.querySelector('.fresh-card form input.fresh-field')?.focus()");
await send("Input.insertText", { text: "\u8349\u7a3f\u6062\u590d\u756a\u8304" });
await delay(500);
const storedDraft = await evaluate("sessionStorage.getItem('eat-first:add-food-draft')");
if (!storedDraft.result.value?.includes("\u8349\u7a3f\u6062\u590d\u756a\u8304")) {
  throw new Error(`Draft was not persisted: ${JSON.stringify(storedDraft.result.value)}`);
}
await reload();
const draftResult = await evaluate("document.querySelector('.fresh-card form input.fresh-field')?.value");
const recoveredDraft = draftResult.result.value;
if (recoveredDraft !== "\u8349\u7a3f\u6062\u590d\u756a\u8304") {
  throw new Error(`Draft recovery failed: ${JSON.stringify(recoveredDraft)}`);
}
await capture("add-draft-recovered-430x900");
console.log(JSON.stringify({ draftRecovery: "passed", recoveredDraft }));

socket.close();
