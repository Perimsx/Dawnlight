import { validateToken } from '../../utils/auth'

export default defineEventHandler((event) => {
    // 从请求头提取 token
    const token = getHeader(event, 'x-admin-token')

    if (token && validateToken(token)) {
        return { success: true, valid: true }
    }

    return { success: false, valid: false }
})
