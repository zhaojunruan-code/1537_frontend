/**
 *
 * 使用方式（无需 import，由 AutoImport 按 hooks 规则自动引入）：
 * ```js
 * useLog('用户登录成功')
 * useWarn('库存不足', 'order')
 * useError('网络错误', err)
 * ```
 *
 * 规则：
 * 1. 第一个参数始终是消息字符串。
 * 2. 若第二个参数是字符串，会被视为模块名；否则视为额外数据。
 * 3. 允许附带任意数量的额外参数，如异常对象、数据等。
 * 4. 生产环境仅输出 warn / error。
 */
const isProd = import.meta.env.PROD

/**
 * 格式化输出
 * @param {'LOG'|'WARN'|'ERROR'} level
 * @param {IArguments|Array} rawArgs
 */
function basePrint(level, rawArgs) {
    const args = Array.from(rawArgs)
    const [msg, maybeModule, ...rest] = args

    let moduleName = 'app'
    let extraArgs = rest

    if (typeof maybeModule === 'string') {
        moduleName = maybeModule
    } else if (maybeModule !== undefined) {
        extraArgs.unshift(maybeModule)
    }

    const prefix = `[${moduleName}] [${level}]`
    return [`${prefix} ${msg}`, ...extraArgs]
}

// info 等级（在此统一称作 LOG）
export function useLog(...args) {
    if (isProd) return // 生产环境不输出 info
        // @ts-ignore
        ; (console.info || console.log)(...basePrint('LOG', args))
}

export function useWarn(...args) {
    // @ts-ignore
    console.warn(...basePrint('WARN', args))
}

export function useError(...args) {
    // @ts-ignore
    console.error(...basePrint('ERROR', args))
}
