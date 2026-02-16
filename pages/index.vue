<template>
  <div class="content-area">
    <!-- 精选文章横向滚动区 -->
    <div v-if="featuredPosts.length > 0" class="featured-section">
      <div class="featured-header">
        <h3 class="featured-title">精选文章</h3>
        <span class="featured-scroll-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="7"></rect>
            <line x1="12" y1="6" x2="12" y2="10"></line>
          </svg>
          滚轮滑动浏览
        </span>
      </div>
      <div class="featured-scroll-wrapper">
        <div class="featured-scroll-container">
          <div class="featured-scroll" ref="featuredScrollEl">
            <NuxtLink
              v-for="post in duplicatedFeatured"
              :key="post._key"
              :to="'/post/' + post.id"
              class="featured-card"
            >
              <img class="featured-card-cover" :src="post.cover || `https://picsum.photos/seed/${post.id}/500/300`" :alt="post.title" loading="lazy">
              <span v-if="post.tags && post.tags.length" class="featured-tag-badge">#{{ post.tags[0] }}</span>
              <div class="featured-card-content">
                <h3 class="featured-card-title">{{ post.title }}</h3>
                <div class="featured-card-date">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{{ post.date?.split(' ')[0] }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="glass-card toolbar-section toolbar-gap">
      <span>全部文章</span>
      <div class="sort-options">
        <span class="sort-btn" :class="{ active: sortOrder === 'desc' }" @click="setSort('desc')">最新</span>
        <span class="sort-btn" :class="{ active: sortOrder === 'asc' }" @click="setSort('asc')">最早</span>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="content-area">
      <div v-if="loading" class="loading-spinner"></div>
      <div v-else-if="paginatedPosts.length === 0" style="text-align:center;color:var(--text-tertiary);padding:24px 20px;">暂无文章</div>
      <template v-else>
        <NuxtLink
          v-for="post in paginatedPosts"
          :key="post.id"
          :to="'/post/' + post.id"
          class="post-card fade-in"
          :class="{ 'has-cover': post.cover }"
        >
          <div class="post-info">
            <h2 class="post-title">{{ post.title }}</h2>
            <p class="post-desc">{{ post.description }}</p>
            <div class="post-meta">
              <span class="post-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ post.date?.split(' ')[0] }}
              </span>
              <span class="post-words">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                {{ (post.wordCount || 0).toLocaleString('zh-CN') }}字
              </span>
              <span v-if="post.tags && post.tags.length > 0" class="post-meta-tags" style="display:flex;align-items:center;margin-left:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                <span v-for="tag in post.tags.slice(0, 2)" :key="tag" class="meta-tag-pill">{{ tag }}</span>
              </span>
            </div>
          </div>
          <div v-if="post.cover" class="post-cover-wrapper">
            <img :src="post.cover" :alt="post.title" class="post-cover" loading="lazy">
          </div>
        </NuxtLink>
      </template>
    </div>

    <!-- 悬浮分页器 (使用全局 style.css 样式) -->
    <div v-if="totalPages > 1" class="pagination" :class="{ spread: atBottom }">
      <button class="page-btn page-prev" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span class="page-indicator">
        <em>{{ currentPage }}</em> / {{ totalPages }}
      </span>
      <button class="page-btn page-next" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- 底部分页器 (使用全局 style.css 样式) -->
    <div v-if="totalPages > 1" class="pagination-footer" :class="{ 'footer-visible': atBottom }">
      <button class="page-prev" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="page-numbers">
        <template v-for="(p, i) in pageNumbers" :key="i">
          <span v-if="p === '...'" class="page-ellipsis" :style="{ '--i': i }">…</span>
          <button v-else class="page-num" :class="{ active: p === currentPage }" :style="{ '--i': i }" @click="goToPage(p)">
            {{ p }}
          </button>
        </template>
      </div>
      <button class="page-next" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

    </div>
  </div>
</template>

<script setup>
const { config } = useSiteConfig()
const { posts, loading, fetchPosts, getFeaturedPosts, getSortedPosts } = usePosts()

// 侧边栏配置
const setSidebarConfig = inject('setSidebarConfig', () => {})
setSidebarConfig({
  stats: true,
  siteInfo: true,
  social: true,
  announcement: true,
  log: false,
  toc: false,
})

// 页面标题
useHead({
  title: computed(() => config.value.site?.title || 'Dawnlight | 首页')
})

// 排序和分页状态
const sortOrder = ref('desc')
const currentPage = ref(1)
const itemsPerPage = 6
const atBottom = ref(false)
const featuredScrollEl = ref(null)

// 精选文章
const featuredPosts = computed(() => getFeaturedPosts.value.slice(0, config.value.homepage?.carouselCount || 10))

// 复制精选文章用于无缝循环
const duplicatedFeatured = computed(() => {
  const fp = featuredPosts.value
  return [...fp.map((p, i) => ({ ...p, _key: 'a-' + i })), ...fp.map((p, i) => ({ ...p, _key: 'b-' + i }))]
})

// 排序后的文章
const sortedPosts = computed(() => getSortedPosts(sortOrder.value))

// 分页
const totalPages = computed(() => Math.ceil(sortedPosts.value.length / itemsPerPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedPosts.value.slice(start, start + itemsPerPage)
})

// 页码数组
const pageNumbers = computed(() => {
  const cur = currentPage.value
  const total = totalPages.value
  const pages = []
  if (total <= 9) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }
  pages.push(1)
  if (cur > 4) pages.push('...')
  const start = Math.max(2, cur - 2)
  const end = Math.min(total - 1, cur + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < total - 3) pages.push('...')
  pages.push(total)
  return pages
})

