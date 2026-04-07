<template>
  <!-- #ifdef APP-ANDROID -->
  <view class="page-container">
    <view
      class="mask"
      :style="{ width: windowWidth + 'px', height: windowHeight + 'px' }"
    >
      <view class="header">
        <text class="header-title">权限说明</text>
        <text class="header-subtitle">为了给您提供更好的服务体验</text>
      </view>

      <view class="permission-list">
        <view
          class="permission-card"
          v-for="(item, index) in showList"
          :key="index"
          :style="{ animationDelay: index * 0.1 + 's' }"
        >
          <view class="card-icon">
            <text class="icon">{{ getIcon(item.name) }}</text>
          </view>
          <view class="card-content">
            <text class="card-title">{{ item.name }}</text>
            <text class="card-description">{{ item.content }}</text>
          </view>
        </view>
      </view>

      <view class="footer-tip">
        <text class="tip-text">💡 您可以随时在系统设置中修改权限</text>
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
// #ifdef APP-ANDROID
import { ref, onMounted } from "vue"
import { onLoad } from "@dcloudio/uni-app"

// 响应式数据
const windowWidth = ref(0)
const windowHeight = ref(0)
const showList = ref([])
const osName = ref("")
const isIos = ref(false)

// 权限列表配置 - 完整的安卓权限列表
const permissionList = {
  // 位置权限
  "android.permission.ACCESS_COARSE_LOCATION": {
    name: "访问粗略地理位置",
    content:
      "用于将服务根据距离排序,并显示与您的距离,不授权该权限会影响app的正常使用",
  },
  "android.permission.ACCESS_FINE_LOCATION": {
    name: "访问精确地理位置",
    content:
      "用于将服务根据距离排序,并显示与您的距离,不授权该权限会影响app的正常使用",
  },
  "android.permission.ACCESS_BACKGROUND_LOCATION": {
    name: "后台访问位置",
    content: "用于在后台持续获取位置信息,提供持续的位置服务",
  },

  // 相机和媒体权限
  "android.permission.CAMERA": {
    name: "使用摄像头权限",
    content: "用于更换、上传您的头像、图片功能,不授权该权限会影响app的正常使用",
  },
  "android.permission.READ_EXTERNAL_STORAGE": {
    name: "读照片及文件权限",
    content: "用于更换、上传您的头像、图片功能,不授权该权限会影响app的正常使用",
  },
  "android.permission.WRITE_EXTERNAL_STORAGE": {
    name: "写照片及文件权限",
    content: "用于更换、上传您的头像、图片功能,不授权该权限会影响app的正常使用",
  },
  "android.permission.READ_MEDIA_IMAGES": {
    name: "读媒体图片权限",
    content: "用于更换、上传您的头像、图片功能,不授权该权限会影响app的正常使用",
  },
  "android.permission.READ_MEDIA_VIDEO": {
    name: "读媒体视频权限",
    content: "用于更换、上传您的视频内容,不授权该权限会影响app的正常使用",
  },
  "android.permission.READ_MEDIA_AUDIO": {
    name: "读媒体音频权限",
    content: "用于访问和播放音频文件,提供音乐播放等功能",
  },

  // 通讯权限
  "android.permission.CALL_PHONE": {
    name: "使用拨打电话权限",
    content: "用于直接拨打您点击的电话号码,不授权该权限将无法拨打",
  },
  "android.permission.READ_PHONE_STATE": {
    name: "读取手机状态权限",
    content: "用于获取设备信息,保障应用正常运行和账号安全",
  },
  "android.permission.READ_CALL_LOG": {
    name: "读取通话记录权限",
    content: "用于读取通话记录信息,提供相关功能服务",
  },
  "android.permission.WRITE_CALL_LOG": {
    name: "写入通话记录权限",
    content: "用于写入通话记录信息,提供相关功能服务",
  },
  "android.permission.ADD_VOICEMAIL": {
    name: "添加语音邮件权限",
    content: "用于添加语音邮件到系统中",
  },
  "android.permission.USE_SIP": {
    name: "使用SIP服务权限",
    content: "用于进行网络电话通话功能",
  },
  "android.permission.ANSWER_PHONE_CALLS": {
    name: "接听电话权限",
    content: "用于应用内接听来电功能",
  },

  // 联系人权限
  "android.permission.READ_CONTACTS": {
    name: "读取联系人权限",
    content: "用于读取联系人信息,方便快速添加好友",
  },
  "android.permission.WRITE_CONTACTS": {
    name: "写入联系人权限",
    content: "用于保存和修改联系人信息",
  },
  "android.permission.GET_ACCOUNTS": {
    name: "获取账户信息权限",
    content: "用于获取设备上的账户信息",
  },

  // 短信和彩信权限
  "android.permission.SEND_SMS": {
    name: "发送短信权限",
    content: "用于发送短信验证码等功能",
  },
  "android.permission.RECEIVE_SMS": {
    name: "接收短信权限",
    content: "用于接收短信验证码,自动填充功能",
  },
  "android.permission.READ_SMS": {
    name: "读取短信权限",
    content: "用于读取短信内容,自动识别验证码",
  },
  "android.permission.RECEIVE_WAP_PUSH": {
    name: "接收WAP推送权限",
    content: "用于接收WAP推送消息",
  },
  "android.permission.RECEIVE_MMS": {
    name: "接收彩信权限",
    content: "用于接收彩信消息",
  },

  // 日历权限
  "android.permission.READ_CALENDAR": {
    name: "读取日历权限",
    content: "用于读取日历事件,提供日程提醒功能",
  },
  "android.permission.WRITE_CALENDAR": {
    name: "写入日历权限",
    content: "用于添加和修改日历事件",
  },

  // 音频权限
  "android.permission.RECORD_AUDIO": {
    name: "使用麦克风权限",
    content:
      "用于录制声音,发送语音消息,语音通话,不授权该权限会影响app的正常使用",
  },

  // 传感器权限
  "android.permission.BODY_SENSORS": {
    name: "身体传感器权限",
    content: "用于访问健康和运动传感器数据",
  },
  "android.permission.ACTIVITY_RECOGNITION": {
    name: "活动识别权限",
    content: "用于识别用户的运动状态(步行、跑步等)",
  },

  // 蓝牙权限
  "android.permission.BLUETOOTH": {
    name: "蓝牙权限",
    content: "用于连接蓝牙设备,提供蓝牙相关功能",
  },
  "android.permission.BLUETOOTH_ADMIN": {
    name: "蓝牙管理权限",
    content: "用于管理蓝牙设备的配对和连接",
  },
  "android.permission.BLUETOOTH_CONNECT": {
    name: "蓝牙连接权限",
    content: "用于连接已配对的蓝牙设备",
  },
  "android.permission.BLUETOOTH_SCAN": {
    name: "蓝牙扫描权限",
    content: "用于扫描附近的蓝牙设备",
  },
  "android.permission.BLUETOOTH_ADVERTISE": {
    name: "蓝牙广播权限",
    content: "用于让设备可被其他蓝牙设备发现",
  },

  // 附近设备权限
  "android.permission.NEARBY_WIFI_DEVICES": {
    name: "附近WiFi设备权限",
    content: "用于发现和连接附近的WiFi设备",
  },

  // 通知权限
  "android.permission.POST_NOTIFICATIONS": {
    name: "发送通知权限",
    content: "用于向您发送消息通知和提醒",
  },
}

