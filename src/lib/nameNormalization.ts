import type { FoodCategory } from "../types/food";

export function normalizeFoodName(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

const categoryRules: Array<{ category: FoodCategory; keywords: string[] }> = [
  {
    category: "frozen_food",
    keywords: ["frozen", "ice cream", "frozen pizza", "冷冻", "冰淇淋", "冷冻披萨"]
  },
  {
    category: "ready_meal",
    keywords: ["ready meal", "microwave meal", "meal deal", "便当", "预制菜", "即食餐"]
  },
  {
    category: "leftovers",
    keywords: ["leftover", "leftovers", "cooked rice", "剩菜", "剩饭", "熟食"]
  },
  {
    category: "meat",
    keywords: [
      "chicken",
      "chicken breast",
      "chicken wings",
      "pork",
      "pork belly",
      "ribs",
      "beef",
      "steak",
      "lamb",
      "ham",
      "bacon",
      "鸡胸肉",
      "鸡翅",
      "鸡腿",
      "鸡肉",
      "猪肉",
      "五花肉",
      "猪肝",
      "猪大肠",
      "排骨",
      "牛肉",
      "牛排",
      "羊肉",
      "火腿"
    ]
  },
  {
    category: "fish",
    keywords: ["fish", "salmon", "tuna", "cod", "鱼", "三文鱼", "金枪鱼", "鳕鱼"]
  },
  {
    category: "dairy_eggs",
    keywords: [
      "milk",
      "yogurt",
      "cheese",
      "egg",
      "eggs",
      "butter",
      "牛奶",
      "酸奶",
      "奶酪",
      "鸡蛋",
      "黄油"
    ]
  },
  {
    category: "salad",
    keywords: ["salad", "lettuce", "spinach", "rocket", "沙拉", "生菜", "菠菜"]
  },
  {
    category: "vegetable",
    keywords: [
      "broccoli",
      "carrot",
      "onion",
      "tomato",
      "potato",
      "mushroom",
      "西兰花",
      "胡萝卜",
      "洋葱",
      "番茄",
      "土豆",
      "蘑菇"
    ]
  },
  {
    category: "fruit",
    keywords: [
      "apple",
      "banana",
      "orange",
      "berry",
      "berries",
      "grapes",
      "strawberry",
      "strawberries",
      "苹果",
      "香蕉",
      "橙子",
      "蓝莓",
      "草莓",
      "葡萄"
    ]
  },
  {
    category: "dry_goods",
    keywords: [
      "rice",
      "pasta",
      "noodles",
      "bread flour",
      "cereal",
      "米",
      "米饭",
      "意面",
      "面条",
      "麦片"
    ]
  },
  {
    category: "bakery",
    keywords: ["bread", "bagel", "croissant", "toast", "面包", "贝果", "牛角包", "吐司"]
  },
  {
    category: "drink",
    keywords: ["juice", "coke", "beer-free drink", "milk tea", "果汁", "可乐", "奶茶"]
  },
  {
    category: "condiment",
    keywords: ["sauce", "ketchup", "mayo", "soy sauce", "酱", "番茄酱", "蛋黄酱", "酱油"]
  },
];

export function guessCategoryFromName(input: string): FoodCategory {
  const normalized = normalizeFoodName(input);
  if (!normalized) {
    return "other";
  }

  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword.toLocaleLowerCase()))) {
      return rule.category;
    }
  }

  return "other";
}
