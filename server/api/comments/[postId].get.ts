import { readComments, UserComment } from '../../utils/storage'

export default defineEventHandler(async (event) => {
    const postId = getRouterParam(event, 'postId')
    if (!postId) {
        throw createError({ statusCode: 400, message: '缺少文章ID' })
    }

    const comments = await readComments()

    const query = getQuery(event)
    const adminMode = query.admin === '1' || query.admin === 'true'

    // Public: only approved; Admin: allow all (需鉴权)
    let postComments = (comments[postId] || [])
    if (adminMode) {
        if (!event.context.auth?.authenticated) {
            throw createError({ statusCode: 401, message: '未授权' })
        }
    } else {
        postComments = postComments.filter((c: UserComment) => c.status === 'approved')
    }

    postComments = postComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
        success: true,
        data: postComments
    }
})
