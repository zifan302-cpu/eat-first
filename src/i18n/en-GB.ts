export const enGB = {
  app: {
    name: "Eat First",
    subtitle: "Know what to handle before food goes to waste.",
    valueLine: "Your top fridge decisions for today.",
    version: "V1.1 mobile PWA demo"
  },
  nav: {
    home: "Home",
    add: "Add",
    fridge: "Fridge",
    stats: "Stats",
    settings: "Settings"
  },
  pages: {
    homeTitle: "Today Eat First",
    addTitle: "Add food",
    fridgeTitle: "Fridge",
    statsTitle: "This Week",
    settingsTitle: "Settings"
  },
  actions: {
    eat: "Eat",
    freeze: "Freeze",
    check: "Check",
    discard: "Discard",
    later: "Later",
    save: "Save",
    saveAndAdd: "Save and add another",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    resetDemo: "Reset demo",
    clearData: "Clear local data",
    unlock: "Unlock demo",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    dismiss: "Dismiss",
    close: "Close"
  },
  form: {
    name: "Food name",
    namePlaceholder: "Chicken, salad bag, milk...",
    category: "Category",
    dateLabelType: "Date type",
    labelDate: "Date",
    openedShelfLifeDays: "Reminder after",
    quantityText: "Amount",
    quantityPlaceholder: "1 pack, half bottle...",
    note: "Note",
    notePlaceholder: "Optional reminder",
    today: "Today",
    tomorrow: "Tomorrow",
    requiredDate: "Choose a date for this label type.",
    requiredName: "Add a food name.",
    proLimit: "Free demo allows 10 active items. Use the demo code to unlock more.",
    addedContinue: "Added. You can add the next item.",
    recentItems: "Recent items"
  },
  filters: {
    all: "All",
    use_by: "Use by",
    best_before: "Best before",
    opened: "Opened",
    none: "No date"
  },
  dateTypes: {
    use_by: "Use by",
    best_before: "Best before",
    opened: "Opened",
    none: "No date"
  },
  categories: {
    meat: "Meat",
    fish: "Fish",
    dairy_eggs: "Dairy & eggs",
    vegetable: "Vegetables",
    fruit: "Fruit",
    salad: "Salad",
    leftovers: "Leftovers",
    ready_meal: "Ready meal",
    bakery: "Bakery",
    drink: "Drink",
    condiment: "Condiment",
    dry_goods: "Dry goods",
    frozen_food: "Frozen food",
    other: "Other"
  },
  status: {
    active: "Current",
    eaten: "Eaten",
    frozen: "Frozen",
    discarded: "Discarded"
  },
  priority: {
    expired_use_by: "Past use-by",
    use_today: "Use today",
    use_soon: "Use soon",
    quality_check: "Quality check",
    opened_due: "Opened reminder",
    opened_soon: "Opened soon",
    normal: "Normal",
    no_date: "No date",
    expiredUseBy:
      "Past use-by date. This app cannot judge food safety. Follow the package label and official food safety guidance.",
    useToday: "Use-by is today. Handle today or freeze today if the label allows.",
    useTomorrow: "Use-by is tomorrow. Prioritise this before lower-risk items.",
    useSoon: "Use-by is within 2 days. Plan a conservative next action.",
    normalUseBy: "Use-by is not immediate, but it should stay visible.",
    bestBeforePast:
      "Best before is mainly about quality, not the same as use-by. Check the package label and the food condition.",
    bestBeforeSoon: "Best before is close. Check quality and the package label.",
    bestBeforeNormal: "Best before is not urgent. Keep it on the list.",
    openedDue: "Opened reminder is due. This is not a safety guarantee.",
    openedSoon: "Opened reminder is close. Check the label and food condition.",
    openedNormal: "Opened date is being tracked as a reminder.",
    noDate: "No date saved. Lower priority unless the fridge is otherwise clear."
  },
  empty: {
    top: "No current food needs attention right now.",
    fridge: "Your current fridge list is empty.",
    stats: "Actions will appear after you use the app."
  },
  fridge: {
    editTitle: "Edit food",
    activeOnly: "Current foods",
    deleteConfirm: "Delete this food item?"
  },
  stats: {
    eaten: "Eaten",
    frozen: "Frozen",
    discarded: "Discarded",
    expiringSoon: "Expiring soon",
    estimatedSaved: "Estimated saved",
    savedDisclaimer: "Estimated savings are for feedback only and do not represent actual money saved.",
    recent: "Recent actions"
  },
  settings: {
    language: "Language",
    installTitle: "Install on iPhone",
    demoUnlock: "Demo Unlock",
    data: "Data",
    foodSafety: "Food Safety Disclaimer",
    about: "About",
    zh: "Chinese",
    en: "English",
    proStatusFree: "Free demo",
    proStatusUnlocked: "Demo unlocked",
    proCodePlaceholder: "Enter demo code",
    resetNote: "Restores the 15-item demo fridge and preferences.",
    clearNote: "Removes all local data from this browser.",
    exportNote: "JSON stays on this device unless you share it.",
    importNote: "Import replaces the current local demo state.",
    aboutBody: "Eat First is a local-first PWA demo. All data stays in this browser."
  },
  safety: {
    title: "Food safety boundary",
    body: "This app is a reminder and prioritization tool only. It does not judge whether food is safe to eat. Always follow the package label and official food safety guidance.",
    zhBody: "本工具仅用于提醒和排序，不能判断食品是否安全。请始终以包装说明和官方食品安全建议为准。"
  },
  pro: {
    title: "Demo Unlock",
    body: "This is a local demo unlock, not a real payment.",
    limit: "Free demo allows up to 10 current foods.",
    success: "Demo unlocked on this device.",
    invalid: "That demo code did not match."
  },
  install: {
    title: "Install Eat First",
    body: "Use Safari on iPhone, then add this PWA to the home screen.",
    steps: [
      "Open the deployed link in Safari on iPhone.",
      "Tap the Share button.",
      "Choose Add to Home Screen.",
      "Tap Add.",
      "Launch Eat First from the home screen."
    ]
  }
};

export type Messages = typeof enGB;
