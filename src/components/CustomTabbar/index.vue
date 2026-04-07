<!--
  description: 自定义tabbar
-->
<template>
  <view
    class="tabbar-container"
    :style="{ paddingBottom: safeAreaBottom + 'px' }"
  >
    <view
      class="tabbar-item"
      v-for="(item, index) in tabbarList"
      :key="index"
      :style="{ width: `calc(100%/${tabbarList.length})` }"
      @click="useTabbar.handleChangeTabbar(item)"
    >
      <view class="item-icon">
        <wd-icon :name="item.icon" :size="44" :color="current == item.id ? '#07C160' : '#999999'" />
      </view>
      <view
        class="item-label"
        :class="[current == item.id ? 'item-active' : '']"
      >
        <text>{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>
<script setup>
import { useTabbarStore } from "@/store/useTabbarStore"

defineOptions({ name: "CustomTabbar" })

const useTabbar = useTabbarStore()

const tabbarList = [
  {
    id: 0,
    path: "/pages/index/index",
    icon: "home",
    text: "首页",
    centerItem: false,
  },
  {
    id: 1,
    path: "/pages/write/index",
    icon: "edit",
    text: "写作文",
    centerItem: false,
  },
  {
    id: 2,
    path: "/pages/recharge/index",
    icon: "credit-card",
    text: "会员",
    centerItem: false,
  },
  {
    id: 3,
    path: "/pages/profile/index",
    icon: "user",
    text: "我的",
    centerItem: false,
  },
]

const safeAreaBottom = ref(0)

const updateCurrentTab = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = currentPage.route

  const normalizedRoute = route.startsWith("/") ? route : `/${route}`

  const found = tabbarList.find((i) => i.path === normalizedRoute)

  if (found) {
    useTabbar.tabbarIndex = found.id
  }
}

onMounted(() => {
  uni.hideTabBar()

  const systemInfo = uni.getSystemInfoSync()
  if (systemInfo.safeAreaInsets) {
    safeAreaBottom.value = systemInfo.safeAreaInsets.bottom || 0
  }

  updateCurrentTab()
})

onShow(() => {
  updateCurrentTab()
})

const current = computed(() => useTabbar.tabbarIndex)
</script>
<style scoped lang="scss">
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  min-height: 110rpx;
  box-shadow: 0 -2rpx 10rpx 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 5rpx 0;
  z-index: 1000;
  background-color: #ffffff;
  box-sizing: border-box;
  border-top: 1rpx solid #f0f0f0;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.item-icon {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-label {
  font-size: 20rpx;
  color: #999999;
  margin-top: 4rpx;
}

.item-active {
  color: #07C160;
}
</style>
