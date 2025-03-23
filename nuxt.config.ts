// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  app: {
    head: {
      title: "zmoons",
      link: [],
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
  i18n: {
    locales: ["en", "zh"],
    vueI18n: "~/plugins/i18n.ts",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      alwaysRedirect: true,
      fallbackLocale: "zh",
    },
  },
  modules: ["@unocss/nuxt", "@element-plus/nuxt", "@nuxtjs/color-mode", "nuxt-icons", "@nuxtjs/i18n"],
  unocss: {
    nuxtLayers: true,
  },
  css: ["~/assets/css/main.css", "~/assets/css/element-plus.css"],
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
    classPrefix: "",
  },
  srcDir: "app",
  vite: {
    plugins: [],
  },
  nitro: {
    preset: "static"
  },
});
