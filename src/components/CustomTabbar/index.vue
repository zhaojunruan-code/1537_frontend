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
      :class="[item.centerItem ? 'center-item' : '']"
      :style="{ width: `calc(100%/${tabbarList.length})` }"
      @click="useTabbar.handleChangeTabbar(item)"
    >
      <view class="item-top">
        <image
          :src="current == item.id ? item.selectIcon : item.icon"
          mode="widthFix"
        />
      </view>
      <view
        class="item-bottom"
        :class="[current == item.id ? 'item-active' : '']"
      >
        <text>{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>
<script setup>
import { useTabbarStore } from "@/store/useTabbarStore"
import { useUserStore } from "@/store/useUserStore"

defineProps({
  fixed: Boolean,
})

defineOptions({ name: "CustomTabbar" })

const useTabbar = useTabbarStore()

const tabbarList = [
  {
    id: 0,
    path: "/pages/home/index",
    icon: "/static/tabbar/home.png",
    selectIcon: "/static/tabbar/home_a.png",
    text: "首页",
    centerItem: false,
  },
  {
    id: 1,
    path: "/pages/message/index",
    icon: "/static/tabbar/msg.png",
    selectIcon: "/static/tabbar/msg_a.png",
    text: "消息",
    centerItem: false,
  },
  {
    id: 2,
    path: "/pages/mine/index",
    icon: "/static/tabbar/my.png",
    selectIcon: "/static/tabbar/my_a.png",
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

  const tabbarItem = tabbarList.value.find((i) => i.path === normalizedRoute)

  if (tabbarItem) {
    useTabbar.handleChangeTabbar(tabbarItem)
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
view {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  min-height: 110rpx;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  padding: 5rpx 0;
  color: #000000;
  z-index: 1000;
  background-color: #ffffff;
  box-sizing: border-box;
}

.tabbar-container .tabbar-item {
  width: 20%;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.tabbar-container .item-active {
  color: #27A046;
}

.tabbar-container .center-item {
  display: block;
  position: relative;
  box-sizing: border-box;
}

.tabbar-container .tabbar-item .item-top {
  width: 80rpx;
  height: 80rpx;
  padding: 10rpx;
}

.tabbar-container .center-item .item-top {
  flex-shrink: 0;
  width: 100rpx;
  height: 100rpx;
  position: absolute;
  top: -50rpx;
  left: calc(50% - 50rpx);
  border-radius: 50%;
  background-color: #ffffff;
}

.tabbar-container .tabbar-item .item-top image {
  width: 100%;
  height: 100%;
}

.tabbar-container .tabbar-item .item-bottom {
  font-size: 28rpx;
  width: 100%;
}

.tabbar-container .center-item .item-bottom {
  position: absolute;
  bottom: 5rpx;
}
</style>
