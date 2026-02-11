import { readConfigFile, writeConfigFile, ConfigPaths } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const body = await readBody(event)
    const applicationInfo = body?.applicationInfo ?? body?.content

    if (applicationInfo === undefined) {
        throw createError({ statusCode: 400, message: '内容不能为空' })
    }

    const links = await readConfigFile(ConfigPaths.LINKS_CONFIG_FILE)
    if (!links) {
        throw createError({ statusCode: 500, message: '读取友链配置失败' })
    }

    links.applicationInfo = applicationInfo

    const timestamp = Date.now()
    const backupPath = ConfigPaths.LINKS_CONFIG_FILE + `.backup.${timestamp}`
    const success = await writeConfigFile(ConfigPaths.LINKS_CONFIG_FILE, links, backupPath)

    if (!success) {
        throw createError({ statusCode: 500, message: '保存配置失败' })
    }

    return {
        success: true,
        message: '申请说明已更新',
        data: { applicationInfo }
    }
})