const setSort = (order) => {
  sortOrder.value = order
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滚动到顶部
    const mainCol = document.querySelector('.main-column')
    if (mainCol) mainCol.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 精选区自动轮播
let featuredRAF = null
let featuredPaused = false

onMounted(() => {
  initFeaturedScroll()
  initScrollDetect()
})

onUnmounted(() => {
  if (featuredRAF) cancelAnimationFrame(featuredRAF)
})

const initFeaturedScroll = () => {
  const container = featuredScrollEl.value
  if (!container || featuredPosts.value.length === 0) return

  const firstCard = container.querySelector('.featured-card')
  const cardWidth = firstCard ? firstCard.offsetWidth : 240
  const computedGap = parseFloat(getComputedStyle(container).gap) || 16
  const originalWidth = featuredPosts.value.length * (cardWidth + computedGap)

  const SPEED = 0.5
  const tick = () => {
    if (!featuredPaused && container.scrollWidth > container.clientWidth) {
      container.scrollLeft += SPEED
      if (container.scrollLeft >= originalWidth) {
        container.scrollLeft -= originalWidth
      }
    }
    featuredRAF = requestAnimationFrame(tick)
  }
  featuredRAF = requestAnimationFrame(tick)

  // 鼠标悬停暂停
  const section = container.closest('.featured-section')
  if (section) {
    section.onmouseenter = () => { featuredPaused = true }
    section.onmouseleave = () => { featuredPaused = false }

    // 滚轮横向滚动
    let wheelTimer = null
    section.addEventListener('wheel', (e) => {
      let delta = e.shiftKey ? (e.deltaX || e.deltaY) : (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
      if (delta === 0 || container.scrollWidth <= container.clientWidth) return
      e.preventDefault()
      featuredPaused = true
      if (wheelTimer) clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => { featuredPaused = false }, 2000)
      container.scrollLeft += delta
      if (container.scrollLeft >= originalWidth) container.scrollLeft -= originalWidth
      else if (container.scrollLeft < 0) container.scrollLeft += originalWidth
    }, { passive: false, capture: true })

    // 触摸拖拽
    let touchStartX = 0, touchStartScroll = 0, touchTimer = null
    section.addEventListener('touchstart', (e) => {
      featuredPaused = true
      if (touchTimer) clearTimeout(touchTimer)
      touchStartX = e.touches[0].clientX
      touchStartScroll = container.scrollLeft
    }, { passive: true })
    section.addEventListener('touchmove', (e) => {
      const dx = touchStartX - e.touches[0].clientX
      container.scrollLeft = touchStartScroll + dx
      if (container.scrollLeft >= originalWidth) { container.scrollLeft -= originalWidth; touchStartScroll -= originalWidth }
      else if (container.scrollLeft < 0) { container.scrollLeft += originalWidth; touchStartScroll += originalWidth }
    }, { passive: true })
    section.addEventListener('touchend', () => {
      touchTimer = setTimeout(() => { featuredPaused = false }, 2000)
    }, { passive: true })
  }
}

// 检测是否滚到底部，切换分页器形态
const initScrollDetect = () => {
  const check = () => {
    const mainCol = document.querySelector('.main-column')
    // 桌面端：检查 .main-column 滚动
    if (mainCol && getComputedStyle(mainCol).overflowY !== 'visible') {
      if (mainCol.scrollHeight > mainCol.clientHeight + 20) {
        atBottom.value = mainCol.scrollHeight - mainCol.scrollTop - mainCol.clientHeight < 80
        return
      }
    }
    
    // 平板/移动端：检查全局滚动
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    )
    const winH = window.innerHeight
    
    // 如果页面足够长，检测是否滚到底部
    if (docH > winH + 20) {
      atBottom.value = docH - scrollY - winH < 120
    } else {
      // 内容很少，直接视为已到底部
      atBottom.value = true
    }
  }
  window.addEventListener('scroll', check, { passive: true })
  window.addEventListener('resize', check, { passive: true })
  const mainCol = document.querySelector('.main-column')
  if (mainCol) mainCol.addEventListener('scroll', check, { passive: true })
  // 额外监听 layout-container 滚动（平板可能用到）
  const layoutContainer = document.querySelector('.layout-container')
  if (layoutContainer && layoutContainer !== mainCol) {
    layoutContainer.addEventListener('scroll', check, { passive: true })
  }
  // 首次检测
  requestAnimationFrame(check)
}
</script>

<style scoped>
/* 工具栏与文章列表间距 */
.toolbar-gap { margin-bottom: 0.75rem; }

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  /* 可以在这里添加其他移动端样式适配 */
}
@media (max-width: 480px) {
  /* 可以在这里添加其他移动端样式适配 */
}
</style>
