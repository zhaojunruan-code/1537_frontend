<template>
  <view class="waterfall-list">
    <view
      class="waterfall-column"
      v-for="(column, index) in columns"
      :key="index"
      :style="{ width: `calc(100%/${columnCount})` }"
    >
      <view
        v-for="(item, cI) in column"
        :key="cI"
        :style="{ margin: `${gap}px` }"
      >
        <slot :item="item"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>

defineOptions({name: 'WaterfallList'})

const props = defineProps({
  // 数据列表
  items: {
    type: Array,
    default: () => [],
  },
  // 列数
  columnCount: {
    type: Number,
    default: 2, // 默认两列
  },
  // 每个子元素的间隔
  gap: {
    type: Number,
    default: 10, // 默认间隔为 10px
  },
})

const columns = ref([])

// 分配每列数据
const distributeItems = () => {
  columns.value = Array.from({ length: props.columnCount }, () => [])
  props.items.forEach((item, index) => {
    columns.value[index % props.columnCount].push(item)
  })
}

onMounted(() => {
  distributeItems()
})
</script>

<style scoped>
.waterfall-list {
  display: flex;
  justify-content: space-between;
}

.waterfall-column {
  flex: 1;
  margin-right: 10px;
}

.waterfall-column:last-child {
  margin-right: 0;
}
</style>