// 根据权限名称返回对应图标
const getIcon = (name) => {
  if (name.includes("地理位置") || name.includes("位置")) return "📍"
  if (name.includes("摄像头") || name.includes("相机")) return "📷"
  if (
    name.includes("照片") ||
    name.includes("图片") ||
    name.includes("媒体图片")
  )
    return "🖼️"
  if (name.includes("视频")) return "🎬"
  if (name.includes("音频") || name.includes("音乐")) return "🎵"
  if (name.includes("文件") || name.includes("存储")) return "📁"
  if (name.includes("电话") || name.includes("通话")) return "📞"
  if (
    name.includes("麦克风") ||
    name.includes("录音") ||
    name.includes("RECORD_AUDIO")
  )
    return "🎤"
  if (name.includes("联系人")) return "👥"
  if (name.includes("短信") || name.includes("彩信")) return "💬"
  if (name.includes("日历")) return "📅"
  if (name.includes("传感器") || name.includes("活动识别")) return "🏃"
  if (name.includes("蓝牙")) return "📡"
  if (name.includes("通知")) return "🔔"
  if (name.includes("账户")) return "👤"
  if (name.includes("WiFi")) return "📶"
  return "🔐"
}

// 页面加载
onLoad((e) => {
  try {
    const list = e.type ? JSON.parse(e.type) : []
    list.forEach((item) => {
      if (permissionList[item]) {
        showList.value.push(permissionList[item])
      }
    })
  } catch (error) {
    console.log("解析权限列表错误:", error)
  }

  // #ifdef APP
  osName.value = plus.os.name
  isIos.value = osName.value === "iOS"
  // #endif

  const windowinfo = uni.getWindowInfo()
  windowWidth.value = windowinfo.windowWidth
  windowHeight.value = windowinfo.windowHeight
})
// #endif
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100%;
  background: transparent;
}

.mask {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.4);
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  animation: fadeInDown 0.6s ease-out;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.header-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.permission-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.permission-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  animation: fadeInUp 0.6s ease-out backwards;
  transition: all 0.3s ease;
}

.permission-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon {
  font-size: 40rpx;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1.4;
}

.card-description {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

.footer-tip {
  margin-top: 40rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  backdrop-filter: blur(10rpx);
  animation: fadeIn 0.6s ease-out 0.3s backwards;
}

.tip-text {
  display: block;
  font-size: 24rpx;
  color: #ffffff;
  text-align: center;
  line-height: 1.6;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
