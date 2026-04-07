/**
 * 创建一个轮询任务 Hook
 * @param {Function} apiFunc - 需要轮询执行的异步函数
 * @param {number} [interval=1000] - 轮询间隔时间，单位为毫秒
 * @param {number} [maxRetries=0] - 最大重试次数，0 表示无限重试
 * @returns {Object} 轮询任务控制对象
 * @returns {Function} returns.startTask - 启动轮询任务
 * @returns {Function} returns.stopTask - 停止轮询任务
 * @returns {Function} returns.onStart - 设置轮询开始时的回调函数
 * @returns {Function} returns.onSuccess - 设置轮询成功时的回调函数
 * @returns {Function} returns.onFail - 设置轮询失败时的回调函数
 * @returns {Function} returns.onTimeout - 设置轮询超时时的回调函数
 * @returns {Function} returns.onComplete - 设置轮询完成时的回调函数
 *
 * @example
 * // 基本使用示例：轮询获取任务状态
 * const { startTask, stopTask, onSuccess, onFail } = usePollingTask(
 *   async () => {
 *     const response = await fetch('/api/task-status');
 *     return response.json();
 *   },
 *   2000,  // 每2秒轮询一次
 *   10     // 最多轮询10次
 * );
 *
 * // 设置成功回调
 * onSuccess((response, retryCount) => {
 *   console.log(`第${retryCount}次轮询成功:`, response);
 *   if (response.status === 'completed') {
 *     stopTask(); // 任务完成时停止轮询
 *   }
 * });
 *
 * // 设置失败回调
 * onFail((error, retryCount) => {
 *   console.error(`第${retryCount}次轮询失败:`, error);
 * });
 *
 * // 启动轮询
 * startTask();
 *
 * @example
 * // 高级使用示例：带完整生命周期回调的轮询
 * const polling = usePollingTask(
 *   async () => {
 *     const response = await fetch('/api/process-status');
 *     return response.json();
 *   },
 *   3000,  // 每3秒轮询一次
 *   0      // 无限轮询
 * );
 *
 * // 设置所有生命周期回调
 * polling.onStart((retryCount) => {
 *   console.log(`开始第${retryCount}次轮询`);
 * });
 *
 * polling.onSuccess((response, retryCount) => {
 *   console.log(`第${retryCount}次轮询成功:`, response);
 *   if (response.progress === 100) {
 *     polling.stopTask();
 *   }
 * });
 *
 * polling.onFail((error, retryCount) => {
 *   console.error(`第${retryCount}次轮询失败:`, error);
 * });
 *
 * polling.onTimeout((response, retryCount) => {
 *   console.log(`轮询超时，已执行${retryCount}次`);
 * });
 *
 * polling.onComplete((status, retryCount) => {
 *   console.log(`轮询结束，状态: ${status}，共执行${retryCount}次`);
 * });
 *
 * // 启动轮询
 * polling.startTask();
 *
 * // 在组件卸载时停止轮询
 * polling.stopTask();
 */
export const usePollingTask = (apiFunc, interval = 1000, maxRetries = 0) => {
  let retryCount = 0
  let pollingTimeout = null
  let status = "idle" // idle, polling, stopped, timeout, error
  let isPolling = false

  // 回调函数
  let onStartCallback = null
  let onSuccessCallback = null
  let onFailCallback = null
  let onTimeoutCallback = null
  let onCompleteCallback = null

  /**
   * 设置轮询开始时的回调函数
   * @param {Function} cb - 回调函数，接收当前重试次数作为参数
   */
  const onStart = (cb) => {
    if (typeof cb === "function") onStartCallback = cb
  }

  /**
   * 设置轮询成功时的回调函数
   * @param {Function} cb - 回调函数，接收响应结果和当前重试次数作为参数
   */
  const onSuccess = (cb) => {
    if (typeof cb === "function") onSuccessCallback = cb
  }

  /**
   * 设置轮询失败时的回调函数
   * @param {Function} cb - 回调函数，接收错误对象和当前重试次数作为参数
   */
  const onFail = (cb) => {
    if (typeof cb === "function") onFailCallback = cb
  }

  /**
   * 设置轮询超时时的回调函数
   * @param {Function} cb - 回调函数，接收最后一次响应结果和当前重试次数作为参数
   */
  const onTimeout = (cb) => {
    if (typeof cb === "function") onTimeoutCallback = cb
  }

  /**
   * 设置轮询完成时的回调函数
   * @param {Function} cb - 回调函数，接收当前状态和重试次数作为参数
   */
  const onComplete = (cb) => {
    if (typeof cb === "function") onCompleteCallback = cb
  }

  /**
   * 停止轮询任务
   */
  const stopTask = () => {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout)
      pollingTimeout = null
    }
    isPolling = false
    status = "stopped"
  }

  /**
   * 启动轮询任务
   * @returns {Promise<void>}
   */
  const startTask = async () => {
    if (isPolling) return
    isPolling = true
    status = "polling"
    retryCount = 0
    await poll()
  }

  /**
   * 轮询主逻辑
   * @returns {Promise<void>}
   */
  const poll = async () => {
    if (!isPolling) return
    try {
      status = "polling"
      onStartCallback && onStartCallback(retryCount)
      const response = await apiFunc()
      onSuccessCallback && onSuccessCallback(response, retryCount)
      retryCount++
      if (maxRetries === 0 || retryCount < maxRetries) {
        pollingTimeout = setTimeout(poll, interval)
      } else {
        stopTask()
        status = "timeout"
        onTimeoutCallback && onTimeoutCallback(response, retryCount)
      }
    } catch (error) {
      stopTask()
      status = "error"
      onFailCallback && onFailCallback(error, retryCount)
      onTimeoutCallback && onTimeoutCallback(error, retryCount)
    } finally {
      onCompleteCallback && onCompleteCallback(status, retryCount)
    }
  }

  return {
    startTask,
    stopTask,
    onStart,
    onSuccess,
    onFail,
    onTimeout,
    onComplete,
  }
}
