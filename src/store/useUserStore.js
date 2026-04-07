import { defineStore } from "pinia"

export const useUserStore = defineStore("user", {
  state: () => ({
    // TODO 根据自己项目拓展
    userInfo: {
      nickname: "",
      avatar: "",
      openid: "",
      role: "patient",
    },
    token: null,
  }),

  getters: {
    isLogin: (state) => !!state.token,
    getToken: (state) => state.token,
    userRole: (state) => state.userInfo.role || "patient",
    isDoctor: (state) => state.userInfo.role === "doctor",
    isPatient: (state) => state.userInfo.role === "patient",
  },
  actions: {
    // 登录
    async onLogin(fromData) {
      //TODO 这里换成你的项目的登录接口
      //const r = await onUserLogin(fromData)

      //if (r.code === 200) {
      //  this.setToken(r.data.token)
      //
      //  await this.setUserInfo()
      //} else {
      //  useToast(r.msg || "登录失败")
      //}
    },
    setToken(value) {
      this.token = value
    },
    // 刷新用户信息
    async setUserInfo() {
      const res = await onGetUserInfo()
      if (res.code == 200) {
        this.userInfo = res.data
      }
    },
    clearUserInfo() {
      this.userInfo = {
        nickname: "",
        avatar: "",
        openid: "",
        role: "patient",
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
