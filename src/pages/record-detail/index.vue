<template>
  <view class="detail-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <wd-icon name="arrow-left" size="44" color="#666666" />
      </view>
      <text class="nav-title">记录详情</text>
    </view>

    <view class="page-body">
      <!-- 不存在 -->
      <view v-if="!record" class="empty-state">
        <text class="empty-text">记录不存在或已被删除</text>
      </view>

      <!-- 导出按钮（悬浮） -->
      <view v-if="record" class="export-bar">
        <button class="export-btn" @click="handleExport('pdf')">
          <wd-icon name="file" size="32" color="#ffffff" />
          <text class="export-btn-text">导出PDF</text>
        </button>
        <button class="export-btn export-btn-word" @click="handleExport('docx')">
          <wd-icon name="file" size="32" color="#ffffff" />
          <text class="export-btn-text">导出Word</text>
        </button>
      </view>

      <!-- 帮写记录 -->
      <template v-else-if="record.type === 'write'">
        <view class="write-card">
          <text class="write-title">{{ record.title }}</text>
          <text class="write-date">{{ record.date }}</text>
          <rich-text :nodes="renderedWriteResult" class="write-content" />
        </view>
      </template>

      <!-- 批改记录 -->
      <template v-else>
        <!-- 分数卡 -->
        <view class="score-card">
          <view class="score-row">
            <view>
              <text class="score-label">学生姓名</text>
              <text class="score-name">{{ record.result?.studentName || '未知' }}</text>
            </view>
            <view class="score-right">
              <text class="score-label">最终得分</text>
              <view class="score-num-row">
                <text class="score-num">{{ record.result?.score || 0 }}</text>
                <text class="score-unit">分</text>
              </view>
            </view>
          </view>
          <view class="divider"></view>
          <view>
            <text class="comment-title">老师评语</text>
            <text class="comment-text">{{ record.result?.summary || record.summary || '暂无评语' }}</text>
          </view>
        </view>

        <!-- 逐句批改 -->
        <view class="annotations-card">
          <text class="section-title">逐句批改详情</text>
          <view class="ann-list">
            <view
              v-for="(ann, i) in record.result?.annotations"
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
        <view v-if="record.result?.modelEssay" class="essay-card">
          <text class="section-title">修改后范文</text>
          <view class="essay-content">
            <text class="essay-text">{{ record.result.modelEssay }}</text>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { useRecordStore } from '@/store/useRecordStore'

const recordStore = useRecordStore()

const recordId = ref('')
const record = computed(() => recordStore.getRecordById(recordId.value))

const renderedWriteResult = computed(() => {
  const text = record.value?.result || ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  return `<div style="font-size:28rpx;color:#333;line-height:1.8;">${escaped}</div>`
})

onLoad((options) => {
  recordId.value = options.id || ''
})

const goBack = () => {
  uni.navigateBack()
}

const handleExport = (format) => {
  uni.showToast({ title: `导出${format.toUpperCase()}功能需要后端支持`, icon: 'none' })
  // TODO: 调用后端导出接口
  // POST /api/export/create { recordId, format }
  // 轮询 GET /api/export/status/{exportId}
  // 成功后打开下载链接
}
</script>

<style scoped lang="scss">
.detail-page {
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
  padding: 24rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #cccccc;
}

/* 帮写样式 */
.write-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx;
}

.write-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.write-date {
  font-size: 22rpx;
  color: #cccccc;
  display: block;
  margin-bottom: 24rpx;
}

.write-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
}

/* 批改结果样式 */
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
  color: #f97316;
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

/* 导出按钮 */
.export-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.export-btn {
  flex: 1;
  height: 80rpx;
  background: #07C160;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border: none;
}

.export-btn-word {
  background: #3b82f6;
}

.export-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
}
</style>
