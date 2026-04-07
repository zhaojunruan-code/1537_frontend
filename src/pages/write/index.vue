<template>
  <view class="write-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">AI 帮写作文</text>
    </view>

    <view class="page-body">
      <!-- 输入区域 -->
      <template v-if="!result">
        <view class="input-card">
          <textarea
            v-model="prompt"
            placeholder="请输入作文题目、要求或大纲..."
            class="prompt-input"
            :maxlength="-1"
          />

          <view class="image-area">
            <view v-for="(img, i) in images" :key="i" class="image-item">
              <image :src="img" mode="aspectFill" class="preview-img" />
              <view class="remove-btn" @click="removeImage(i)">
                <wd-icon name="close" size="24" color="#ffffff" />
              </view>
            </view>

            <view class="add-image-btn" @click="chooseImage">
              <wd-icon name="picture" size="48" color="#cccccc" />
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>

        <button
          class="submit-btn"
          :class="{ disabled: loading || (!prompt && images.length === 0) }"
          :disabled="loading || (!prompt && images.length === 0)"
          @click="handleSubmit"
        >
          <wd-icon v-if="loading" name="loading" size="40" color="#ffffff" class="spin" />
          <wd-icon v-else name="arrow-right" size="40" color="#ffffff" />
          <text class="submit-text">{{ loading ? 'AI 正在构思中...' : '开始生成' }}</text>
        </button>
      </template>

      <!-- 结果区域 -->
      <template v-else>
        <view class="result-card">
          <rich-text :nodes="renderedResult" class="result-content" />
          <button class="retry-btn" @click="result = ''">重新生成</button>
        </view>
      </template>
    </view>

    <view style="height: 140rpx;"></view>
    <CustomTabbar />
  </view>
</template>

<script setup>
import { generateEssay } from '@/services/ai'
import { useRecordStore } from '@/store/useRecordStore'
import CustomTabbar from '@/components/CustomTabbar/index.vue'

const recordStore = useRecordStore()

const prompt = ref('')
const images = ref([])
const loading = ref(false)
const result = ref('')

const renderedResult = computed(() => {
  const text = result.value || ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  return `<div style="font-size:28rpx;color:#333;line-height:1.8;">${escaped}</div>`
})

const chooseImage = () => {
  uni.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      res.tempFilePaths.forEach((path) => {
        readFileAsBase64(path)
      })
    }
  })
}

const readFileAsBase64 = (filePath) => {
  // #ifdef H5
  images.value.push(filePath)
  // #endif
  // #ifndef H5
  uni.getFileSystemManager().readFile({
    filePath,
    encoding: 'base64',
    success(res) {
      const ext = filePath.split('.').pop().toLowerCase()
      const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }
      const mime = mimeMap[ext] || 'image/jpeg'
      images.value.push(`data:${mime};base64,${res.data}`)
    }
  })
  // #endif
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!prompt.value && images.value.length === 0) return
  loading.value = true
  result.value = ''
  try {
    const res = await generateEssay(prompt.value, images.value)
    result.value = res

    const newRecord = {
      id: Date.now().toString(),
      type: 'write',
      title: prompt.value ? `写作：${prompt.value.slice(0, 10)}...` : '看图写作',
      date: new Date().toLocaleDateString(),
      summary: res.slice(0, 50) + '...',
      result: res
    }
    recordStore.addRecord(newRecord)
  } catch (error) {
    uni.showToast({ title: '生成失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.write-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  background: #ffffff;
  padding: 80rpx 32rpx 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.page-body {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
}

.prompt-input {
  width: 100%;
  height: 240rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.image-area {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx solid #eeeeee;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  border: 2rpx dashed #dddddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-text {
  font-size: 20rpx;
  color: #cccccc;
  margin-top: 4rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: #3b82f6;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
}

.submit-btn.disabled {
  background: #93c5fd;
}

.submit-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.result-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx;
}

.result-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
}

.retry-btn {
  margin-top: 40rpx;
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #666666;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
