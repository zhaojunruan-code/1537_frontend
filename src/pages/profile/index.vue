<template>
  <view class="profile-page">
    <!-- 顶部区域 -->
    <view class="profile-header">
      <view class="profile-info">
        <view class="profile-avatar">
          <wd-icon name="user" size="64" color="#ffffff" />
        </view>
        <view class="profile-text">
          <view class="name-row">
            <text class="profile-name">{{ userStore.userName }}</text>
            <wd-icon v-if="userStore.isVip" name="star-on" size="32" color="#fde68a" />
          </view>
          <text class="profile-role">{{ userStore.isVip ? 'VIP会员' : '普通用户' }}</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-area">
      <view class="stats-card">
        <text class="stats-heading">我的数据</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-num">{{ recordStore.gradeCount }}</text>
            <text class="stat-label">批改次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ recordStore.writeCount }}</text>
            <text class="stat-label">帮写次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ recordStore.gradeCount }}</text>
            <text class="stat-label">生成成绩单</text>
          </view>
        </view>
      </view>

      <!-- 菜单 -->
      <view class="menu-card">
        <view class="menu-item" @click="goToHistory">
          <view class="menu-left">
            <wd-icon name="file" size="40" color="#666666" />
            <text class="menu-label">历史记录</text>
          </view>
          <wd-icon name="arrow-right" size="32" color="#cccccc" />
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="handleLogout">
          <view class="menu-left">
            <wd-icon name="close" size="40" color="#ef4444" />
            <text class="menu-label menu-danger">退出登录</text>
          </view>
          <wd-icon name="arrow-right" size="32" color="#cccccc" />
        </view>
      </view>
    </view>

    <view style="height: 140rpx;"></view>
    <CustomTabbar />
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/useUserStore'
import { useRecordStore } from '@/store/useRecordStore'
import CustomTabbar from '@/components/CustomTabbar/index.vue'

const userStore = useUserStore()
const recordStore = useRecordStore()

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/history/index' })
}

const handleLogout = () => {
  userStore.clearUserInfo()
  recordStore.clearRecords()
  uni.reLaunch({ url: '/pages/login/index' })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-header {
  background: #07C160;
  padding: 80rpx 40rpx 140rpx;
  border-radius: 0 0 60rpx 60rpx;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.profile-avatar {
  width: 112rpx;
  height: 112rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.profile-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.profile-role {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 6rpx;
  display: block;
}

.stats-area {
  padding: 0 32rpx;
  margin-top: -80rpx;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.stats-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
}

.stats-heading {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 24rpx;
}

.stats-grid {
  display: flex;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 900;
  color: #333333;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.menu-card {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.menu-danger {
  color: #ef4444;
}

.menu-divider {
  height: 2rpx;
  background: #f5f5f5;
  margin: 0 32rpx;
}
</style>
