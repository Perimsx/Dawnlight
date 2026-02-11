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

    <!-- 悬浮分页器 -->
    <Transition name="pager-float">
      <div v-if="totalPages > 1 && !atBottom" class="pg-float" key="float">
        <button class="pg-float-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pg-float-num">{{ currentPage }}<span>/{{ totalPages }}</span></span>
        <button class="pg-float-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </Transition>

    <!-- 底部分页器 -->
    <Transition name="pager-bottom">
      <nav v-if="totalPages > 1 && atBottom" class="pg-bar" key="bottom">
        <button class="pg-nav" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          上一页
        </button>
        <div class="pg-nums">
          <template v-for="(p, i) in pageNumbers" :key="i">
            <span v-if="p === '...'" class="pg-ellipsis">…</span>
            <button v-else class="pg-num" :class="{ active: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
          </template>
        </div>
        <button class="pg-nav" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
          下一页
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>
    </Transition>
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
    // 桌面端：.main-column 自身滚动
    if (mainCol && mainCol.scrollHeight > mainCol.clientHeight + 20) {
      atBottom.value = mainCol.scrollHeight - mainCol.scrollTop - mainCol.clientHeight < 80
      return
    }
    // 平板/移动端：页面整体滚动（body / html / layout-container）
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    )
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (docH - window.innerHeight > 20) {
      atBottom.value = docH - scrollTop - window.innerHeight < 120
    } else {
      // 内容不足一屏时，视为已到底部以显示底部分页器
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

/* ===== 悬浮分页器 ===== */
.pg-float {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-md);
  gap: 6px;
}
.pg-float-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: none; background: none;
  cursor: pointer; color: var(--text-secondary); border-radius: 8px;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1); padding: 0;
}
.pg-float-btn svg { width: 14px; height: 14px; }
.pg-float-btn:hover:not(:disabled) {
  background: var(--accent-light);
  color: var(--accent-color);
  transform: scale(1.05);
}
.pg-float-btn:active:not(:disabled) {
  transform: scale(0.95);
}
.pg-float-btn:disabled { opacity: .25; cursor: default; }
.pg-float-num {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  padding: 0 4px; user-select: none; white-space: nowrap;
}
.pg-float-num span { font-weight: 400; color: var(--text-tertiary); font-size: 12px; }

.pager-float-enter-active { transition: opacity .25s, transform .25s ease; }
.pager-float-leave-active { transition: opacity .15s, transform .15s; }
.pager-float-enter-from { opacity: 0; transform: translateX(-50%) translateY(10px); }
.pager-float-leave-to   { opacity: 0; transform: translateX(-50%) translateY(6px); }

/* ===== 底部分页器 ===== */
.pg-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 4px 0 4px;
}

.pager-bottom-enter-active { transition: opacity .25s ease; }
.pager-bottom-leave-active { transition: opacity .15s ease; }
.pager-bottom-enter-from, .pager-bottom-leave-to { opacity: 0; }

/* 上一页/下一页按钮 */
.pg-nav {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 5px 8px; border: none; border-radius: 8px;
  background: none; cursor: pointer;
  font-size: 13px; font-weight: 500; color: var(--text-tertiary);
  transition: color .2s, background .2s; white-space: nowrap;
}
.pg-nav svg { width: 14px; height: 14px; flex-shrink: 0; }
.pg-nav:hover:not(:disabled) { color: var(--text-primary); background: rgba(0,0,0,.04); }
[data-theme="dark"] .pg-nav:hover:not(:disabled) { background: rgba(255,255,255,.06); }
.pg-nav:disabled { opacity: .3; cursor: default; }

/* 页码区域 */
.pg-nums { display: flex; align-items: center; gap: 1px; }

.pg-num {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px;
  font-size: 13px; font-weight: 500;
  color: var(--text-secondary); background: none;
  border: none; border-radius: 8px;
  cursor: pointer; padding: 0 2px;
  transition: color .15s, background .15s;
  user-select: none;
}
.pg-num:hover:not(.active) { color: var(--text-primary); background: rgba(0,0,0,.04); }
[data-theme="dark"] .pg-num:hover:not(.active) { background: rgba(255,255,255,.06); }
.pg-num.active {
  color: var(--accent-color); font-weight: 700;
  background: rgba(var(--accent-rgb), .08);
  pointer-events: none;
}

.pg-ellipsis {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 12px; height: 32px;
  font-size: 14px; color: var(--text-tertiary);
  user-select: none; letter-spacing: 2px;
}

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .pg-float { bottom: 20px; padding: 3px; }
  .pg-float-btn { width: 26px; height: 26px; }
  .pg-float-btn svg { width: 11px; height: 11px; }
  .pg-float-num { font-size: 12px; padding: 0 2px; }
  .pg-float-num span { font-size: 11px; }
  .pg-bar { gap: 2px; margin: 2px 0 4px; }
  .pg-nav { padding: 4px 6px; font-size: 12px; }
  .pg-num { min-width: 28px; height: 28px; font-size: 12px; border-radius: 6px; }
  .pg-ellipsis { height: 28px; font-size: 12px; }
}
@media (max-width: 480px) {
  .pg-nav span { display: none; }
  .pg-nav { padding: 5px 6px; }
  .pg-nums { gap: 1px; }
  .pg-num { min-width: 26px; height: 26px; font-size: 11px; }
  .pg-ellipsis { height: 26px; font-size: 11px; min-width: 10px; }
}
</style>
