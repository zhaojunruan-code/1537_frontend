<template>
  <view class="history-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <wd-icon name="arrow-left" size="44" color="#666666" />
      </view>
      <text class="nav-title">历史记录</text>
    </view>

    <view class="page-body">
      <view v-if="records.length === 0" class="empty-state">
        <wd-icon name="file" size="96" color="#dddddd" />
        <text class="empty-text">暂无记录</text>
      </view>

      <view v-else class="record-list">
        <view
          v-for="record in records"
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
  </view>
</template>

<script setup>
import { useRecordStore } from '@/store/useRecordStore'

const recordStore = useRecordStore()
const records = computed(() => recordStore.records)

const goBack = () => {
  uni.navigateBack()
}

const goToRecord = (id) => {
  uni.navigateTo({ url: `/pages/record-detail/index?id=${id}` })
}
</script>

<style scoped lang="scss">
.history-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  background: #ffffff;
  padding: 80rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-back {
  padding: 8rpx;
  margin-left: -16rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
  text-align: center;
  margin-right: 60rpx;
}

.page-body {
  padding: 24rpx 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #cccccc;
  margin-top: 20rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #ffffff;
  padding: 28rpx;
  border-radius: 20rpx;
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

.blue-bg {
  background: #eff6ff;
}

.orange-bg {
  background: #fff7ed;
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
  font-size: 28rpx;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
