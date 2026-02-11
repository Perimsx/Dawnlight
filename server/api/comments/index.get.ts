import { readComments } from '../../utils/storage'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未登录' })
    }

    const comments = await readComments()

    return {
        success: true,
        data: comments
    }
})

