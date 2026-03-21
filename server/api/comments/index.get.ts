import { readComments } from '../../utils/storage'
import { apiError, apiSuccess, ensureAdminAuth } from '../../utils/apiResponse'

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  try {
    const comments = await readComments()
    return apiSuccess(comments)
  } catch (error) {
    console.error('[comments/index.get] failed:', error)
    return apiError(event, 500, '评论列表加载失败，请稍后重试', { code: 'COMMENTS_LIST_FAILED' })
  }
})
