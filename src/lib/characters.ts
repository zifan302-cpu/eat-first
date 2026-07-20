import type { AddFoodInput } from "../hooks/useFoodActions";
import type { FoodItem, LocaleCode } from "../types/food";
import { addCalendarDays, toDateInputValue } from "./dates";

export type CharacterId = "tomato" | "carrot" | "broccoli" | "eggplant" | "mushroom";

export interface CharacterProfile {
  id: CharacterId;
  asset: string;
  name: Record<LocaleCode, string>;
  role: Record<LocaleCode, string>;
  accent: string;
  soft: string;
}

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  tomato: {
    id: "tomato",
    asset: "/art/upright-characters/tomato.webp",
    name: { "zh-CN": "番茄", "en-GB": "Tomato" },
    role: { "zh-CN": "今日行动", "en-GB": "Today’s action" },
    accent: "#D94A2F",
    soft: "#F6DED2"
  },
  carrot: {
    id: "carrot",
    asset: "/art/upright-characters/carrot.webp",
    name: { "zh-CN": "胡萝卜", "en-GB": "Carrot" },
    role: { "zh-CN": "连续行动", "en-GB": "Steady rhythm" },
    accent: "#D9771F",
    soft: "#F4E2C5"
  },
  broccoli: {
    id: "broccoli",
    asset: "/art/upright-characters/broccoli.webp",
    name: { "zh-CN": "西兰花", "en-GB": "Broccoli" },
    role: { "zh-CN": "冰箱侦察", "en-GB": "Fridge scout" },
    accent: "#47613F",
    soft: "#DCE3CE"
  },
  eggplant: {
    id: "eggplant",
    asset: "/art/upright-characters/eggplant.webp",
    name: { "zh-CN": "茄子", "en-GB": "Eggplant" },
    role: { "zh-CN": "本地守护", "en-GB": "Local keeper" },
    accent: "#57445F",
    soft: "#E4DCE4"
  },
  mushroom: {
    id: "mushroom",
    asset: "/art/upright-characters/mushroom.webp",
    name: { "zh-CN": "蘑菇", "en-GB": "Mushroom" },
    role: { "zh-CN": "成果记录", "en-GB": "Quiet record" },
    accent: "#9A6555",
    soft: "#E9DDD0"
  }
};

export function characterForFood(
  food: Pick<FoodItem, "normalizedName">
): CharacterProfile | undefined {
  const name = food.normalizedName.toLowerCase();
  if (/(tomato|番茄|西红柿)/.test(name)) return CHARACTERS.tomato;
  if (/(carrot|胡萝卜|红萝卜)/.test(name)) return CHARACTERS.carrot;
  if (/(broccoli|cauliflower|西兰花|花椰菜)/.test(name)) return CHARACTERS.broccoli;
  if (/(eggplant|aubergine|茄子)/.test(name)) return CHARACTERS.eggplant;
  if (/(mushroom|蘑菇|香菇|口蘑)/.test(name)) return CHARACTERS.mushroom;
  return undefined;
}

export interface QuickFoodTemplate {
  id: CharacterId;
  character: CharacterProfile;
  input: AddFoodInput;
}

export function getQuickFoodTemplates(locale: LocaleCode, now = new Date()): QuickFoodTemplate[] {
  const zh = locale === "zh-CN";
  const tomorrow = toDateInputValue(addCalendarDays(now, 1));
  const inThreeDays = toDateInputValue(addCalendarDays(now, 3));
  const inFiveDays = toDateInputValue(addCalendarDays(now, 5));

  return [
    {
      id: "tomato",
      character: CHARACTERS.tomato,
      input: {
        name: zh ? "番茄" : "Tomato",
        category: "vegetable",
        dateLabelType: "best_before",
        labelDate: inThreeDays
      }
    },
    {
      id: "carrot",
      character: CHARACTERS.carrot,
      input: {
        name: zh ? "胡萝卜" : "Carrot",
        category: "vegetable",
        dateLabelType: "best_before",
        labelDate: inFiveDays
      }
    },
    {
      id: "broccoli",
      character: CHARACTERS.broccoli,
      input: {
        name: zh ? "西兰花" : "Broccoli",
        category: "vegetable",
        dateLabelType: "use_by",
        labelDate: inThreeDays
      }
    },
    {
      id: "eggplant",
      character: CHARACTERS.eggplant,
      input: {
        name: zh ? "茄子" : "Eggplant",
        category: "vegetable",
        dateLabelType: "best_before",
        labelDate: inThreeDays
      }
    },
    {
      id: "mushroom",
      character: CHARACTERS.mushroom,
      input: {
        name: zh ? "蘑菇" : "Mushroom",
        category: "vegetable",
        dateLabelType: "use_by",
        labelDate: tomorrow
      }
    }
  ];
}
