<template>
  <view class="login-btn" @click="loginShow = true">
    <slot></slot>
  </view>

  <wd-popup
    v-model="loginShow"
    position="bottom"
    :closable="true"
    :z-index="100000000"
    :safe-area-inset-bottom="false"
  >
    <view class="login-box">
      <view class="auth_content">
        <!-- 顶部信息展示 -->
        <view class="auth_top">
          <view class="ptitle">
            <text>获取您的</text>
            <text v-if="type === 1">昵称、头像</text>
            <text v-else>手机号</text>
          </view>
          <view class="txt">
            <text>获取用户</text>
            <text v-if="type === 1">昵称、头像</text>
            <text v-else>手机号</text>
            <text>信息，用于完善资料，提供更好的体验</text>
          </view>
        </view>

        <!-- 头像昵称登录 -->
        <view v-if="type === 1">
          <view class="auth_ul">
            <view class="auth_li">
              <view class="tit">头像</view>
              <view class="rit">
                <button
                  class="avatar-wrapper"
                  open-type="chooseAvatar"
                  @chooseavatar="onChooseAvatar"
                >
                  <image :src="form.avatar_fullurl" class="avatar"></image>
                </button>
              </view>
            </view>

            <view class="auth_li">
              <view class="tit">昵称</view>
              <view class="rit">
                <input
                  :value="form.nick_name"
                  class="weui-input"
                  placeholder="请输入昵称"
                  type="nickname"
                  @blur="onNickName"
                />
              </view>
            </view>
          </view>
          <view class="confirm_btn" @tap.stop="wxGetUserProfile">确定</view>
        </view>

        <!-- 手机号登录 -->
        <button
          v-if="type === 2"
          class="confirm_btn"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          手机号授权登录
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<script setup>
import { useUserStore } from "@/store/useUserStore"
import { getWechatMobile, wechatLogin } from "@/api/common"

defineOptions({name: 'LoginWrapper'})
// 组件传值
const props = defineProps({
  agreement: { type: [Boolean, String], default: false },
  /**
   * 1: 头像昵称
   * 2: 手机号
   */
  loginType: { type: Number, default: 1 },
})

const { agreement, loginType } = toRefs(props)
const type = ref(loginType.value)
const loginShow = ref(false)
const form = ref({ avatar_url: "", nick_name: "", phone: "", code: "" })
const openId = ref(null)
const safeAreaBottom = ref(0)

// 静默登录
const wxLogin = async () => {
  try {
    const { code } = await uni.login()
    form.value.code = code

    const response = await wechatLogin({ code })
    if (response.code === 200) {
      openId.value = response.data.openid
      // 静默登陆保留TOKEN
      // TODO 自行根据项目判断是否需要，不需要就删掉
      const userStore = useUserStore()
      userStore.setToken(response.data.token)
    } else {
      await uni.showToast({ title: response.msg, icon: "error" })
    }
  } catch (error) {
    await uni.showToast({ title: error.message, icon: "none" })
  }
}

// 初始化函数
const initFun = async () => {
  uni.getSystemInfo({
    success: (res) => {
      safeAreaBottom.value = res.screenHeight - res.safeArea.bottom
    },
  })
  if (type.value === 2) await wxLogin()
}

// 头像选择处理
const onChooseAvatar = async (e) => {

  const userStore = useUserStore()

  uni.uploadFile({
    url: import.meta.env.VITE_UPLOAD_BASEURL,
    filePath: e.detail.avatarUrl,
    name: "file",
    formData: {
      //token: userStore.getToken, // TODO 根据自己项目决定是否启用这个
    },
    success: (response) => {
      const r = JSON.parse(response.data)
      form.value.avatar_url = r.data.url // 传给后台的地址
      form.value.avatar_fullurl = r.data.fullurl
    },
    fail: (error) => {
      console.log("error: ", error)
    },
  })
}
// 昵称输入处理
const onNickName = (e) => (form.value.nick_name = e.detail.value)

// 手机号登录处理
const onGetPhoneNumber = async (e) => {
  if (!agreement.value) {
    return uni.showToast({ title: "请先授权登录", icon: "error" })
  }

  if (e.detail.errMsg !== "getPhoneNumber:ok") return

  try {
    const { code } = await uni.login()
    const response = await getWechatMobile({
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
      code,
      // openid: openId.value
    })

    if (response.code === 200) {
      const userStore = useUserStore()
      userStore.setToken(response.data.token)
      await uni.switchTab({ url: "/pages/index/index" })
    }
  } catch (error) {
    console.error(error)
  }
}

// 头像昵称登录处理
const wxGetUserProfile = async () => {
  if (!agreement.value) {
    return uni.showToast({ title: "请先授权登录", icon: "error" })
  }
  if (!form.value.nick_name) {
    return uni.showToast({ title: "请输入昵称", icon: "error" })
  }

  try {
    const { code } = await uni.login()
    form.value.code = code

    const response = await wechatLogin({
      code,
      nick_name: decodeURIComponent(form.value.nick_name),
      avatar_url: decodeURIComponent(form.value.avatar_url),
    })

    if (response.code === 200) {
      const userStore = useUserStore()
      userStore.setToken(response.data?.token || response.data?.access_token)
      await userStore.setUserInfo()
      type.value = 2
      //loginShow.value = false
      //uni.switchTab({ url: "/pages/index/index" })
    } else {
      await uni.showToast({ title: response.msg, icon: "error" })
    }
  } catch (error) {
    await uni.showToast({ title: error.message, icon: "error" })
  }
}

// 页面显示时初始化
initFun()
</script>

<style lang="scss" scoped>
.avatar-wrapper {
  padding: 0;

  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background-color: #dadada;
  }
}

.login-box {
  width: 100%;

  &.show {
    bottom: 0;

    .mask {
      display: block;
    }
  }

  .mask {
    position: fixed;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    top: 0;
    display: none;
    z-index: 98;
  }

  .auth_content {
    padding: 32rpx;
    position: relative;
    z-index: 99;
    background: #fff;
    border-radius: 16rpx 16rpx 0 0;

    .auth_top {
      .ptitle {
        font-size: 30rpx;
        font-weight: bold;
        margin-bottom: 24rpx;
      }

      .txt {
        font-size: 26rpx;
        color: #999;
      }

      .close {
        position: absolute;
        right: 0;
        top: 0;
        width: 26rpx;
        height: 26rpx;
      }
    }

    .auth_ul {
      margin-top: 16rpx;

      .auth_li {
        display: flex;
        align-items: center;
        border-top: 1px solid #f5f5f5;
        padding: 24rpx 0;

        &:last-child {
          border-bottom: 1px solid #f5f5f5;
        }

        .tit {
          width: 140rpx;
          font-size: 30rpx;
        }

        .rit {
          input {
            font-size: 28rpx;
            width: 100%;
          }

          button {
            width: 100%;
            background: #fff;
          }

          button:after {
            border: none;
          }
        }
      }
    }

    .confirm_btn {
      width: 420rpx;
      margin: 46rpx auto 0;
      background: #39b54a;
      color: #fff;
      border-radius: 8rpx;
      height: 94rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
    }
  }
}
</style>
