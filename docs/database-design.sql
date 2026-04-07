-- ============================================================
-- AI作文助手 - 数据库表设计
-- 基于前端原型界面完整分析
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- ============================================================

-- -----------------------------------------------------------
-- 1. 用户表 (sys_user)
-- 对应页面: 登录页、个人中心、首页问候
-- 数据来源: useUserStore
-- -----------------------------------------------------------
CREATE TABLE `sys_user` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid`      VARCHAR(128) NOT NULL DEFAULT ''     COMMENT '微信openid',
  `union_id`    VARCHAR(128) NOT NULL DEFAULT ''     COMMENT '微信union_id（多平台统一标识）',
  `nickname`    VARCHAR(64)  NOT NULL DEFAULT ''     COMMENT '昵称（登录页：微信用户）',
  `avatar`      VARCHAR(512) NOT NULL DEFAULT ''     COMMENT '头像URL',
  `phone`       VARCHAR(20)  NOT NULL DEFAULT ''     COMMENT '手机号',
  `is_vip`      TINYINT(1)   NOT NULL DEFAULT 0     COMMENT 'VIP状态 0=普通用户 1=VIP（会员页）',
  `vip_expire_time` DATETIME     NULL               COMMENT 'VIP到期时间',
  `status`      TINYINT(1)   NOT NULL DEFAULT 1     COMMENT '账号状态 0=禁用 1=正常',
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at`  DATETIME         NULL               COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_union_id` (`union_id`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------
-- 2. 会员套餐表 (vip_plan)
-- 对应页面: 会员页 - 套餐列表
-- 数据来源: plans 数组（连续包月/季度/年度）
-- -----------------------------------------------------------
CREATE TABLE `vip_plan` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '套餐ID',
  `name`           VARCHAR(64)   NOT NULL                COMMENT '套餐名称（连续包月/季度会员/年度会员）',
  `price`          DECIMAL(10,2) NOT NULL                COMMENT '现价（单位：元）',
  `original_price` DECIMAL(10,2) NOT NULL                COMMENT '原价',
  `duration_days`  INT           NOT NULL                COMMENT '有效天数（30/90/365）',
  `description`    VARCHAR(255)  NOT NULL DEFAULT ''     COMMENT '描述（首月特惠/低至xx元/月）',
  `sort_order`     INT           NOT NULL DEFAULT 0      COMMENT '排序序号',
  `is_active`      TINYINT(1)    NOT NULL DEFAULT 1      COMMENT '是否上架 0=下架 1=上架',
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员套餐表';

-- -----------------------------------------------------------
-- 3. 订单/支付记录表 (vip_order)
-- 对应页面: 会员页 - 立即开通按钮
-- -----------------------------------------------------------
CREATE TABLE `vip_order` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no`       VARCHAR(64)   NOT NULL                COMMENT '订单编号',
  `user_id`        BIGINT        NOT NULL                COMMENT '用户ID',
  `plan_id`        BIGINT        NOT NULL                COMMENT '套餐ID',
  `amount`         DECIMAL(10,2) NOT NULL                COMMENT '实付金额',
  `pay_method`     VARCHAR(32)   NOT NULL DEFAULT 'wechat' COMMENT '支付方式 wechat/alipay/apple_iap',
  `pay_status`     TINYINT(1)    NOT NULL DEFAULT 0      COMMENT '支付状态 0=待支付 1=已支付 2=已退款',
  `pay_time`       DATETIME          NULL                COMMENT '支付时间',
  `transaction_id` VARCHAR(128)  NOT NULL DEFAULT ''     COMMENT '第三方支付流水号',
  `vip_start_time` DATETIME          NULL                COMMENT 'VIP生效时间',
  `vip_end_time`   DATETIME          NULL                COMMENT 'VIP到期时间',
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_pay_status` (`pay_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员订单表';

