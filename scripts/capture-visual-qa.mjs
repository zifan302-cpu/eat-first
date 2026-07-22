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
  schemaVersion: "1.4.0",
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
      equipment: {
        hob: true,
        oven: false,
        microwave: true,
        air_fryer: false,
        electric_griddle: false,
        outdoor_grill: false,
        rice_cooker: true,
        steamer: true,
        pressure_cooker: false,
        multicooker: false,
        slow_cooker: false,
        blender: false,
        hand_blender: false,
        food_processor: false,
        toaster: true,
        sandwich_press: false
      },
      customEquipment: ["塔吉锅"],
      pantryPolicy: "everyday",
      pantryStaples: {
        cooking_oil: true,
        salt: true,
        sugar: true,
        soy_sauce: true,
        vinegar: true,
        black_pepper: false,
        flour: false,
        starch: true,
        butter: false
      },
      customPantryStaples: ["味噌", "鱼露"]
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
  await evaluate("window.scrollTo(0, 0)");
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
  const output = join(outputDir, `eat-first-v08-${name}.png`);
  await writeFile(output, Buffer.from(result.data, "base64"));
  console.log(output);
}

await evaluate("localStorage.removeItem('eat-first:v1:state')");
await reload();
await capture("onboarding-430x900");

await evaluate(
  "Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('打开我的冰箱') || button.textContent?.includes('Open my fridge'))?.click()"
);
await delay(350);
await evaluate(
  `localStorage.setItem('eat-first:v1:state', ${JSON.stringify(JSON.stringify(sampleState))}); location.reload()`
);
await delay(1800);
await evaluate("document.fonts.ready");
await evaluate("window.scrollTo(0, 0)");
await delay(250);
const hydratedState = await evaluate("localStorage.getItem('eat-first:v1:state')");
if (!hydratedState.result.value?.includes('"hasSeenOnboarding":true')) {
  throw new Error(`Seeded state was not hydrated: ${JSON.stringify(hydratedState.result.value)}`);
}
const onboardingVisible = await evaluate(
  "document.body.textContent?.includes('打开我的冰箱') || document.body.textContent?.includes('Open my fridge')"
);
if (onboardingVisible.result.value) throw new Error('Onboarding remained visible after seeded reload');

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
    await evaluate("Array.from(document.querySelectorAll('summary')).find((summary) => summary.textContent?.includes('\u8c03\u6574\u98df\u6750\u8303\u56f4'))?.click()");
    await delay(250);
    await capture("recipe-food-roles-430x900");
    await evaluate("Array.from(document.querySelectorAll('summary')).find((summary) => summary.textContent?.includes('\u8c03\u6574\u98df\u6750\u8303\u56f4'))?.click()");
    await evaluate("Array.from(document.querySelectorAll('summary')).find((summary) => summary.textContent?.includes('\u672c\u6b21\u505a\u996d\u6761\u4ef6'))?.click()");
    await delay(250);
    await capture("recipe-meal-setup-430x900");
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
  if (name === "settings-430x900") {
    const equipmentDisclosure = await evaluate(`(() => {
      const summary = Array.from(document.querySelectorAll('summary')).find((item) => item.textContent?.includes('\u6211\u7684\u53a8\u5177'));
      summary?.scrollIntoView({ block: 'start' });
      summary?.click();
      return Boolean(summary);
    })()`);
    if (!equipmentDisclosure.result.value) throw new Error('Equipment disclosure was not found');
    await delay(300);
    await capture("settings-equipment-430x900");
    const customEquipmentInput = await evaluate(`(() => {
      const input = Array.from(document.querySelectorAll('input')).find((item) => item.placeholder?.includes('\u5854\u5409\u9505'));
      input?.scrollIntoView({ block: 'center' });
      input?.focus();
      return Boolean(input);
    })()`);
    if (!customEquipmentInput.result.value) throw new Error('Custom equipment input was not found');
    await send("Input.insertText", { text: "\u7535\u706b\u9505" });
    await delay(150);
    const addCustomEquipment = await evaluate(`(() => {
      const input = document.activeElement;
      const form = input?.closest('form');
      const button = form?.querySelector('button[type="submit"]');
      button?.click();
      return Boolean(button);
    })()`);
    if (!addCustomEquipment.result.value) throw new Error('Custom equipment add button was not found');
    await delay(350);
    const customEquipmentState = await evaluate("localStorage.getItem('eat-first:v1:state')");
    if (!customEquipmentState.result.value?.includes('\u7535\u706b\u9505')) {
      throw new Error('Custom equipment was not saved');
    }
    await capture("settings-custom-equipment-430x900");
    await evaluate(`(() => {
      const input = Array.from(document.querySelectorAll('input')).find((item) => item.placeholder?.includes('\u5473\u564c'));
      input?.scrollIntoView({ block: 'center' });
    })()`);
    await delay(250);
    await capture("settings-custom-pantry-430x900");
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
