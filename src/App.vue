<template></template>
<script setup>

onLaunch(() => {
  const { platform } = uni.getSystemInfoSync()

  if (platform === "android") {
    const permissionListener = uni.createRequestPermissionListener()

    permissionListener.onConfirm((e) => {
      console.log("权限类型: ", e)
      uni.navigateTo({
        url: "/pages/auth/index" + "?type=" + JSON.stringify(e),
        complete(e) {
          console.log(e)
        },
      })
    })
    permissionListener.onComplete((e) => {
      console.log("权限申请完成")
      // 拒绝时也会走需要处理一下，提示拒绝手动开启
      const pages = getCurrentPages()
      const currentPages = pages[pages.length - 1]

      console.log("当前页面: ", currentPages.route)

      if (currentPages.route === "pages/auth/index") {
        uni.navigateBack()
      }
    })
  }
})

</script>
<style lang="scss">
@import '@/style/index.scss';
@import "@/uni.scss";

// test

button::after {
	border: none;
}

swiper,
scroll-view {
	flex: 1;
	height: 100%;
	overflow: hidden;
}

image {
	width: 100%;
	height: 100%;
	vertical-align: middle;
}

.ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ellipsis-2 {
	display: -webkit-box;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.ellipsis-3 {
	display: -webkit-box;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}
</style>
