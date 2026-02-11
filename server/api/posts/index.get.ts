import { getPostsList } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    try {
        const posts = await getPostsList()
        return {
            success: true,
            data: posts,
            total: posts.length
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: '获取文章列表失败'
        })
    }
})
