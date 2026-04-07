/**
 * useApplePayment 苹果 IAP 支付 Hook
 *
 * 使用示例：
 * ```js
 * import { useApplePayment } from '@/hooks/useApplePayment'
 * 
 * const {
 *   initAppleChannel,
 *   requestProducts,
 *   payment,
 *   finishTransaction,
 * } = useApplePayment()
 * 
 * onMounted(async () => {
 *   await initAppleChannel()
 *   const [product] = await requestProducts(['com.demo.vip'])
 *   const result = await payment(product.orderInfo)
 *   // 服务器验证收据后再 finishTransaction(result.transaction)
 * })
 * ```
 */
/**
 * 苹果应用内购买(IAP)功能封装
 * @returns {Object} 包含IAP相关方法的对象
 */
export const useApplePayment = () => {
  /**
   * @typedef {Object} IAPChannel 苹果内购支付通道对象
   * @property {Function} requestOrder 获取商品详情方法
   * @property {Function} restoreCompletedTransactions 恢复已完成交易方法
   * @property {Function} finishTransaction 完成/关闭交易方法
   * @property {Function} [purchase] 发起购买方法（各平台实现可能不同）
   */
  /**
   * @typedef {Object} ProductDetail 商品详情对象
   * @property {string} productId 商品ID
   * @property {string} price 价格字符串(含货币符号)
   * @property {string} title 商品标题
   * @property {string} description 商品描述
   */
  /**
   * @typedef {Object} Transaction 交易对象
   * @property {string} transactionId 交易ID
   * @property {string} productId 商品ID
   * @property {number} [quantity] 购买数量
   * @property {string} [receipt] 支付凭据(基64编码)
   */
  /**
   * @typedef {Object} RestoreOptions 恢复交易选项
   * @property {boolean} manualFinishTransaction 是否手动完成交易
   * @property {string} [username] 苹果账号用户名（用于跨设备恢复）
   */
  /** @type {IAPChannel | null} 存储IAP支付通道实例 */
  let iap = null

  /**
   * 初始化IAP支付通道
   * @returns {Promise<Object>} 解析为有效的IAP通道对象
   * @throws {Error} 当设备不支持苹果支付或初始化失败时抛出错误
   */
  const initAppleChannel = () => {
    return new Promise((resolve, reject) => {
      uni.getProvider({
        service: "payment",
        success: (result) => {
          const iapChannel = result.providers.find(
            (channel) => channel.id === "appleiap",
          )

          if (!iapChannel) {
            reject(new Error("当前设备不支持苹果内购支付"))
            return
          }

          iap = iapChannel
          resolve(iap)
        },
        fail: (err) => {
          reject(new Error(`支付服务获取失败: ${err.errMsg || "未知错误"}`))
        },
      })
    })
  }

  /**
   * 请求商品详情
   * @param {string[]} productIds 需要查询的商品ID数组
   * @returns {Promise<Object[]>} 解析为商品详情列表
   * @throws {Error} 当请求失败时抛出错误
   */
  const requestProducts = (productIds) => {
    if (!iap?.requestOrder) {
      throw new Error("IAP通道未初始化或缺少requestOrder方法")
    }

    return new Promise((resolve, reject) => {
      iap.requestOrder(
        productIds,
        (products) => resolve(products),
        (err) =>
          reject(
            new Error(`商品详情请求失败: ${JSON.stringify(err) || "未知错误"}`),
          ),
      )
    })
  }

  /**
   * 恢复已购买但未完成的交易(用于跨设备恢复购买)
   * @param {string} [username=''] 苹果账号用户名(可选)
   * @returns {Promise<Object[]>} 解析为待处理的交易列表
   * @throws {Error} 当恢复失败时抛出错误
   */
  const restoreTransactions = (username = "") => {
    if (!iap?.restoreCompletedTransactions) {
      throw new Error("IAP通道未初始化或缺少restoreCompletedTransactions方法")
    }

    return new Promise((resolve, reject) => {
      iap.restoreCompletedTransactions(
        {
          manualFinishTransaction: true, // 手动完成交易
          username: username,
        },
        (transactions) => resolve(transactions),
        (err) =>
          reject(
            new Error(
              `交易恢复失败: ${err.message || err.errMsg || "未知错误"}`,
            ),
          ),
      )
    })
  }

  /**
   * 完成交易(关闭订单)
   * @param {Object} transaction 需要完成的交易对象
   * @returns {Promise<void>} 交易完成时解析
   * @throws {Error} 当交易完成失败时抛出错误
   */
  const finishTransaction = (transaction) => {
    if (!iap?.finishTransaction) {
      throw new Error("IAP通道未初始化或缺少finishTransaction方法")
    }

    return new Promise((resolve, reject) => {
      iap.finishTransaction(
        transaction,
        () => resolve(),
        (err) =>
          reject(
            new Error(
              `交易完成失败: ${err.message || err.errMsg || "未知错误"}`,
            ),
          ),
      )
    })
  }

  /**
   * 进行应用内购买
   * @param {object} orderInfo 要购买的商品ID
   * @returns {Promise<Object>} 解析为购买结果
   * @throws {Error} 当购买失败时抛出错误
   */
  const payment = async (orderInfo) =>
    new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: "appleiap",
        orderInfo,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        },
      })
    })

  return {
    initAppleChannel,
    requestProducts,
    restoreTransactions,
    finishTransaction,
    payment,
  }
}
