<template>
  <view class="login-page">
    <view class="login-content">
      <view class="logo-area">
        <view class="logo-box">
          <wd-icon name="chat" size="56" color="#ffffff" />
        </view>
        <text class="app-title">AI作文助手</text>
        <text class="app-desc">智能批改，轻松写作</text>
      </view>

      <view class="login-btn-area">
        <button class="wx-login-btn" @click="handleLogin">
          <wd-icon name="chat" size="40" color="#ffffff" />
          <text class="btn-text">微信一键登录</text>
        </button>
        <text class="agreement">登录即代表同意《用户协议》和《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/useUserStore'

const userStore = useUserStore()

const handleLogin = () => {
  userStore.mockLogin('微信用户')
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 60rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 160rpx;
}

.logo-box {
  width: 160rpx;
  height: 160rpx;
  background: #07C160;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.3);
}

.app-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333333;
}

.app-desc {
  font-size: 28rpx;
  color: #999999;
  margin-top: 16rpx;
}

.login-btn-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wx-login-btn {
  width: 100%;
  max-width: 560rpx;
  height: 96rpx;
  background: #07C160;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3);
}

.btn-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
}

.agreement {
  font-size: 22rpx;
  color: #cccccc;
  margin-top: 60rpx;
  text-align: center;
}
</style>
