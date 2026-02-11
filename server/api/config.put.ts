import { readConfigFile, writeConfigFile, ConfigPaths } from '../utils/helpers'
import { addLog } from '../utils/logs'

/**
 * 深合并两个对象。
 * - 对象字段递归合并（保留旧值中未被新值覆盖的字段）
 * - 数组字段以新值为准直接替换（社交卡片、公告等由前端整体提交）
 * - null / undefined 的新值会跳过（不会把旧值清空）
 */
function deepMerge(target: any, source: any): any {
    if (!source || typeof source !== 'object') return target
    if (!target || typeof target !== 'object') return source

    const result = { ...target }
    for (const key of Object.keys(source)) {
        const srcVal = source[key]
        const tgtVal = target[key]

        if (srcVal === undefined || srcVal === null) continue

        if (Array.isArray(srcVal)) {
            // 数组直接替换
            result[key] = srcVal
        } else if (typeof srcVal === 'object' && !Array.isArray(srcVal)) {
            // 递归合并子对象
            result[key] = deepMerge(tgtVal || {}, srcVal)
        } else {
            result[key] = srcVal
        }
    }
    return result
}

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const body = await readBody(event)

    // Validate
    if (!body.site && !body.author) {
        throw createError({
            statusCode: 400,
            message: '配置数据不完整'
        })
    }

    // 读取现有配置，进行深合并，避免覆盖 navigation / homepage / bot 等未提交字段
    const existing = await readConfigFile(
        ConfigPaths.SITE_CONFIG_FILE,
        ConfigPaths.DEFAULT_SITE_CONFIG_FILE
    ) || {}

    const merged = deepMerge(existing, body)

    const timestamp = Date.now()
    const backupPath = ConfigPaths.SITE_CONFIG_FILE + `.backup.${timestamp}`

    const success = await writeConfigFile(ConfigPaths.SITE_CONFIG_FILE, merged, backupPath)

    if (!success) {
        throw createError({
            statusCode: 500,
            message: '保存配置失败'
        })
    }

    addLog({ type: 'config', title: '更新站点配置' }, event)

    return {
        success: true,
        message: '配置保存成功',
        data: merged
    }
})
