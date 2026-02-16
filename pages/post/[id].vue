<template>
  <div v-if="loading" class="loading-spinner"></div>
  <div v-else-if="error || !post" class="glass-card" style="padding: 24px 20px; text-align: center;">
    <h2>文章不存在</h2>
    <NuxtLink to="/" style="color: var(--accent-color);">← 返回首页</NuxtLink>
  </div>
  <div v-else>
    <div class="article-container fade-in" :class="{ 'has-hero': !!post.cover }">
      <!-- Hero 封面 -->
      <div v-if="post.cover" class="article-hero">
        <div class="article-hero-bg" :style="{ backgroundImage: `url('${post.cover}')` }"></div>
        <div class="article-hero-overlay"></div>
        <div class="article-hero-content">
          <span v-if="post.category" class="article-category">{{ post.category }}</span>
          <h1 class="article-title">{{ post.title }}</h1>
          <div class="article-meta">
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {{ post.date }}
            </span>
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              {{ (post.wordCount || 0).toLocaleString('zh-CN') }}字
            </span>
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {{ post.readTime || Math.max(1, Math.ceil((post.wordCount || 0) / 400)) }} 分钟阅读
            </span>
          </div>
          <div v-if="post.tags && post.tags.length" class="article-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- 无封面标题区 -->
      <div v-else class="article-header">
        <span v-if="post.category" class="article-category">{{ post.category }}</span>
        <h1 class="article-title">{{ post.title }}</h1>
        <div class="article-meta">
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {{ post.date }}
          </span>
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {{ (post.wordCount || 0).toLocaleString('zh-CN') }}字
          </span>
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {{ post.readTime || Math.max(1, Math.ceil((post.wordCount || 0) / 400)) }} 分钟阅读
          </span>
        </div>
        <div v-if="post.tags && post.tags.length" class="article-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- 文章正文 -->
      <div class="article-body">
        <div class="markdown-body" ref="markdownBody" v-html="contentHtml"></div>
        <div class="license-notice">
          <div class="license-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M15 9.354a4 4 0 1 0 0 5.292"></path></svg>
          </div>
          <div class="license-content">
            <p>本文采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a> 许可协议，转载请注明出处。</p>
          </div>
        </div>
      </div>

      <!-- 上下篇导航 -->
      <nav v-if="prevPost || nextPost" class="post-navigation">
        <NuxtLink v-if="prevPost" :to="'/post/' + prevPost.id" class="post-nav-item post-nav-prev">
          <span class="post-nav-arrow">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </span>
          <div class="post-nav-content">
            <span class="post-nav-title">{{ prevPost.title }}</span>
            <span class="post-nav-date">{{ formatNavDate(prevPost.date) }}</span>
          </div>
        </NuxtLink>
        <div v-else class="post-nav-item post-nav-empty"></div>
        <NuxtLink v-if="nextPost" :to="'/post/' + nextPost.id" class="post-nav-item post-nav-next">
          <div class="post-nav-content">
            <span class="post-nav-title">{{ nextPost.title }}</span>
            <span class="post-nav-date">{{ formatNavDate(nextPost.date) }}</span>
          </div>
          <span class="post-nav-arrow">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
          </span>
        </NuxtLink>
        <div v-else class="post-nav-item post-nav-empty"></div>
      </nav>
    </div>

    <!-- 评论区 -->
    <div class="comments-section" id="comments-section">
      <div class="comments-header">
        <h3 class="comments-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          评论
          <span v-if="comments.length" class="comments-count">{{ comments.length }}</span>
        </h3>
      </div>
      <div class="comment-form">
        <div class="comment-form-top">
          <div class="comment-form-avatar">
            <img :src="commentAvatar" alt="头像">
          </div>
          <div class="comment-form-meta">
            <input type="text" placeholder="QQ号（用于获取头像）" v-model="commentQQ" maxlength="12" @blur="fetchQQAvatar">
            <input type="text" placeholder="昵称" v-model="commentNickname" maxlength="20">
          </div>
        </div>
        <div class="comment-form-body">
          <textarea placeholder="写下你的评论..." v-model="commentContent" maxlength="500" rows="3"></textarea>
        </div>
        <div class="comment-form-bottom">
          <span class="comment-char-count">{{ commentContent.length }} / 500</span>
          <button class="comment-submit-btn" @click="submitComment" :disabled="commentSubmitting">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            {{ commentSubmitting ? '提交中...' : '发送' }}
          </button>
        </div>
      </div>
      <div class="comments-list">
        <div v-if="commentsLoading" class="comments-loading">
          <div class="comments-loading-dots"><span></span><span></span><span></span></div>
        </div>
        <div v-else-if="comments.length === 0" style="text-align:center;padding:20px;color:var(--text-tertiary);">
          暂无评论，来说两句吧
        </div>
        <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">
            <img :src="getItemAvatar(comment)" :alt="comment.nickname">
          </div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="comment-nickname">{{ comment.nickname }}</span>
              <span class="comment-time">{{ formatCommentTime(comment.createdAt) }}</span>
            </div>
            <!-- 客户端信息标签 -->
            <div class="comment-info-tags" v-if="comment.location || comment.os || comment.browser">
              <span v-if="comment.location && comment.location !== 'Unknown' && comment.location !== '未知'" class="comment-info-tag comment-info-location">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </span>
                {{ comment.location }}
              </span>
              <span v-if="comment.os && comment.os !== 'Unknown' && comment.os !== '未知'" class="comment-info-tag">
                <span v-html="getOsIcon(comment.os)"></span>
                {{ comment.os }}
              </span>
              <span v-if="comment.browser && comment.browser !== 'Unknown' && comment.browser !== '未知'" class="comment-info-tag">
                <span v-html="getBrowserIcon(comment.browser)"></span>
                {{ comment.browser }}
              </span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { getPost, getPostContent, posts } = usePosts()
