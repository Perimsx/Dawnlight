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

    const comments = await readComments()
    const postComments = comments[postId]

    if (!postComments) {
        throw createError({ statusCode: 404, message: '文章评论不存在' })
    }

    const index = postComments.findIndex((c: UserComment) => c.id === id)
    if (index === -1) {
        throw createError({ statusCode: 404, message: '评论不存在' })
    }

    postComments.splice(index, 1)
    if (postComments.length === 0) {
        delete comments[postId]
    }

    await writeComments(comments)

    return {
        success: true,
        message: '评论已删除'
    }
})
