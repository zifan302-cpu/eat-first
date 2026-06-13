# Eat First

Eat First / 冰箱先吃什么 is a mobile-first PWA demo that helps users decide which fridge items to handle first.

## V1.1 Improvements

- iPhone PWA support with manifest, service worker, icons, and iOS meta tags.
- A warmer mobile UI with compact Top 3 cards on the home page.
- Home cards show category emoji, food name, compact status, one-line explanation, primary CTA, and secondary CTA.
- Add page supports Save and Save and add another.
- Recent item chips help refill common foods quickly.
- Local name-based category guessing for common foods such as `chicken` and `牛奶`.
- Demo seed now creates 15 active foods across `use_by`, `best_before`, `opened`, and `none`.
- Stats page now focuses on weekly outcomes and estimated saved feedback.
- Settings page is reorganized for language, iPhone install, demo unlock, data, safety, and about.

## What This Demo Does

- Lets users manually add fridge foods with `use by`, `best before`, `opened`, or `no date` labels.
- Calculates a conservative local priority score.
- Shows today's Top 3 foods on the home page.
- Supports eaten, frozen, discarded, and later actions.
- Persists all state in browser `localStorage`.
- Provides English and Chinese UI text.
- Includes a local-only Demo Unlock code.

## What This Demo Does NOT Do

- No backend, database, login, cloud sync, remote API, OCR, camera, barcode scanning, AI recipe generation, real payment, push notifications, App Store build, TestFlight, or Capacitor wrapper.
- It is not a food safety judge, nutrition app, recipe app, shopping app, or household ERP.

## Food Safety Disclaimer

This app is a reminder and prioritization tool only. It does not judge whether food is safe to eat. Always follow the package label and official food safety guidance.

本工具仅用于提醒和排序，不能判断食品是否安全。请始终以包装说明和官方食品安全建议为准。

## Tech Stack

- Vite
- React
- TypeScript
- React Router with `HashRouter`
- Tailwind CSS
- date-fns
- localStorage
- PWA manifest and service worker
- Vitest

## Local Development

```bash
npm install
npm run dev
```

The dev server prints the local URL. The app uses hash routes such as `/#/fridge`.

## Build

```bash
npm run build
```

The build script also generates missing PWA PNG icons in `public/icons`.

## Test

```bash
npm run test
```

## Deploy To Vercel

```bash
npm install
npm run build
```

Then:

- Push the project to GitHub.
- Import the GitHub repo in Vercel.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Deploy.
- Open the deployed link in iPhone Safari.

Because the app uses `HashRouter`, static hosting does not need a custom route rewrite for deep links.

## Install On iPhone

1. Open the deployed link in Safari on iPhone.
2. Tap the Share button.
3. Choose Add to Home Screen.
4. Tap Add.
5. Launch Eat First from the home screen.

中文步骤：

1. 用 iPhone Safari 打开部署后的链接。
2. 点击 Safari 底部分享按钮。
3. 选择“添加到主屏幕”。
4. 点击“添加”。
5. 之后从桌面图标打开 Eat First。

## Demo Seed

First launch automatically seeds 15 active demo items, including:

- Chicken breast: `use_by` today
- Salad bag: `use_by` tomorrow
- Milk: `opened` 4 days ago
- Pasta: `best_before` next month
- Salmon fillet, Greek yogurt, Strawberries, Broccoli, Eggs, Leftover rice, Ham slices, Orange juice, Bread, Frozen dumplings, Soy sauce

## Demo Unlock Code

```txt
EATFIRST-DEMO-PRO
```

This is a local demo unlock only. It is not a real payment.

## Project Structure

```txt
public/
  manifest.webmanifest
  icons/
  sw.js
scripts/
  generate-icons.mjs
src/
  components/
  hooks/
  i18n/
  lib/
  pwa/
  routes/
  styles/
  tests/
  types/
```

## Roadmap

- Batch add
- Better recent food suggestions
- Offline shell improvements
- Notifications
- OCR-assisted date input
- Shared fridge
- AI recipe suggestions

Roadmap items are intentionally excluded from V1.1.
