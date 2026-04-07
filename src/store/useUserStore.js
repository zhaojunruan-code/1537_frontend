import { defineStore } from "pinia"

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: {
      nickname: "",
      avatar: "",
      openid: "",
      role: "patient",
      isVip: false,
    },
    token: null,
  }),

  getters: {
    isLogin: (state) => !!state.token,
    getToken: (state) => state.token,
    userName: (state) => state.userInfo.nickname || '同学',
    isVip: (state) => !!state.userInfo.isVip,
    userRole: (state) => state.userInfo.role || "patient",
    isDoctor: (state) => state.userInfo.role === "doctor",
    isPatient: (state) => state.userInfo.role === "patient",
  },
  actions: {
    mockLogin(name = '微信用户') {
      this.userInfo.nickname = name
      this.userInfo.isVip = false
      this.token = 'mock-token-' + Date.now()
    },
    async onLogin(fromData) {
      //TODO 这里换成你的项目的登录接口
    },
    setToken(value) {
      this.token = value
    },
    async setUserInfo() {
      // const res = await onGetUserInfo()
      // if (res.code == 200) {
      //   this.userInfo = res.data
      // }
    },
    setVip(value) {
      this.userInfo.isVip = value
    },
    clearUserInfo() {
      this.userInfo = {
        nickname: "",
        avatar: "",
        openid: "",
        role: "patient",
        isVip: false,
      }
      this.token = null;
    },
    setUserRole(role) {
      this.userInfo.role = role
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: {
          getItem: (key) => {
            return uni.getStorageSync(key)
          },
          setItem: (key, value) => {
            uni.setStorageSync(key, value)
          },
        },
      },
    ],
  },
})
