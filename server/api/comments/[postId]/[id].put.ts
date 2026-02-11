import { readComments, writeComments, UserComment } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const postId = getRouterParam(event, 'postId')
    const id = getRouterParam(event, 'id')

    if (!postId || !id) {
        throw createError({ statusCode: 400, message: '缺少参数' })
    }

    const body = await readBody(event)
    const { status } = body

    if (!['approved', 'pending', 'rejected'].includes(status)) {
        throw createError({ statusCode: 400, message: '无效的状态值' })
    }

    const comments = await readComments()
    const postComments = comments[postId]

    if (!postComments) {
        throw createError({ statusCode: 404, message: '文章评论不存在' })
    }

    const index = postComments.findIndex((c: UserComment) => c.id === id)
    if (index === -1) {
        throw createError({ statusCode: 404, message: '评论不存在' })
    }

    if (postComments[index]) {
        postComments[index].status = status
        await writeComments(comments)
    } else {
        throw createError({ statusCode: 500, message: '更新失败' })
    }

    return {
        success: true,
        message: '评论状态已更新',
        data: postComments[index]
    }
})
