import type { Messages } from "./en-GB";

export const zhCN: Messages = {
  app: {
    name: "Eat First",
    subtitle: "在食物浪费前，先知道今天该处理什么。",
    valueLine: "今天最该处理的冰箱 Top 3。",
    version: "V1.1 移动端 PWA Demo"
  },
  nav: {
    home: "首页",
    add: "添加",
    fridge: "冰箱",
    stats: "统计",
    settings: "设置"
  },
  pages: {
    homeTitle: "今天先吃什么",
    addTitle: "添加食物",
    fridgeTitle: "冰箱列表",
    statsTitle: "本周成果",
    settingsTitle: "设置"
  },
  actions: {
    eat: "吃掉",
    freeze: "冷冻",
    check: "检查",
    discard: "丢弃",
    later: "稍后",
    save: "保存",
    saveAndAdd: "保存并继续添加",
    cancel: "取消",
    edit: "编辑",
    delete: "删除",
    resetDemo: "重置 Demo",
    clearData: "清空本地数据",
    unlock: "解锁 Demo",
    exportJson: "导出 JSON",
    importJson: "导入 JSON",
    dismiss: "关闭提示",
    close: "关闭"
  },
  form: {
    name: "食物名称",
    namePlaceholder: "鸡胸肉、沙拉包、牛奶...",
    category: "分类",
    dateLabelType: "日期类型",
    labelDate: "日期",
    openedShelfLifeDays: "几天后提醒",
    quantityText: "分量",
    quantityPlaceholder: "1 包、半瓶...",
    note: "备注",
    notePlaceholder: "可选提醒",
    today: "今天",
    tomorrow: "明天",
    requiredDate: "这个日期类型需要选择日期。",
    requiredName: "请填写食物名称。",
    proLimit: "免费 Demo 最多允许 10 个当前食物。输入 demo code 可解锁更多。",
    addedContinue: "已添加，可以继续添加下一个。",
    recentItems: "最近添加"
  },
  filters: {
    all: "全部",
    use_by: "Use by",
    best_before: "Best before",
    opened: "已开封",
    none: "无日期"
  },
  dateTypes: {
    use_by: "Use by",
    best_before: "Best before",
    opened: "已开封",
    none: "无日期"
  },
  categories: {
    meat: "肉类",
    fish: "鱼类",
    dairy_eggs: "奶蛋",
    vegetable: "蔬菜",
    fruit: "水果",
    salad: "沙拉",
    leftovers: "剩菜",
    ready_meal: "即食餐",
    bakery: "烘焙",
    drink: "饮品",
    condiment: "调味品",
    dry_goods: "干货",
    frozen_food: "冷冻食品",
    other: "其他"
  },
  status: {
    active: "当前",
    eaten: "已吃掉",
    frozen: "已冷冻",
    discarded: "已丢弃"
  },
  priority: {
    expired_use_by: "已过 Use by",
    use_today: "今天处理",
    use_soon: "尽快处理",
    quality_check: "检查品质",
    opened_due: "开封提醒",
    opened_soon: "开封将到期",
    normal: "普通",
    no_date: "无日期",
    expiredUseBy:
      "已过 Use by 日期。本工具不能判断食品安全，请以包装说明和官方食品安全建议为准。",
    useToday: "Use by 今天到期。请今天处理，或按包装说明在今天冷冻。",
    useTomorrow: "Use by 明天到期。优先级高于普通食物。",
    useSoon: "Use by 在 2 天内到期。建议尽快安排保守处理。",
    normalUseBy: "Use by 还不紧急，但应保持可见。",
    bestBeforePast:
      "Best before 主要代表品质日期，不等同于 Use by。请结合包装说明和食物状态判断。",
    bestBeforeSoon: "Best before 接近日期。请检查包装说明和品质状态。",
    bestBeforeNormal: "Best before 暂不紧急，保留在列表中。",
    openedDue: "开封提醒已到。这只是提醒，不是安全保证。",
    openedSoon: "开封提醒快到了。请结合包装说明和食物状态判断。",
    openedNormal: "已记录开封日期，用作本地提醒。",
    noDate: "没有保存日期。除非没有更紧急食物，一般优先级最低。"
  },
  empty: {
    top: "现在没有需要优先处理的当前食物。",
    fridge: "当前没有食物。",
    stats: "使用操作后会显示记录。"
  },
  fridge: {
    editTitle: "编辑食物",
    activeOnly: "当前食物",
    deleteConfirm: "确定删除这个食物吗？"
  },
  stats: {
    eaten: "已吃掉",
    frozen: "已冷冻",
    discarded: "已丢弃",
    expiringSoon: "当前快到期",
    estimatedSaved: "估算避免浪费",
    savedDisclaimer: "估算值仅用于反馈，不代表真实节省金额。",
    recent: "最近操作"
  },
  settings: {
    language: "语言",
    installTitle: "安装到 iPhone",
    demoUnlock: "Demo 解锁",
    data: "数据管理",
    foodSafety: "食品安全说明",
    about: "关于",
    zh: "中文",
    en: "English",
    proStatusFree: "免费 Demo",
    proStatusUnlocked: "Demo 已解锁",
    proCodePlaceholder: "输入 demo code",
    resetNote: "恢复 15 个食物的 Demo 冰箱和偏好设置。",
    clearNote: "删除此浏览器中的所有本地数据。",
    exportNote: "JSON 只保存在本机，除非你主动分享。",
    importNote: "导入会替换当前本地 Demo 状态。",
    aboutBody: "Eat First 是一个本地优先的 PWA Demo，所有数据只保存在当前浏览器。"
  },
  safety: {
    title: "食品安全边界",
    body: "本工具仅用于提醒和排序，不能判断食品是否安全。请始终以包装说明和官方食品安全建议为准。",
    zhBody: "本工具仅用于提醒和排序，不能判断食品是否安全。请始终以包装说明和官方食品安全建议为准。"
  },
  pro: {
    title: "Demo 解锁",
    body: "这是本地 demo 解锁，不是真实支付。",
    limit: "免费 Demo 最多允许 10 个当前食物。",
    success: "Demo 已在本设备解锁。",
    invalid: "Demo code 不匹配。"
  },
  install: {
    title: "安装 Eat First",
    body: "请用 iPhone Safari 打开部署后的链接，然后添加到主屏幕。",
    steps: [
      "用 iPhone Safari 打开部署后的链接。",
      "点击 Safari 底部分享按钮。",
      "选择“添加到主屏幕”。",
      "点击“添加”。",
      "之后从桌面图标打开 Eat First。"
    ]
  }
};
