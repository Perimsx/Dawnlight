import { readComments, writeComments, UserComment } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const body = await readBody(event)
    const { items, status } = body

    if (!Array.isArray(items) || items.length === 0) {
        throw createError({ statusCode: 400, message: '请选择要操作的评论' })
    }
    if (!['approved', 'pending', 'rejected'].includes(status)) {
        throw createError({ statusCode: 400, message: '无效的状态值' })
    }

    const comments = await readComments()
    let updated = 0

    items.forEach(({ postId, id }: { postId: string, id: string }) => {
        const postComments = comments[postId]
        if (postComments) {
            const idx = postComments.findIndex((c: UserComment) => c.id === id)
            if (idx !== -1 && postComments[idx]) {
                postComments[idx].status = status
                updated++
            }
        }
    })

    await writeComments(comments)
    return { success: true, message: `已更新 ${updated} 条评论`, data: { updated } }
})
