# AI作文助手 - 数据库设计文档

## 表结构总览

| 序号 | 表名 | 说明 | 对应前端页面 |
|------|------|------|-------------|
| 1 | `sys_user` | 用户表 | 登录页、首页问候、个人中心 |
| 2 | `vip_plan` | 会员套餐表 | 会员页-套餐列表 |
| 3 | `vip_order` | 会员订单表 | 会员页-立即开通 |
| 4 | `essay_record` | 作文记录主表 | 首页-最近记录、历史记录、记录详情 |
| 5 | `essay_image` | 作文图片表 | 帮写页/批改页-图片上传 |
| 6 | `essay_annotation` | 逐句批改标注表 | 批改结果-逐句详情、记录详情 |
| 7 | `export_record` | 导出记录表 | 记录详情-导出功能 |
| 8 | `ai_call_log` | AI调用日志表 | 后台审计/计费 |

## ER 关系图

```
sys_user (1) ──────< (N) essay_record
    │                      │
    │                      ├───< (N) essay_image
    │                      │
    │                      ├───< (N) essay_annotation
    │                      │
    │                      └───< (N) export_record
    │
    ├──────< (N) vip_order >───── (1) vip_plan
    │
    └──────< (N) ai_call_log
```

## 各表详细说明

### 1. sys_user（用户表）

与前端 `useUserStore` 对应。

| 字段 | 类型 | 前端映射 | 说明 |
|------|------|----------|------|
| `id` | BIGINT PK | - | 自增主键 |
| `openid` | VARCHAR(128) | `userInfo.openid` | 微信openid，唯一索引 |
| `union_id` | VARCHAR(128) | - | 多平台统一标识 |
| `nickname` | VARCHAR(64) | `userInfo.nickname` | 昵称，首页"你好，{nickname}" |
| `avatar` | VARCHAR(512) | `userInfo.avatar` | 头像URL |
| `phone` | VARCHAR(20) | - | 手机号 |
| `is_vip` | TINYINT(1) | `userInfo.isVip` | 会员页/个人中心-VIP状态 |
| `vip_expire_time` | DATETIME | - | VIP到期时间 |
| `status` | TINYINT(1) | - | 账号状态 |

### 2. vip_plan（会员套餐表）

与前端会员页 `plans` 数组对应。

| 字段 | 类型 | 前端映射 | 说明 |
|------|------|----------|------|
| `id` | BIGINT PK | `plan.id` | 套餐ID |
| `name` | VARCHAR(64) | `plan.name` | 连续包月/季度会员/年度会员 |
| `price` | DECIMAL(10,2) | `plan.price` | 现价 |
| `original_price` | DECIMAL(10,2) | `plan.original` | 原价（划线价） |
| `duration_days` | INT | - | 有效天数 |
| `description` | VARCHAR(255) | `plan.desc` | 描述文本 |

### 3. vip_order（会员订单表）

会员页点击"立即开通"后创建。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 订单ID |
| `order_no` | VARCHAR(64) | 唯一订单编号 |
| `user_id` | BIGINT FK | 关联用户 |
| `plan_id` | BIGINT FK | 关联套餐 |
| `amount` | DECIMAL(10,2) | 实付金额 |
| `pay_method` | VARCHAR(32) | wechat/alipay/apple_iap |
| `pay_status` | TINYINT(1) | 0=待支付 1=已支付 2=已退款 |
| `vip_start_time` | DATETIME | VIP生效时间 |
| `vip_end_time` | DATETIME | VIP到期时间 |

### 4. essay_record（作文记录主表）

与前端 `useRecordStore` 的 `records` 数组对应，是核心业务表。

| 字段 | 类型 | 前端映射 | 说明 |
|------|------|----------|------|
| `id` | BIGINT PK | `record.id` | 记录ID |
| `user_id` | BIGINT FK | - | 所属用户 |
| `type` | VARCHAR(16) | `record.type` | `write`=帮写, `grade`=批改 |
| `title` | VARCHAR(255) | `record.title` | 列表标题 |
| `summary` | VARCHAR(512) | `record.summary` | 列表摘要 |
| `prompt` | TEXT | 帮写输入框 | 帮写时的题目/要求 |
| `write_result` | LONGTEXT | `record.result`(帮写) | AI生成的作文全文 |
| `grading_type` | VARCHAR(32) | `gradingType` | chinese/english/english-continuation |
| `grading_standard` | VARCHAR(16) | `gradingStandard` | gaokao/custom |
| `custom_standard_text` | TEXT | `customStandardText` | 自定义标准文本 |
| `student_name` | VARCHAR(64) | `result.studentName` | AI识别的学生姓名 |
| `score` | INT | `result.score` | 批改得分0-100 |
| `grade_summary` | TEXT | `result.summary` | 老师总体评语 |
| `model_essay` | LONGTEXT | `result.modelEssay` | 修改后范文 |

### 5. essay_image（作文图片表）

帮写/批改时上传的图片，一条记录可关联多张图片。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 图片ID |
| `record_id` | BIGINT FK | 关联记录 |
| `image_url` | VARCHAR(512) | 图片存储URL（OSS/COS） |
| `sort_order` | INT | 排序 |

### 6. essay_annotation（逐句批改标注表）

与前端 `GradingResult.annotations` 数组对应，批改记录独有。

