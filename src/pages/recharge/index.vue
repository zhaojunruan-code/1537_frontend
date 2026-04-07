<template>
  <view class="recharge-page">
    <!-- 顶部 VIP 区域 -->
    <view class="vip-header">
      <view class="vip-info">
        <view class="vip-avatar">
          <view class="avatar-inner">
            <wd-icon name="star-on" size="48" color="#eab308" />
          </view>
        </view>
        <view class="vip-text">
          <text class="vip-name">{{ userStore.userName }}</text>
          <text class="vip-status">{{ userStore.isVip ? '尊贵的VIP会员，您好！' : '开通VIP，畅享无限次智能批改' }}</text>
        </view>
      </view>
    </view>

    <!-- 套餐选择 -->
    <view class="plan-area">
      <view class="plan-card">
        <text class="plan-heading">选择会员套餐</text>

        <view class="plan-list">
          <view
            v-for="plan in plans"
            :key="plan.id"
            :class="['plan-item', selected === plan.id ? 'plan-selected' : '']"
            @click="selected = plan.id"
          >
            <view v-if="selected === plan.id" class="selected-badge">
              <text>已选</text>
            </view>
            <view class="plan-row">
              <view>
                <text class="plan-name">{{ plan.name }}</text>
                <text class="plan-desc">{{ plan.desc }}</text>
              </view>
              <view class="plan-price-area">
                <view class="plan-price-row">
                  <text class="currency">¥</text>
                  <text class="plan-price">{{ plan.price }}</text>
                </view>
                <text class="plan-original">¥{{ plan.original }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- VIP特权 -->
        <view class="privilege-area">
          <text class="privilege-title">VIP特权</text>
          <view class="privilege-grid">
            <view class="privilege-item" v-for="(p, i) in privileges" :key="i">
              <wd-icon name="check" size="28" color="#eab308" />
              <text class="privilege-text">{{ p }}</text>
            </view>
          </view>
        </view>

        <button class="pay-btn" @click="handlePay">立即开通</button>
      </view>
    </view>

    <view style="height: 140rpx;"></view>
    <CustomTabbar />
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/useUserStore'
import CustomTabbar from '@/components/CustomTabbar/index.vue'

const userStore = useUserStore()

const selected = ref(1)

const plans = [
  { id: 1, name: '连续包月', price: '19', original: '29', desc: '首月特惠，自动续费' },
  { id: 2, name: '季度会员', price: '58', original: '88', desc: '低至19.3元/月' },
  { id: 3, name: '年度会员', price: '198', original: '348', desc: '低至16.5元/月，最划算' },
]

const privileges = ['无限次AI批改', '无限次AI帮写', '专属成绩单导出', '优先极速响应']

const handlePay = () => {
  uni.showToast({ title: '模拟支付成功！您已成为VIP会员。', icon: 'none' })
  userStore.setVip(true)
}
</script>

<style scoped lang="scss">
.recharge-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.vip-header {
  background: #2C2C2C;
  padding: 80rpx 40rpx 140rpx;
  border-radius: 0 0 60rpx 60rpx;
}

.vip-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.vip-avatar {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #fde68a, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rpx;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  background: #2C2C2C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #eab308;
  display: block;
}

.vip-status {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 6rpx;
  display: block;
}

.plan-area {
  padding: 0 32rpx;
  margin-top: -80rpx;
  position: relative;
  z-index: 10;
}

.plan-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.plan-heading {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 24rpx;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.plan-item {
  border: 3rpx solid #f3f4f6;
  border-radius: 20rpx;
  padding: 28rpx;
  position: relative;
  overflow: hidden;
}

.plan-selected {
  border-color: #eab308;
  background: #fffbeb;
}

.selected-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #eab308;
  padding: 4rpx 16rpx;
  border-radius: 0 0 0 16rpx;
  font-size: 18rpx;
  font-weight: bold;
  color: #ffffff;
}

.plan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
}

.plan-desc {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
  display: block;
}

.plan-price-area {
  text-align: right;
}

.plan-price-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  color: #d97706;
  justify-content: flex-end;
}

.currency {
  font-size: 24rpx;
}

.plan-price {
  font-size: 44rpx;
  font-weight: 900;
}

.plan-original {
  font-size: 20rpx;
  color: #cccccc;
  text-decoration: line-through;
}

.privilege-area {
  margin-top: 48rpx;
}

.privilege-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.privilege-grid {
  display: flex;
  flex-wrap: wrap;
}

.privilege-item {
  width: 50%;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.privilege-text {
  font-size: 22rpx;
  color: #666666;
}

.pay-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #fbbf24, #d97706);
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  border: none;
  margin-top: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(217, 119, 6, 0.3);
}
</style>
