import { defineStore } from "pinia"
import zhCN from "@/language/zh-CN.js"
import enUS from "@/language/en-US.js"

export const useLanguageStore = defineStore("language", {
  state: () => ({
    currentLanguage: "en-US",
    languages: {
      "zh-CN": {
        name: "简体中文",
        messages: zhCN
      },
      "en-US": {
        name: "English",
        messages: enUS
      }
    }
  }),

  getters: {
    getCurrentMessages: (state) => {
      return state.languages[state.currentLanguage]?.messages || {}
    },

    getLanguageOptions: (state) => {
      return Object.keys(state.languages).map(key => ({
        value: key,
        label: state.languages[key].name
      }))
    },

    isEnglish: (state) => state.currentLanguage === "en-US",
    isChinese: (state) => state.currentLanguage === "zh-CN"
  },

  actions: {
    setLanguage(language) {
      if (this.languages[language]) {
        this.currentLanguage = language
        // 持久化到本地存储
        uni.setStorageSync("app-language", language)
      }
    },

    initLanguage() {
      // 从本地存储获取语言设置
      const savedLanguage = uni.getStorageSync("app-language")
      if (savedLanguage && this.languages[savedLanguage]) {
        this.currentLanguage = savedLanguage
      } else {
        // 获取系统语言
        const systemLanguage = uni.getSystemInfoSync().language || "zh-CN"
        if (systemLanguage.startsWith("zh")) {
          this.currentLanguage = "zh-CN"
        } else {
          this.currentLanguage = "en-US"
        }
      }
    },

    // 翻译函数
    t(key) {
      const messages = this.getCurrentMessages
      return messages[key] || key
    }
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: "language-store",
        storage: {
          getItem: (key) => uni.getStorageSync(key),
          setItem: (key, value) => uni.setStorageSync(key, value)
        }
      }
    ]
  }
})

// 创建全局翻译函数
export const useI18n = () => {
  const languageStore = useLanguageStore()

  const t = (key) => {
    return languageStore.t(key)
  }

  const setLanguage = (language) => {
    languageStore.setLanguage(language)
  }

  const currentLanguage = computed(() => languageStore.currentLanguage)
  const isEnglish = computed(() => languageStore.isEnglish)
  const isChinese = computed(() => languageStore.isChinese)

  return {
    t,
    setLanguage,
    currentLanguage,
    isEnglish,
    isChinese,
    languageOptions: languageStore.getLanguageOptions
  }
}
