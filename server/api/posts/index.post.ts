import path from 'node:path'
import { calculateReadTime, calculateWordCount, generateId, getPostsList, savePostsList, Paths } from '../../utils/helpers'
import { pathExists, writeText } from '../../utils/fs'
import { addLog } from '../../utils/logs'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.authenticated) {
    throw createError({ statusCode: 401, message: '未授权' })
  }

  const body = await readBody<any>(event)

  const title = String(body?.title ?? '')
  const content = String(body?.content ?? '')
  const description = String(body?.description ?? '')
  const category = body?.category == null ? '' : String(body.category)
  const cover = body?.cover == null ? '' : String(body.cover)
  const date = body?.date ? String(body.date) : new Date().toISOString().split('T')[0]
  const featured = !!body?.featured

  if (!Array.isArray(body?.tags)) {
    throw createError({ statusCode: 400, message: '数据验证失败', data: { errors: ['标签必须是数组'] } })
  }

  const tags = (body.tags as any[])
    .map(t => String(t).trim())
    .filter(Boolean)

  const errors: string[] = []
  if (!title.trim()) errors.push('标题不能为空')
  if (!content.trim()) errors.push('内容不能为空')
  if (errors.length > 0) {
    throw createError({ statusCode: 400, message: '数据验证失败', data: { errors } })
  }

  const id = generateId()
  const fileName = `${id}.md`
  const fileRel = `content/posts/${fileName}`
  const filePath = path.join(Paths.ROOT_DIR, fileRel)

  if (await pathExists(filePath)) {
    throw createError({ statusCode: 400, message: '文件已存在' })
  }

  const wordCount = calculateWordCount(content || '')
  const readTime = calculateReadTime(content || '')

  const newPost: any = {
    id,
    title: title.trim(),
    date,
    description: description.trim(),
    tags,
    file: fileRel,
    cover: cover ? cover.trim() : '',
    featured,
    views: 0,
    likes: 0,
    wordCount,
    readTime,
    lastModified: new Date().toISOString()
  }

  if (category && category.trim()) newPost.category = category.trim()

  // 写入 Markdown 文件
  await writeText(filePath, content)

  // 更新列表
  const posts = await getPostsList()
  posts.unshift(newPost)
  const ok = await savePostsList(posts)
  if (!ok) {
    throw createError({ statusCode: 500, message: '创建文章失败' })
  }

  addLog({ type: 'post', title: '创建文章', description: title.trim() }, event)

  setResponseStatus(event, 201)
  return {
    success: true,
    message: '文章创建成功',
    data: newPost
  }
})