const { parse, removeFirstH1, removePublishQuote } = useMarkdown()
const { enhanceMarkdownBody } = useContentEnhance()
const { getOsIcon, getBrowserIcon } = useClientIcons()

// 侧边栏配置 — 立即在 setup 阶段设置，而不是等 onMounted
const setSidebarConfig = inject('setSidebarConfig', () => {})
const setTocItems = inject('setTocItems', () => {})
const setActiveTocId = inject('setActiveTocId', () => {})

// 文章页：立即告知 layout 显示 TOC，隐藏其他
setSidebarConfig({
  stats: false,
  siteInfo: false,
  social: false,
  announcement: false,
  log: false,
  toc: true,
})

// 文章数据
const loading = ref(true)
const error = ref(null)
const post = ref(null)
const contentHtml = ref('')
const markdownBody = ref(null)

// 评论
const comments = ref([])
const commentsLoading = ref(true)
const commentQQ = ref('')
const commentNickname = ref('')
const commentContent = ref('')
const commentSubmitting = ref(false)
const commentAvatar = ref("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%234f8fff'/%3E%3Cstop offset='100%25' stop-color='%236c5ce7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='40' fill='url(%23g)'/%3E%3Ccircle cx='40' cy='30' r='12' fill='rgba(255,255,255,0.85)'/%3E%3Cellipse cx='40' cy='58' rx='20' ry='14' fill='rgba(255,255,255,0.85)'/%3E%3C/svg%3E")
const defaultAvatar = commentAvatar.value


// Toast
const { toast } = useToast()


const isValidQQ = (qq) => /^\d{5,12}$/.test(String(qq || '').trim())
const getItemAvatar = (item) => {
  const qq = String(item?.qq || '').trim()
  if (isValidQQ(qq)) return `/api/proxy/qq-avatar?qq=${encodeURIComponent(qq)}`
  return item?.avatar || defaultAvatar
}

