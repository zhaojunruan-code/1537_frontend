# 通用组件使用说明

## 1. DiagnosisBottomBar - 诊断底部栏组件

### 功能
统一的协议同意+提交按钮组件，适用于所有诊断页面（表单页面和协议页面）。

### 使用示例

```vue
<template>
  <!-- 在表单页面使用（z-paging的#bottom插槽） -->
  <z-paging layout-only>
    <template #bottom>
      <DiagnosisBottomBar
        v-model:agreed="formData.agreedTerms"
        :visible="!hideBottomContent"
        @submit="handleSubmit"
      />
    </template>
  </z-paging>

  <!-- 在协议页面使用（固定定位） -->
  <DiagnosisBottomBar
    v-model:agreed="agreed"
    :visible="!hideBottomContent"
    :fixed="true"
    button-text="同意并继续"
    @submit="handleNext"
  />
</template>
```

### Props
- `agreed` (Boolean): 是否已同意协议
- `visible` (Boolean): 是否显示，默认 true
- `fixed` (Boolean): 是否固定定位，默认 false
- `buttonText` (String): 按钮文本，默认 "下一步"
- `protocolText` (String): 协议文本，默认 "《AI诊断协议》"

### Events
- `update:agreed`: 协议同意状态变化
- `submit`: 点击提交按钮（已自动校验协议同意状态）
- `protocol-click`: 点击协议文本

---

## 2. AiModeSelector - AI诊断模式选择组件

### 功能
选择单AI模式或多AI模式的卡片选择器。

### 使用示例

```vue
<template>
  <AiModeSelector v-model="formData.aiMode" />
  
  <!-- 自定义描述文本 -->
  <AiModeSelector
    v-model="formData.aiMode"
    single-mode-desc="快速诊断\n推荐使用"
    multiple-mode-desc="综合多个AI\n结果更准确"
  />
</template>

<script setup>
import { reactive } from 'vue'
import AiModeSelector from '@/components/AiModeSelector/index.vue'

const formData = reactive({
  aiMode: 'single' // 'single' | 'multiple'
})
</script>
```

### Props
- `modelValue` (String): 当前选中的模式，'single' | 'multiple'
- `singleModeDesc` (String): 单AI模式描述文本
- `multipleModeDesc` (String): 多AI模式描述文本

### Events
- `update:modelValue`: 模式变化

---

## 3. AiModelSelector - AI模型选择组件

### 功能
多选AI模型，显示模型图标和名称，自动计算费用。

### 使用示例

```vue
<template>
  <AiModelSelector
    v-model="formData.selectedAiModels"
    :models="aiModels"
  />
</template>

<script setup>
import { reactive } from 'vue'
import AiModelSelector from '@/components/AiModelSelector/index.vue'

const formData = reactive({
  selectedAiModels: [] // 已选中的模型值数组
})

const aiModels = [
  { value: 'nsai', name: 'NSAI_Janus', icon: '/static/images/eye/nsai_janus.png' },
  { value: 'kimi', name: 'Kimi', icon: '/static/images/eye/kimi.png' },
  { value: 'tongyi', name: '通义千问', icon: '/static/images/eye/tongyi_qianwen.png' },
  { value: 'huoshan', name: '火山引擎', icon: '/static/images/eye/huoshan_yinqing.png' }
]
</script>
```

### Props
- `modelValue` (Array): 已选中的模型值数组
- `models` (Array): 可选模型列表，每项包含 { value, name, icon }
- `title` (String): 标题文本，默认 "AI模型选择"
- `showCostTip` (Boolean): 是否显示费用提示，默认 true
- `costPerModel` (Number): 每个模型的费用，默认 1

### Events
- `update:modelValue`: 选中模型变化

---

## 4. ResearchAuthorization - 科学研究授权组件

### 功能
科学研究授权选项，包含同意/不同意选择，以及研究项目多选和详情查看。

### 使用示例

