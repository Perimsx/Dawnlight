import { readConfigFile, writeConfigFile, ConfigPaths } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const nameParam = getRouterParam(event, 'name')
    // nameParam might be encoded
    const name = nameParam ? decodeURIComponent(nameParam) : ''

    const body = await readBody(event)
    const { url, avatar, description } = body

    const links = await readConfigFile(ConfigPaths.LINKS_CONFIG_FILE)
    if (!links) {
        throw createError({ statusCode: 500, message: '读取友链配置失败' })
    }

    const index = links.recommended.findIndex((link: any) => link.name === name)
    if (index === -1) {
        throw createError({ statusCode: 404, message: '友链不存在' })
    }

    if (url) {
        try {
            new URL(url)
        } catch {
            throw createError({ statusCode: 400, message: '无效的 URL 格式' })
        }
    }

    links.recommended[index] = {
        ...links.recommended[index],
        url: url || links.recommended[index].url,
        avatar: avatar || links.recommended[index].avatar,
        description: description !== undefined ? description : links.recommended[index].description
    }

    const timestamp = Date.now()
    const backupPath = ConfigPaths.LINKS_CONFIG_FILE + `.backup.${timestamp}`
    const success = await writeConfigFile(ConfigPaths.LINKS_CONFIG_FILE, links, backupPath)

    if (!success) {
        throw createError({ statusCode: 500, message: '保存友链失败' })
    }

    return {
        success: true,
        message: '友链更新成功',
        data: links.recommended[index]
    }
})