// 上下篇
const prevPost = computed(() => {
  if (!post.value) return null
  const sorted = [...posts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const idx = sorted.findIndex(p => p.id === post.value.id)
  return idx > 0 ? sorted[idx - 1] : null
})

const nextPost = computed(() => {
  if (!post.value) return null
  const sorted = [...posts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const idx = sorted.findIndex(p => p.id === post.value.id)
  return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null
})

const formatNavDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear().toString().slice(-2)}年${date.getMonth() + 1}月${date.getDate()}日`
}

const formatCommentTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (mins < 1440) return `${Math.floor(mins / 60)}小时前`
  if (mins < 10080) return `${Math.floor(mins / 1440)}天前`
  return date.toLocaleDateString('zh-CN')
}

// 加载文章
onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id
    const postMeta = await getPost(id)
    if (!postMeta) {
      error.value = 'Post not found'
      return
    }
    post.value = postMeta

    // 更新页面标题
    useHead({ title: postMeta.title })

    // 加载内容
    const rawContent = await getPostContent(postMeta)
    let html = parse(rawContent)
    html = removeFirstH1(html)
    html = removePublishQuote(html)
    contentHtml.value = html

    // 加载评论
    loadComments(id)

    // 先关闭 loading，让 v-else 分支渲染出 DOM
    loading.value = false

    // 等 DOM 完全渲染后：先构建 TOC（取纯净标题文字），再增强内容（加 # 锚点等）
    await nextTick()
    await nextTick()
    buildTOC()
    enhanceContent()
    initScrollSpy()

  } catch (e) {
    error.value = e
    loading.value = false
  }
})

// 构建 TOC — 直接在 DOM 上给每个标题赋予 id，不依赖 marked renderer
const buildTOC = () => {
  if (!markdownBody.value) return
  const headings = markdownBody.value.querySelectorAll('h2, h3, h4, h5, h6')
  if (headings.length === 0) return
  const usedIds = new Set()
  const items = []
  headings.forEach((heading) => {
    // 以现有 id 作为基底；若不存在则用标题文字生成 slug
    let base = (heading.id || '').trim()
    if (!base) {
      base = (heading.textContent || '')
        .trim()
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'heading'
    }

    // 避免重复 id（关键：解决重复 key 导致的目录“跳动/乱高亮”）
    let finalId = base
    let counter = 2
    while (usedIds.has(finalId)) {
      finalId = `${base}-${counter++}`
    }
    heading.id = finalId
    usedIds.add(finalId)

    items.push({
      id: finalId,
      text: heading.textContent?.trim() || '',
      level: parseInt(heading.tagName[1])
    })
  })
  setTocItems(items)
}

// ====== 目录跟随 ======
let scrollSpyCleanup = null
let isTocUserInteracting = false
let tocScrollTimeout = null

const initScrollSpy = () => {
  if (scrollSpyCleanup) scrollSpyCleanup()
  if (!markdownBody.value) return

  const headers = Array.from(markdownBody.value.querySelectorAll('h2, h3, h4'))
  if (headers.length === 0) return

  const getTocEl = () => document.getElementById('toc-content')

  // 交互检测 - 鼠标/触摸在 TOC 上时暂停自动滚动（对齐旧版）
  const disableAutoScroll = () => {
    isTocUserInteracting = true
    clearTimeout(tocScrollTimeout)
  }

  const enableAutoScroll = () => {
    tocScrollTimeout = setTimeout(() => {
      isTocUserInteracting = false
    }, 800)
  }

  // 绑定交互事件（ClientOnly 可能晚渲染，尝试立即绑定 + 兜底延时一次）
  const bindInteractions = () => {
    const tocContainer = getTocEl()
    if (!tocContainer) return
    if (tocContainer.dataset.tocScrollBound === '1') return
    tocContainer.dataset.tocScrollBound = '1'
    tocContainer.addEventListener('mouseenter', disableAutoScroll)
    tocContainer.addEventListener('touchstart', disableAutoScroll, { passive: true })
    tocContainer.addEventListener('wheel', disableAutoScroll, { passive: true })
    tocContainer.addEventListener('mouseleave', enableAutoScroll)
    tocContainer.addEventListener('touchend', enableAutoScroll, { passive: true })
  }
  bindInteractions()
  const bindTimer = setTimeout(bindInteractions, 300)

  const highlightActiveTOC = () => {
    const tocContainer = getTocEl()
    if (!tocContainer) return

    const links = tocContainer.querySelectorAll('.toc-link')
    if (links.length === 0) return

    // 视口顶部的检测线（与旧版一致）
    const topOffset = 100
    let currentActive = null

    for (const header of headers) {
      const rect = header.getBoundingClientRect()
      if (rect.top <= topOffset) {
        currentActive = header
      } else {
        break
      }
    }

    // 若还没滚到第一个标题之前，则不高亮
    if (!currentActive && headers.length > 0) {
      const firstRect = headers[0].getBoundingClientRect()
      if (firstRect.top > topOffset) {
        currentActive = null
      }
    }

    // 移除所有 active
    links.forEach(link => link.classList.remove('active'))

    if (currentActive) {
      // 同步更新移动端目录高亮
      setActiveTocId(currentActive.id)

      const activeLink = tocContainer.querySelector(`.toc-link[data-target="${currentActive.id}"]`)
      if (activeLink) {
        activeLink.classList.add('active')

        // 自动滚动 TOC 容器居中
        if (!isTocUserInteracting) {
          const containerRect = tocContainer.getBoundingClientRect()
          const linkRect = activeLink.getBoundingClientRect()
          const relativeTop = linkRect.top - containerRect.top
          const currentScrollTop = tocContainer.scrollTop
          const targetScroll = currentScrollTop + relativeTop - (tocContainer.clientHeight / 2) + (linkRect.height / 2)
          tocContainer.scrollTo({ top: targetScroll, behavior: 'smooth' })
        }
      }
    } else {
      setActiveTocId('')
    }
  }

  // 滚动监听（使用 rAF throttle，对齐旧版）
  let ticking = false
  const tocScrollHandler = function () {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        highlightActiveTOC()
        ticking = false
      })
      ticking = true
    }
  }

  document.addEventListener('scroll', tocScrollHandler, { capture: true, passive: true })
  const initTimer = setTimeout(() => {
    highlightActiveTOC()
  }, 100)

  scrollSpyCleanup = () => {
    document.removeEventListener('scroll', tocScrollHandler, { capture: true })
    clearTimeout(initTimer)
    clearTimeout(bindTimer)
    clearTimeout(tocScrollTimeout)
    isTocUserInteracting = false

    const tocContainer = getTocEl()
    if (tocContainer) {
      tocContainer.removeEventListener('mouseenter', disableAutoScroll)
      tocContainer.removeEventListener('mouseleave', enableAutoScroll)
      tocContainer.removeEventListener('touchstart', disableAutoScroll)
      tocContainer.removeEventListener('wheel', disableAutoScroll)
      tocContainer.removeEventListener('touchend', enableAutoScroll)
      delete tocContainer.dataset.tocScrollBound
    }
  }
}

onUnmounted(() => {
  if (scrollSpyCleanup) scrollSpyCleanup()
})

// 增强内容
const enhanceContent = () => {
  enhanceMarkdownBody(markdownBody.value)
}

// 加载评论
const loadComments = async (postId) => {
  commentsLoading.value = true
  try {
    const data = await $fetch(`/api/comments/${postId}`)
    if (data && data.success) {
      comments.value = data.data || []
    }
  } catch {
    toast('评论加载失败', 'error')
  } finally {
    commentsLoading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  const qq = commentQQ.value.trim()
  const nickname = commentNickname.value.trim()
  const content = commentContent.value.trim()

  if (!qq || !nickname || !content) {
    toast('请填写所有必填项', 'warning')
    return
  }
  if (!isValidQQ(qq)) {
    toast('请输入正确的QQ号', 'warning')
    return
  }

  commentSubmitting.value = true
  try {
    const data = await $fetch(`/api/comments/${post.value.id}`, {
      method: 'POST',
      body: {
        nickname,
        qq,
        content
      }
    })
    if (data && data.success) {
      toast('评论发表成功', 'success')
      commentContent.value = ''
      // 重新加载评论
      await loadComments(post.value.id)
    } else {
      toast(data?.message || '评论发表失败', 'error')
    }
  } catch (e) {
    toast(e?.data?.message || e?.message || '网络错误，请稍后重试', 'error')
  } finally {
    commentSubmitting.value = false
  }
}

// 获取 QQ 头像
const fetchQQAvatar = async () => {
  if (!isValidQQ(commentQQ.value)) return
  try {
    commentAvatar.value = `/api/proxy/qq-avatar?qq=${commentQQ.value.trim()}`
  } catch {
    // 头像获取失败
  }
}

// QQ 输入实时头像预览（对齐旧版：500ms 防抖）
let qqDebounce = null
watch(commentQQ, (val) => {
  if (typeof window === 'undefined') return
  clearTimeout(qqDebounce)
  qqDebounce = setTimeout(() => {
    const qq = String(val || '').trim()
    if (isValidQQ(qq)) commentAvatar.value = `/api/proxy/qq-avatar?qq=${qq}`
  }, 500)
})

// 评论轮询刷新（对齐旧版：30s）
let commentPollTimer = null
onMounted(() => {
  commentPollTimer = setInterval(() => {
    if (!document.hidden && post.value?.id) loadComments(post.value.id)
  }, 30000)
})

onUnmounted(() => {
  clearTimeout(qqDebounce)
  if (commentPollTimer) clearInterval(commentPollTimer)
})
</script>
