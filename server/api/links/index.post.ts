import { readConfigFile, writeConfigFile, ConfigPaths } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    // TODO: Auth check. Using context from middleware if available or check manually?
    // Assuming auth middleware populates context usually, or use verify token logic.
    // For now, let's assume middleware or explicit check needed. 
    // Legacy used 'requireAuth'. 
    // We should probably rely on a global protect middleware or check here.
    // Let's add a check using verifyToken logic or assuming middleware is running.
    // Better to check explicitly or use a composable if we had one.
    // Let's import validateToken from auth util and check header for now to be safe.

    // Actually, I wrote server/middleware/auth.ts which populates event.context.auth
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const body = await readBody(event)
    const { name, url, avatar, description } = body

    if (!name || !url) {
        throw createError({ statusCode: 400, message: '请填写所有必填项' })
    }

    // Valid URL check? 
    // Legacy: isValidURL. I can implement simple regex or try-catch URL.
    try {
        new URL(url)
    } catch {
        throw createError({ statusCode: 400, message: '无效的 URL 格式' })
    }

    const links = await readConfigFile(ConfigPaths.LINKS_CONFIG_FILE)
    if (!links) {
        throw createError({ statusCode: 500, message: '读取友链配置失败' })
    }

    // Check exist
    const exists = links.recommended.some((link: any) => link.name === name)
    if (exists) {
        throw createError({ statusCode: 400, message: '该友链已存在' })
    }

    const newLink = {
        name,
        url,
        avatar: avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=3b82f6&color=fff',
        description: description || ''
    }

    links.recommended.push(newLink)

    const timestamp = Date.now()
    const backupPath = ConfigPaths.LINKS_CONFIG_FILE + `.backup.${timestamp}`
    const success = await writeConfigFile(ConfigPaths.LINKS_CONFIG_FILE, links, backupPath)

    if (!success) {
        throw createError({ statusCode: 500, message: '保存友链失败' })
    }

    return {
        success: true,
        message: '友链添加成功',
        data: newLink
    }
})
