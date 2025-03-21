import en_us from "../locales/en.json";
import zh_cn from "../locales/zh.json";


export default defineI18nConfig(() => ({
  legacy: false,
  locale: "zh",
  messages: {
    en: en_us,
    zh: zh_cn,
  },
}));
