import { validateToken } from '../../utils/auth'

export default defineEventHandler((event) => {
    // Check header
    const token = getHeader(event, 'x-admin-token')

    if (token && validateToken(token)) {
        return { success: true, valid: true }
    }

    return { success: false, valid: false }
})
