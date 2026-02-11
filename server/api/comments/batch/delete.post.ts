import { readComments, writeComments, UserComment } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const body = await readBody(event)
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
        throw createError({ statusCode: 400, message: '请选择要删除的评论' })
    }

    const comments = await readComments()
    let deleted = 0

    items.forEach(({ postId, id }: { postId: string, id: string }) => {
        const postComments = comments[postId]
        if (postComments) {
            const idx = postComments.findIndex((c: UserComment) => c.id === id)
            if (idx !== -1) {
                postComments.splice(idx, 1)
                deleted++
            }
            if (postComments.length === 0) {
                delete comments[postId]
            }
        }
    })

    await writeComments(comments)
    return { success: true, message: `已删除 ${deleted} 条评论`, data: { deleted } }
})
