import { readConfigFile, writeConfigFile, ConfigPaths } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const nameParam = getRouterParam(event, 'name')
    const name = nameParam ? decodeURIComponent(nameParam) : ''

    const links = await readConfigFile(ConfigPaths.LINKS_CONFIG_FILE)
    if (!links) {
        throw createError({ statusCode: 500, message: '读取友链配置失败' })
    }

    const index = links.recommended.findIndex((link: any) => link.name === name)
    if (index === -1) {
        throw createError({ statusCode: 404, message: '友链不存在' })
    }

    links.recommended.splice(index, 1)

    const timestamp = Date.now()
    const backupPath = ConfigPaths.LINKS_CONFIG_FILE + `.backup.${timestamp}`
    const success = await writeConfigFile(ConfigPaths.LINKS_CONFIG_FILE, links, backupPath)

    if (!success) {
        throw createError({ statusCode: 500, message: '保存友链失败' })
    }

    return {
        success: true,
        message: '友链删除成功'
    }
})
