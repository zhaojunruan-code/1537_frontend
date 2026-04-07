<!--
  description: 自动避开顶部状态栏区域
-->
<template>
  <view
    class="safe-top-container"
    :style="fixedLayoutStyle"
    :class="{ 'fixed-wrapper': fixed }"
  >
    <view class="inner-box">
      <slot></slot>
    </view>
  </view>
  <view
    v-if="fixed && showPlaceholder"
    :style="{ height: `${safeTop + 44}px` }"
  ></view>
</template>
<script setup>
defineOptions({name: 'SafeTopContainer'})

const props = defineProps({
  // 固定在顶部
  fixed: {
    type: Boolean,
    default: false,
  },
  // 背景色
  bgColor: {
    type: String,
    default: "#ffffff",
  },
  // 是否显示背景色
  showBgColor: {
    type: Boolean,
    default: true,
  },
  // 显示占位（如果开启固定到顶部可能会用到）
  showPlaceholder: {
    type: Boolean,
    default: true,
  },
})

const safeTop = ref(0)

const fixedLayoutStyle = computed(() => ({
  paddingTop: `${safeTop.value}px`,
  backgroundColor: props.showBgColor ? props.bgColor : "transparent",
}))

onMounted(() => {
  const { statusBarHeight } = uni.getSystemInfoSync()
  safeTop.value = statusBarHeight
})
</script>
<style scoped lang="scss">
.fixed-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1145;
}
</style>