| 字段 | 类型 | 前端映射 | 说明 |
|------|------|----------|------|
| `id` | BIGINT PK | - | 标注ID |
| `record_id` | BIGINT FK | - | 关联记录 |
| `type` | VARCHAR(16) | `ann.type` | `issue`=有问题, `highlight`=好句 |
| `original_sentence` | TEXT | `ann.originalSentence` | 原句 |
| `issue` | TEXT | `ann.issue` | 存在的问题 |
| `suggestion` | TEXT | `ann.suggestion` | 修改建议 |
| `corrected_sentence` | TEXT | `ann.correctedSentence` | 修改后的句子 |
| `reason` | TEXT | `ann.reason` | 好在哪里（highlight时） |
| `sort_order` | INT | 数组索引 | 保持原文顺序 |

### 7. export_record（导出记录表）

记录详情页的导出功能，支持将帮写结果或批改报告导出为文件。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 导出ID |
| `user_id` | BIGINT FK | 用户 |
| `record_id` | BIGINT FK | 关联的作文记录 |
| `export_format` | VARCHAR(16) | pdf/docx/image |
| `file_url` | VARCHAR(512) | 生成后的下载URL |
| `file_name` | VARCHAR(255) | 文件名 |
| `file_size` | BIGINT | 文件大小（字节） |
| `status` | TINYINT(1) | 0=生成中 1=完成 2=失败 |

### 8. ai_call_log（AI调用日志表）

每次调用 Gemini API 时记录，便于计费和限流。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 日志ID |
| `user_id` | BIGINT FK | 用户 |
| `record_id` | BIGINT FK | 关联记录 |
| `call_type` | VARCHAR(16) | write=帮写 grade=批改 |
| `model_name` | VARCHAR(64) | 模型名称 |
| `prompt_tokens` | INT | 输入token数 |
| `output_tokens` | INT | 输出token数 |
| `duration_ms` | INT | 调用耗时 |
| `status` | TINYINT(1) | 0=失败 1=成功 |

## 导出功能设计

### 导出流程

```
用户点击"导出" → 前端调用后端API → 后端创建 export_record(status=0)
  → 异步生成文件（PDF/Word）→ 上传至OSS → 更新 file_url + status=1
  → 返回下载链接给前端 → 用户下载
```

### 导出内容

#### 帮写记录导出 (type='write')

导出内容包含：
- 标题、日期
- 用户输入的题目/要求
- AI生成的作文全文

#### 批改记录导出 (type='grade')

导出内容包含：
- 学生姓名、得分
- 老师总体评语
- 逐句批改详情（好句标绿、问题标红、建议标黄、修改标蓝）
- 修改后范文

### 推荐导出格式

| 格式 | 适用场景 | 实现方案 |
|------|----------|----------|
| PDF | 通用分享、打印 | 后端使用 iText/wkhtmltopdf 生成 |
| Word(docx) | 可编辑、二次修改 | 后端使用 Apache POI / python-docx 生成 |
| 图片(PNG) | 微信分享、朋友圈 | 后端使用 Puppeteer/html2canvas 截图 |

### 后端导出API设计

```
POST /api/export/create
  请求体: { recordId: Long, format: "pdf"|"docx"|"image" }
  响应: { exportId: Long, status: 0 }

GET /api/export/status/{exportId}
  响应: { status: 0|1|2, fileUrl: "https://...", fileName: "..." }

GET /api/export/download/{exportId}
  响应: 文件流（302重定向到OSS下载链接）
```

## 前端页面 → 后端API → 数据库表 映射

| 前端页面 | 操作 | 后端API | 涉及表 |
|----------|------|---------|--------|
| 登录页 | 微信一键登录 | `POST /api/auth/wx-login` | `sys_user` |
| 首页 | 加载最近3条记录 | `GET /api/record/recent` | `essay_record` |
| 帮写页 | 提交作文生成 | `POST /api/essay/write` | `essay_record` + `essay_image` + `ai_call_log` |
| 批改页 | 提交批改 | `POST /api/essay/grade` | `essay_record` + `essay_image` + `essay_annotation` + `ai_call_log` |
| 会员页 | 获取套餐列表 | `GET /api/vip/plans` | `vip_plan` |
| 会员页 | 立即开通 | `POST /api/vip/order` | `vip_order` + `sys_user` |
| 个人中心 | 获取统计数据 | `GET /api/user/stats` | `essay_record`(聚合) |
| 历史记录 | 获取全部记录 | `GET /api/record/list` | `essay_record` |
| 记录详情 | 获取详情 | `GET /api/record/{id}` | `essay_record` + `essay_annotation` + `essay_image` |
| 记录详情 | 导出 | `POST /api/export/create` | `export_record` |
| 个人中心 | 退出登录 | `POST /api/auth/logout` | `sys_user` |

## 个人中心统计SQL示例

```sql
-- 对应 Profile 页的 "我的数据"
SELECT
  COUNT(CASE WHEN type = 'grade' THEN 1 END) AS grade_count,   -- 批改次数
  COUNT(CASE WHEN type = 'write' THEN 1 END) AS write_count,   -- 帮写次数
  COUNT(CASE WHEN type = 'grade' THEN 1 END) AS report_count   -- 生成成绩单数
FROM essay_record
WHERE user_id = ? AND deleted_at IS NULL;
```
