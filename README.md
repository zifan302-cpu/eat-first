# 冰箱小鲜队（Fresh Squad / Eat First）

一款本地优先、单人优先、轻游戏化的冰箱管理 PWA。它不追求记录一切，而是每天帮助用户回答一个问题：**冰箱里什么应该先处理？**

V0.5 以用户确认的“端正鲜物”角色母版重构整套体验，并加入独立的“小鲜队住处”：蛋壳纸界面、五种案例食材、今日行动和温和成长共同组成新的个人产品方向。

![冰箱小鲜队端正鲜物角色家族](assets/character-system/fresh-squad-family-style-reference.png)

## 当前产品能力

- 添加、编辑和删除冰箱食物
- 记录 `Use by`、`Best before`、开封日期或无日期食物
- 根据日期类型和时间进行本地优先级排序
- 每日首页展示最值得处理的 Top 3
- 支持吃掉、冷冻、丢弃和稍后处理
- 支持撤销最近一次关键操作
- 五种已验收案例食材的角色化快捷添加
- 今日处理任务、连续行动、小队等级和成长能量
- 独立的小鲜队静态生活场景，并连接真实任务与成长记录
- 摄像头扫描或手动输入 EAN / UPC / GS1 条形码，并从 Open Food Facts 生成可编辑录入草稿
- 根据今日优先食材、人数、用时和饮食要求，通过千问生成 2—3 个菜谱方案
- 本周及时吃掉或冷冻的行动反馈
- 首次使用欢迎与产品价值引导
- 中英文界面
- 本地数据导入、导出和清空
- PWA 安装及离线基础支持

食品安全边界：本产品只做提醒和排序，不判断食物是否安全。用户始终应以包装标签和官方食品安全建议为准。

## 产品边界

现阶段聚焦单人、单设备、冰箱内食物的低负担管理。轻游戏化用于帮助养成处理食物的习惯，不用排行榜、惩罚性机制或复杂虚拟经济增加压力。

详细边界见 [docs/product-scope.md](docs/product-scope.md)。

设计与角色资料：

- [V0.5 设计系统](docs/design-system.md)
- [当前角色生成标准与母提示词](docs/character-generation-standard.md)

## 技术栈

- Vite + React + TypeScript
- React Router（`HashRouter`）
- Tailwind CSS
- date-fns
- ZXing Browser（本地摄像头条形码识别）
- localStorage
- Node.js 同源 API 层（Open Food Facts 与千问密钥代理）
- Vitest
- Web App Manifest + Service Worker

## 本地开发

```bash
npm install
npm run dev
```

`npm run dev` 会同时启动 Vite 页面和同源 API。条形码查询开箱可用；摄像头在手机上需要 HTTPS 或 `localhost` 安全上下文。

### 配置千问

1. 复制 `.env.example` 为 `.env.local`。
2. 在 `.env.local` 中填写 `QWEN_API_KEY`，以及该密钥所属地域和工作空间对应的 OpenAI 兼容 `QWEN_BASE_URL`。
3. 如账户没有默认模型的权限，修改 `QWEN_MODEL`。
4. 重启 `npm run dev`。

`.env.local` 已加入 `.gitignore`。密钥只由 `server/index.mjs` 读取，不会进入 React、浏览器存储、请求日志或前端打包产物。请不要把真实密钥写入源码或提交到 Git。

常用验证命令：

```bash
npm test
npm run build
```

## 目录结构

```text
docs/                 产品边界与开发文档
assets/               不随 PWA 发布的角色参考图与生产母版
public/
  art/                产品运行时透明角色和图标母版
  icons/              PWA 与 iPhone 图标
  manifest.webmanifest
  sw.js
scripts/              构建辅助脚本
server/               条形码查询与千问菜谱的同源服务端代理
src/
  components/         可复用界面组件
  hooks/              应用状态与业务操作
  i18n/               中英文文案
  lib/                纯业务逻辑、存储与工具
  pwa/                PWA 注册逻辑
  routes/             页面级组件
  styles/             全局样式
  tests/              单元测试
  types/              领域类型
```

## 数据说明

食材清单默认保存在当前浏览器的 `localStorage` 中。条形码查询会把编码发送给 Open Food Facts；生成菜谱时，只会把当前优先食材的名称、分量、日期类型与用户填写的饮食要求，经自有服务端发送给已配置的千问接口。API 密钥不会发送给浏览器。旧 V1.0/V0.2 数据会继续迁移保留；小队等级、任务和连续行动均从真实行为记录计算，不需要后端账号。

## V0.5 游戏化原则

- 现实行动优先：只有吃掉、冷冻、丢弃和整理记录才能推动反馈。
- 正向而不惩罚：断开连续行动不会扣分，丢弃也不会降低等级。
- 角色服务信息：角色用于说明任务、提醒和结果，不遮挡核心食物信息。
- 住处承载情感：小队有独立生活场景，但成长只映射真实冰箱行动。
- 不做复杂经济：当前没有商城、抽卡、体力、排行榜或付费加速。
