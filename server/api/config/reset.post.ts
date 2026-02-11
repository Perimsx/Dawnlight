import { readConfigFile, writeConfigFile, ConfigPaths } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const defaultConfig = await readConfigFile(ConfigPaths.DEFAULT_SITE_CONFIG_FILE)

    if (!defaultConfig) {
        throw createError({
            statusCode: 500,
            message: '读取默认配置失败'
        })
    }

    const timestamp = Date.now()
    const backupPath = ConfigPaths.SITE_CONFIG_FILE + `.backup.${timestamp}`

    const success = await writeConfigFile(ConfigPaths.SITE_CONFIG_FILE, defaultConfig, backupPath)

    if (!success) {
        throw createError({
            statusCode: 500,
            message: '重置配置失败'
        })
    }

    return {
        success: true,
        message: '配置已重置为默认值',
        data: defaultConfig
    }
})