```vue
<template>
  <ResearchAuthorization
    v-model:agreed="formData.agreeResearch"
    v-model:selectedProjects="formData.researchProjects"
    :projects="researchProjectsOptions"
    @show-detail="showProjectDetail"
  />
  
  <!-- 项目详情弹窗 -->
  <wd-popup v-model="showProjectPopup" position="center">
    <view class="project-popup-content">
      <view class="popup-title">{{ currentProject.name }}</view>
      <scroll-view scroll-y class="popup-text-content">
        <text>{{ currentProject.detail }}</text>
      </scroll-view>
      <wd-button @click="showProjectPopup = false">关闭</wd-button>
    </view>
  </wd-popup>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ResearchAuthorization from '@/components/ResearchAuthorization/index.vue'

const formData = reactive({
  agreeResearch: false,
  researchProjects: []
})

const researchProjectsOptions = [
  {
    id: 'project1',
    name: '眼部疾病早期筛查研究',
    detail: '本项目旨在...'
  },
  {
    id: 'project2',
    name: 'AI辅助诊断准确性研究',
    detail: '通过收集...'
  }
]

const currentProject = ref({})
const showProjectPopup = ref(false)

const showProjectDetail = (project) => {
  currentProject.value = project
  showProjectPopup.value = true
}
</script>
```

### Props
- `agreed` (Boolean): 是否同意参与研究
- `selectedProjects` (Array): 已选中的项目ID数组
- `projects` (Array): 研究项目列表，每项包含 { id, name, detail }
- `tipText` (String): 提示文本

### Events
- `update:agreed`: 同意状态变化
- `update:selectedProjects`: 选中项目变化
- `show-detail`: 点击项目详情按钮，参数为项目对象

---

## 组件组合使用示例

在诊断表单页面中完整使用所有组件：

```vue
<template>
  <z-paging layout-only>
    <template #top>
      <SafeTopContainer>
        <wd-navbar title="诊断信息采集" left-arrow @click-left="handleClickLeft"></wd-navbar>
      </SafeTopContainer>
    </template>

    <view class="diagnosis-container">
      <!-- 基础信息表单 -->
      <!-- ... -->

      <!-- AI诊断模式设置 -->
      <AiModeSelector v-model="formData.aiMode" />

      <!-- AI模型选择 -->
      <AiModelSelector
        v-model="formData.selectedAiModels"
        :models="aiModels"
      />

      <!-- 科学研究授权 -->
      <ResearchAuthorization
        v-model:agreed="formData.agreeResearch"
        v-model:selectedProjects="formData.researchProjects"
        :projects="researchProjectsOptions"
        @show-detail="showProjectDetail"
      />
    </view>

    <template #bottom>
      <DiagnosisBottomBar
        v-model:agreed="formData.agreedProtocol"
        :visible="!hideBottomContent"
        @submit="handleSubmit"
      />
    </template>
  </z-paging>
</template>

<script setup>
import { ref, reactive } from 'vue'
import SafeTopContainer from '@/components/SafeTopContainer/index.vue'
import DiagnosisBottomBar from '@/components/DiagnosisBottomBar/index.vue'
import AiModeSelector from '@/components/AiModeSelector/index.vue'
import AiModelSelector from '@/components/AiModelSelector/index.vue'
import ResearchAuthorization from '@/components/ResearchAuthorization/index.vue'

const formData = reactive({
  aiMode: 'single',
  selectedAiModels: [],
  agreeResearch: false,
  researchProjects: [],
  agreedProtocol: false
})

const aiModels = [
  // 模型配置
]

const researchProjectsOptions = [
  // 项目配置
]

const hideBottomContent = ref(false)

const handleSubmit = () => {
  // 提交逻辑
}
</script>
```

---

## 注意事项

1. **picker兼容性**: 如果页面有picker组件，记得在picker打开时隐藏底部栏：
   ```javascript
   const hideBottomContent = ref(false)
   
   // picker打开
   hideBottomContent.value = true
   
   // picker关闭
   setTimeout(() => {
     hideBottomContent.value = false
   }, 100)
   ```

2. **组件导入**: 确保正确导入所需组件，路径为 `@/components/组件名/index.vue`

3. **数据绑定**: 使用 `v-model` 或 `v-model:xxx` 进行双向数据绑定

4. **样式复用**: 组件已包含完整样式，无需在页面中重复定义