-- -----------------------------------------------------------
-- 4. 作文记录主表 (essay_record)
-- 对应页面: 首页-最近记录、历史记录列表、记录详情
-- 数据来源: useRecordStore 的 records 数组
-- type='write' → AI帮写  type='grade' → AI批改
-- -----------------------------------------------------------
CREATE TABLE `essay_record` (
  `id`              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id`         BIGINT        NOT NULL                COMMENT '所属用户ID',
  `type`            VARCHAR(16)   NOT NULL                COMMENT '记录类型 write=帮写 grade=批改',
  `title`           VARCHAR(255)  NOT NULL DEFAULT ''     COMMENT '记录标题（写作：xxx.../批改：xxx的作文）',
  `summary`         VARCHAR(512)  NOT NULL DEFAULT ''     COMMENT '摘要（列表展示用）',

  -- 帮写相关字段
  `prompt`          TEXT              NULL                COMMENT '用户输入的题目/要求（帮写时）',
  `write_result`    LONGTEXT          NULL                COMMENT 'AI生成的作文全文（帮写时，Markdown格式）',

  -- 批改相关字段
  `grading_type`    VARCHAR(32)       NULL                COMMENT '批改类型 chinese/english/english-continuation',
  `grading_standard` VARCHAR(16)      NULL                COMMENT '批改标准 gaokao/custom',
  `custom_standard_text` TEXT         NULL                COMMENT '自定义批改标准文本',
  `student_name`    VARCHAR(64)       NULL                COMMENT '识别到的学生姓名',
  `score`           INT               NULL                COMMENT '批改得分 0-100',
  `grade_summary`   TEXT              NULL                COMMENT '老师总体评语',
  `model_essay`     LONGTEXT          NULL                COMMENT '修改后范文',

  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（即date字段）',
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at`      DATETIME          NULL                COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作文记录主表';

-- -----------------------------------------------------------
-- 5. 作文图片表 (essay_image)
-- 对应页面: 帮写页-图片上传、批改页-拍照/上传作文
-- 支持多张图片（批量批改时每张图单独一条record，每条record可能有1张原图）
-- -----------------------------------------------------------
CREATE TABLE `essay_image` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `record_id`   BIGINT       NOT NULL                COMMENT '所属记录ID',
  `image_url`   VARCHAR(512) NOT NULL                COMMENT '图片存储URL',
  `sort_order`  INT          NOT NULL DEFAULT 0      COMMENT '排序序号',
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作文图片表';

-- -----------------------------------------------------------
-- 6. 逐句批改标注表 (essay_annotation)
-- 对应页面: 批改结果-逐句批改详情、记录详情
-- 数据来源: GradingResult.annotations 数组
-- -----------------------------------------------------------
CREATE TABLE `essay_annotation` (
  `id`                 BIGINT       NOT NULL AUTO_INCREMENT COMMENT '标注ID',
  `record_id`          BIGINT       NOT NULL                COMMENT '所属记录ID',
  `type`               VARCHAR(16)  NOT NULL                COMMENT '标注类型 issue=有问题 highlight=好句',
  `original_sentence`  TEXT         NOT NULL                COMMENT '原句',
  `issue`              TEXT             NULL                COMMENT '存在的问题（type=issue时）',
  `suggestion`         TEXT             NULL                COMMENT '修改建议（type=issue时）',
  `corrected_sentence` TEXT             NULL                COMMENT '修改后的句子（type=issue时）',
  `reason`             TEXT             NULL                COMMENT '好在哪里（type=highlight时）',
  `sort_order`         INT          NOT NULL DEFAULT 0      COMMENT '排序序号（保持原文顺序）',
  `created_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='逐句批改标注表';

-- -----------------------------------------------------------
-- 7. 导出记录表 (export_record)
-- 对应需求: 记录详情导出功能
-- 支持导出单条记录详情为PDF/Word/图片
-- -----------------------------------------------------------
CREATE TABLE `export_record` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '导出ID',
  `user_id`       BIGINT       NOT NULL                COMMENT '用户ID',
  `record_id`     BIGINT       NOT NULL                COMMENT '关联的作文记录ID',
  `export_format` VARCHAR(16)  NOT NULL DEFAULT 'pdf'  COMMENT '导出格式 pdf/docx/image',
  `file_url`      VARCHAR(512) NOT NULL DEFAULT ''     COMMENT '导出文件的下载URL',
  `file_name`     VARCHAR(255) NOT NULL DEFAULT ''     COMMENT '导出文件名',
  `file_size`     BIGINT       NOT NULL DEFAULT 0      COMMENT '文件大小（字节）',
  `status`        TINYINT(1)   NOT NULL DEFAULT 0      COMMENT '导出状态 0=生成中 1=已完成 2=失败',
  `fail_reason`   VARCHAR(512) NOT NULL DEFAULT ''     COMMENT '失败原因',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_record_id` (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导出记录表';

-- -----------------------------------------------------------
-- 8. AI调用日志表 (ai_call_log)
-- 用途: 记录每次Gemini API调用，便于计费/审计/排错
-- -----------------------------------------------------------
CREATE TABLE `ai_call_log` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id`        BIGINT       NOT NULL                COMMENT '用户ID',
  `record_id`      BIGINT           NULL                COMMENT '关联的记录ID',
  `call_type`      VARCHAR(16)  NOT NULL                COMMENT '调用类型 write=帮写 grade=批改',
  `model_name`     VARCHAR(64)  NOT NULL DEFAULT ''     COMMENT '模型名称（gemini-2.0-flash等）',
  `prompt_tokens`  INT          NOT NULL DEFAULT 0      COMMENT '输入token数',
  `output_tokens`  INT          NOT NULL DEFAULT 0      COMMENT '输出token数',
  `cost`           DECIMAL(10,6) NOT NULL DEFAULT 0     COMMENT '本次调用成本（美元）',
  `duration_ms`    INT          NOT NULL DEFAULT 0      COMMENT '调用耗时（毫秒）',
  `status`         TINYINT(1)   NOT NULL DEFAULT 1      COMMENT '调用状态 0=失败 1=成功',
  `error_message`  TEXT             NULL                COMMENT '错误信息（失败时）',
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '调用时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI调用日志表';


-- ============================================================
-- 初始数据: 会员套餐
-- ============================================================
INSERT INTO `vip_plan` (`name`, `price`, `original_price`, `duration_days`, `description`, `sort_order`) VALUES
  ('连续包月', 19.00, 29.00, 30, '首月特惠，自动续费', 1),
  ('季度会员', 58.00, 88.00, 90, '低至19.3元/月', 2),
  ('年度会员', 198.00, 348.00, 365, '低至16.5元/月，最划算', 3);
