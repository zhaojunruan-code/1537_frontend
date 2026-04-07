export default {
  props: {
    // sku的源数据
    data: {
      default: () => [],
      type: Array
    },
    // 是否显示sku组件
    value: {
      default: false,
      type: Boolean
    },
    // 是否可以点击关闭
    isMaskClose: {
      default: false,
      type: Boolean
    },
    // 是否默认选中最低价格sku
    isSelectMinPriceSku: {
      default: true,
      type: Boolean
    },
    // 默认选中的sku下标
    selectSkuIndex: {
      default: null,
      type: [Number, String]
    },
    // 默认封面图
    defaultCover: {
      default: "",
      type: String
    },
    // 默认购买商品数量
    defaultNum: {
      default: 1,
      type: [Number, String]
    },
    // 主题色
    themeColor: {
      default: () => [60, 156, 255],
      type: Array
    },
    // 确认按钮文字
    btnConfirmText: {
      default: "确定",
      type: String
    },
    // 不相关sku是否禁用
    skuUnrelatedDisabled: {
      default: false,
      type: Boolean
    },
    // sku禁用时的样式
    skuDisabledStyle: {
      default: () => {
        return {}
      },
      type: Object
    },
    // 库存不足文字
    notStockText: {
      default: "库存不足",
      type: String
    },
    // 未选择完整的sku时的文字提示
    notSelectSku: {
      default: "请选择完整的sku属性",
      type: String
    },
    // 展示库存数量
    showStockNum: {
      default: true,
      type: Boolean
    },
    // 展示购买数量
    isShowCount: {
      default: true,
      type: Boolean
    },
    productId: {
      default: -1,
      type: [Number, String]
    },
    cartItemId: {
      default: -1,
      type: [Number, String]
    }
  }
}
