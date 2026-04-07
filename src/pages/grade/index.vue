<template>
  <view class="grade-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <wd-icon name="arrow-left" size="44" color="#666666" />
      </view>
      <text class="nav-title">AI 智能批改</text>
    </view>

    <view class="page-body">
      <!-- 输入区域 -->
      <template v-if="results.length === 0">
        <!-- 批改类型 -->
        <scroll-view scroll-x class="type-scroll">
          <view class="type-list">
            <view
              v-for="t in gradingTypes"
              :key="t.id"
              :class="['type-tag', gradingType === t.id ? 'type-active' : '']"
              @click="gradingType = t.id"
            >
              <text>{{ t.label }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 批改标准 -->
        <view class="standard-card">
          <text class="card-label">批改标准</text>
          <view class="standard-btns">
            <view
              :class="['std-btn', gradingStandard === 'gaokao' ? 'std-active' : '']"
              @click="gradingStandard = 'gaokao'"
            >
              <text>高考标准</text>
            </view>
            <view
              :class="['std-btn', gradingStandard === 'custom' ? 'std-active' : '']"
              @click="gradingStandard = 'custom'"
            >
              <text>自定义标准</text>
            </view>
          </view>
          <textarea
            v-if="gradingStandard === 'custom'"
            v-model="customStandardText"
            placeholder="请输入您的自定义批改标准..."
            class="custom-input"
            :maxlength="-1"
          />
        </view>

        <!-- 图片上传 -->
        <view class="upload-card">
          <view class="image-grid">
            <view v-for="(img, i) in images" :key="i" class="grid-image-item">
              <image :src="img" mode="aspectFill" class="grid-img" />
              <view class="remove-btn" @click="removeImage(i)">
                <wd-icon name="close" size="28" color="#ffffff" />
              </view>
            </view>
            <view class="grid-add-btn" @click="chooseImage">
              <wd-icon name="camera" size="56" color="#07C160" />
              <text class="add-main-text">拍照/上传作文</text>
              <text class="add-sub-text">支持多张批量批改</text>
            </view>
          </view>
        </view>

        <button
          class="grade-btn"
          :class="{ disabled: loading || images.length === 0 }"
          :disabled="loading || images.length === 0"
          @click="handleGrade"
        >
          <wd-icon v-if="loading" name="loading" size="40" color="#ffffff" class="spin" />
          <wd-icon v-else name="check" size="40" color="#ffffff" />
          <text class="grade-btn-text">{{ loading ? 'AI 老师正在批改中...' : '开始批量批改' }}</text>
        </button>
      </template>

      <!-- 结果区域 -->
      <template v-else>
        <!-- 批量成绩单 -->
        <view v-if="results.length > 1" class="batch-card">
          <text class="batch-title">批量批改成绩单 ({{ results.length }}份)</text>
          <scroll-view scroll-x class="batch-scroll">
            <view class="batch-list">
              <view
                v-for="(res, idx) in results"
                :key="idx"
                :class="['batch-item', currentResultIndex === idx ? 'batch-active' : '']"
                @click="currentResultIndex = idx"
              >
                <text class="batch-name">{{ res?.studentName || '未知' }}</text>
                <text :class="['batch-score', currentResultIndex === idx ? 'score-active' : '']">{{ res?.score || 0 }}分</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 分数卡 -->
        <template v-if="currentResult">
          <view class="score-card">
            <view class="score-row">
              <view>
                <text class="score-label">学生姓名</text>
                <text class="score-name">{{ currentResult?.studentName || '未知' }}</text>
              </view>
              <view class="score-right">
                <text class="score-label">最终得分</text>
                <view class="score-num-row">
                  <text class="score-num">{{ currentResult?.score || 0 }}</text>
                  <text class="score-unit">分</text>
                </view>
              </view>
            </view>
            <view class="divider"></view>
            <view class="comment-section">
              <text class="comment-title">老师评语</text>
              <text class="comment-text">{{ currentResult?.summary || '暂无评语' }}</text>
            </view>
          </view>

          <!-- 逐句批改 -->
          <view class="annotations-card">
            <text class="section-title">逐句批改详情</text>
            <view class="ann-list">
              <view
                v-for="(ann, i) in currentResult?.annotations"
                :key="i"
                :class="['ann-item', ann.type === 'highlight' ? 'ann-highlight' : 'ann-issue']"
              >
                <view class="ann-header">
                  <text :class="['ann-tag', ann.type === 'highlight' ? 'tag-highlight' : 'tag-issue']">
                    {{ ann.type === 'highlight' ? '好句' : '原句' }}
                  </text>
                  <text class="ann-sentence">{{ ann.originalSentence }}</text>
                </view>
                <view class="ann-details">
                  <template v-if="ann.type === 'highlight'">
                    <view class="detail-row">
                      <text class="detail-tag tag-comment">点评</text>
                      <text class="detail-text">{{ ann.reason }}</text>
                    </view>
                  </template>
                  <template v-else>
                    <view v-if="ann.issue" class="detail-row">
                      <text class="detail-tag tag-problem">问题</text>
                      <text class="detail-text">{{ ann.issue }}</text>
                    </view>
                    <view v-if="ann.suggestion" class="detail-row">
                      <text class="detail-tag tag-suggest">建议</text>
                      <text class="detail-text">{{ ann.suggestion }}</text>
                    </view>
                    <view v-if="ann.correctedSentence" class="detail-row">
                      <text class="detail-tag tag-fix">修改</text>
                      <text class="detail-text detail-bold">{{ ann.correctedSentence }}</text>
                    </view>
                  </template>
                </view>
              </view>
            </view>
          </view>

          <!-- 范文 -->
          <view v-if="currentResult?.modelEssay" class="essay-card">
            <text class="section-title">修改后范文</text>
            <view class="essay-content">
              <text class="essay-text">{{ currentResult.modelEssay }}</text>
            </view>
          </view>
        </template>

        <button class="retry-btn" @click="resetGrade">继续批改下一批</button>
      </template>
    </view>
  </view>
</template>

<script setup>
import { gradeEssay } from '@/services/ai'
import { useRecordStore } from '@/store/useRecordStore'

const recordStore = useRecordStore()

const gradingTypes = [
  { id: 'chinese', label: '中文作文批改' },
  { id: 'english', label: '英语作文批改' },
  { id: 'english-continuation', label: '英语读后续写批改' }
]

const images = ref([])
const loading = ref(false)
const results = ref([])
const currentResultIndex = ref(0)
const gradingType = ref('chinese')
const gradingStandard = ref('gaokao')
const customStandardText = ref('')

const currentResult = computed(() => results.value[currentResultIndex.value])

const goBack = () => {
  uni.navigateBack()
}

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

const handleGrade = async () => {
  if (images.value.length === 0) return
  if (gradingStandard.value === 'custom' && !customStandardText.value.trim()) {
    uni.showToast({ title: '请输入自定义批改标准', icon: 'none' })
    return
  }
  loading.value = true
  results.value = []
  currentResultIndex.value = 0

  try {
    const promises = images.value.map(img =>
      gradeEssay('', [img], gradingType.value, gradingStandard.value, customStandardText.value)
    )
    const res = await Promise.all(promises)
    results.value = res

    const newRecords = res.map((r, idx) => ({
      id: Date.now().toString() + idx,
      type: 'grade',
      title: `批改：${r?.studentName || '未知'}的作文`,
      date: new Date().toLocaleDateString(),
      summary: `得分：${r?.score || 0}分。${(r?.summary || '').slice(0, 30)}...`,
      result: r
    }))
    recordStore.addRecords(newRecords)
  } catch (error) {
    uni.showToast({ title: '批改失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const resetGrade = () => {
  results.value = []
  images.value = []
}
</script>

<style scoped lang="scss">
.grade-page {
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
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.type-scroll {
  white-space: nowrap;
  padding-bottom: 8rpx;
}

.type-list {
  display: flex;
  gap: 16rpx;
}

.type-tag {
  padding: 16rpx 28rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 500;
  background: #ffffff;
  color: #666666;
  border: 2rpx solid #eeeeee;
  flex-shrink: 0;
  display: inline-block;
}

.type-active {
  background: #07C160;
  color: #ffffff;
  border-color: #07C160;
}

.standard-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.card-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.standard-btns {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.std-btn {
  flex: 1;
  padding: 18rpx 0;
  border-radius: 20rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 500;
  background: #f5f5f5;
  color: #666666;
  border: 2rpx solid transparent;
}

.std-active {
  background: #f0fdf4;
  border-color: #07C160;
  color: #07C160;
}

.custom-input {
  width: 100%;
  height: 180rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #333333;
  border: 2rpx solid #eeeeee;
}

.upload-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.grid-image-item {
  position: relative;
  width: calc(50% - 8rpx);
  aspect-ratio: 3/4;
  border-radius: 20rpx;
  overflow: hidden;
  border: 2rpx solid #eeeeee;
}

.grid-img {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 44rpx;
  height: 44rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-add-btn {
  width: calc(50% - 8rpx);
  aspect-ratio: 3/4;
  border-radius: 20rpx;
  border: 3rpx dashed #dddddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-main-text {
  font-size: 22rpx;
  font-weight: 500;
  color: #999999;
  margin-top: 12rpx;
}

.add-sub-text {
  font-size: 18rpx;
  color: #cccccc;
  margin-top: 4rpx;
}

.grade-btn {
  width: 100%;
  height: 96rpx;
  background: #07C160;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3);
}

.grade-btn.disabled {
  background: #81d8a2;
}

.grade-btn-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 结果样式 */
.batch-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.batch-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.batch-scroll {
  white-space: nowrap;
}

.batch-list {
  display: flex;
  gap: 16rpx;
}

.batch-item {
  flex-shrink: 0;
  width: 180rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  border: 2rpx solid #eeeeee;
  background: #ffffff;
  display: inline-block;
  text-align: center;
}

.batch-active {
  border-color: #07C160;
  background: #f0fdf4;
}

.batch-name {
  font-size: 22rpx;
  color: #999999;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-score {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-top: 8rpx;
}

.score-active {
  color: #07C160;
}

.score-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  position: relative;
  overflow: hidden;
}

.score-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.score-label {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.score-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-top: 8rpx;
}

.score-right {
  text-align: right;
}

.score-num-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  color: #07C160;
  justify-content: flex-end;
}

.score-num {
  font-size: 72rpx;
  font-weight: 900;
}

.score-unit {
  font-size: 24rpx;
  font-weight: bold;
}

.divider {
  height: 2rpx;
  background: #f5f5f5;
  margin: 28rpx 0;
}

.comment-section {}

.comment-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.comment-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
  display: block;
}

.annotations-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 24rpx;
}

.ann-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.ann-item {
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid;
}

.ann-highlight {
  background: #eff6ff;
  border-color: #dbeafe;
}

.ann-issue {
  background: #f9fafb;
  border-color: #f3f4f6;
}

.ann-header {
  padding-bottom: 16rpx;
  margin-bottom: 16rpx;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
}

.ann-tag {
  display: inline-block;
  padding: 2rpx 12rpx;
  font-size: 18rpx;
  font-weight: bold;
  border-radius: 6rpx;
  margin-bottom: 8rpx;
}

.tag-highlight {
  background: #bfdbfe;
  color: #1d4ed8;
}

.tag-issue {
  background: #e5e7eb;
  color: #4b5563;
}

.ann-sentence {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  display: block;
}

.ann-details {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-row {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.detail-tag {
  display: inline-block;
  padding: 2rpx 12rpx;
  font-size: 18rpx;
  font-weight: bold;
  border-radius: 6rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.tag-comment {
  background: #dbeafe;
  color: #2563eb;
}

.tag-problem {
  background: #fee2e2;
  color: #dc2626;
}

.tag-suggest {
  background: #fef3c7;
  color: #d97706;
}

.tag-fix {
  background: #d1fae5;
  color: #059669;
}

.detail-text {
  font-size: 22rpx;
  color: #666666;
  line-height: 1.6;
  flex: 1;
}

.detail-bold {
  font-weight: 500;
}

.essay-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.essay-content {
  background: #faf5ff;
  border-radius: 20rpx;
  padding: 28rpx;
  border: 2rpx solid #e9d5ff;
}

.essay-text {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.retry-btn {
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
  margin-top: 12rpx;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
