<!--
  description: 水平滚动
-->
<script setup>
import { useSystemInfo } from "@/hooks/useSystemInfo"

defineOptions({name: 'HorizonScroll'})

const devWidth = ref(0)

onMounted(async () => {
  const result = await useSystemInfo()
  devWidth.value = result.windowWidth
})
</script>

<template>
  <view class="horScrollX-wrapper">
    <scroll-view class="scroll-container" scroll-left="0" scroll-x="true">
      <view class="scroll-box">
        <slot></slot>
      </view>
    </scroll-view>
  </view>
</template>
<style lang="scss">
.uni-scroll-view {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
<style scoped lang="scss">
.horScrollX-wrapper {
  font-size: 27rpx;
  width: v-bind(devWidth) px;
  box-sizing: border-box;

  .scroll-box {
    display: flex;
    align-items: center;
  }
}
</style>
