<template>
  <view class="home-page">
    <!-- 顶部区域 -->
    <view class="header-area">
      <view class="header-content">
        <view class="greeting">
          <text class="greeting-title">你好，{{ userStore.userName }}</text>
          <text class="greeting-desc">今天想写点什么呢？</text>
        </view>
        <view class="avatar-box">
          <wd-icon name="user" size="48" color="#ffffff" />
        </view>
      </view>
    </view>

    <!-- 功能卡片 -->
    <view class="card-area">
      <view class="func-card" @click="goToGrade">
        <view class="card-icon orange-bg">
          <wd-icon name="check" size="48" color="#f97316" />
        </view>
        <view class="card-info">
          <text class="card-title">AI 智能批改</text>
          <text class="card-desc">中文作文批改，英语作文批改，英语读后续写批改</text>
        </view>
      </view>

      <view class="func-card" @click="goToWrite">
        <view class="card-icon blue-bg">
          <wd-icon name="edit" size="48" color="#3b82f6" />
        </view>
        <view class="card-info">
          <text class="card-title">AI 帮写作文</text>
          <text class="card-desc">输入要求或上传图片，AI帮你构思写作</text>
        </view>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-area">
      <view class="recent-header">
        <text class="recent-title">最近记录</text>
        <text class="recent-more" @click="goToHistory">查看全部</text>
      </view>

      <view v-if="recentRecords.length === 0" class="empty-box">
        <wd-icon name="file" size="64" color="#cccccc" />
        <text class="empty-text">暂无记录</text>
      </view>

      <view v-else class="record-list">
        <view
          v-for="record in recentRecords"
          :key="record.id"
          class="record-item"
          @click="goToRecord(record.id)"
        >
          <view :class="['record-icon', record.type === 'write' ? 'blue-bg' : 'orange-bg']">
            <wd-icon :name="record.type === 'write' ? 'edit' : 'check'" size="36" :color="record.type === 'write' ? '#3b82f6' : '#f97316'" />
          </view>
          <view class="record-info">
            <view class="record-top">
              <text class="record-title">{{ record.title }}</text>
              <text class="record-date">{{ record.date }}</text>
            </view>
            <text class="record-summary">{{ record.summary }}</text>
          </view>
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

const recentRecords = computed(() => recordStore.recentRecords)

const goToGrade = () => {
  uni.navigateTo({ url: '/pages/grade/index' })
}

const goToWrite = () => {
  uni.switchTab({ url: '/pages/write/index' })
}

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/history/index' })
}

const goToRecord = (id) => {
  uni.navigateTo({ url: `/pages/record-detail/index?id=${id}` })
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header-area {
  background: #07C160;
  padding: 80rpx 40rpx 120rpx;
  border-radius: 0 0 60rpx 60rpx;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.greeting-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.avatar-box {
  width: 88rpx;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.card-area {
  padding: 0 32rpx;
  margin-top: -60rpx;
  position: relative;
  z-index: 10;
}

.func-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.orange-bg {
  background: #fff7ed;
}

.blue-bg {
  background: #eff6ff;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
}

.card-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

.recent-area {
  padding: 40rpx 32rpx 0;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.recent-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.recent-more {
  font-size: 24rpx;
  color: #999999;
}

.empty-box {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #cccccc;
  margin-top: 16rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #ffffff;
  padding: 28rpx;
  border-radius: 24rpx;
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.record-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8rpx;
}

.record-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  padding-right: 16rpx;
}

.record-date {
  font-size: 20rpx;
  color: #cccccc;
  flex-shrink: 0;
}

.record-summary {
  font-size: 22rpx;
  color: #999999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
</style>
