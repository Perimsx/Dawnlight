import { removeSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 兼容旧版：admin.js 使用 body token；Nuxt 版 useAdmin.logout 使用 header
    const headerToken = getHeader(event, 'x-admin-token')
    let bodyToken: string | undefined
    try {
        const body = await readBody(event)
        bodyToken = body?.token
    } catch {}
    const token = headerToken || bodyToken

    if (token) {
        removeSession(token)
    }

    return { success: true, message: '登出成功' }
})
