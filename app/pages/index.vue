<template>
  <div class="home-page content-area">
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

    <div class="glass-card toolbar-section toolbar-gap">
      <span>全部文章</span>
      <div class="sort-options">
        <span class="sort-btn" :class="{ active: sortOrder === 'desc' }" @click="setSort('desc')">最新</span>
        <span class="sort-btn" :class="{ active: sortOrder === 'asc' }" @click="setSort('asc')">最早</span>
      </div>
    </div>

    <div class="post-list">
      <div v-if="loading" class="loading-spinner"></div>
      <div v-else-if="paginatedPosts.length === 0" style="text-align:center;color:var(--text-tertiary);padding:24px 20px;">暂无文章</div>
      <TransitionGroup v-else name="float-in" tag="div" class="post-list-transition">
        <NuxtLink
          v-for="(post, index) in paginatedPosts"
          :key="post.id"
          :to="'/post/' + post.id"
          class="post-card fade-in"
          :class="{ 'has-cover': post.cover }"
          :style="{ '--delay': index * 0.05 + 's' }"
        >
          <div v-if="post.cover" class="post-cover-wrapper">
            <img :src="post.cover" :alt="post.title" class="post-cover" loading="lazy">
          </div>
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
        </NuxtLink>
      </TransitionGroup>
    </div>

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

    <div v-if="totalPages > 1" class="pagination-footer" :class="{ 'footer-visible': atBottom }">
      <button class="page-prev" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="page-numbers">
        <template v-for="(p, i) in pageNumbers" :key="i">
          <span v-if="p === '...'" class="page-ellipsis" :style="{ '--i': i }">...</span>
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

<script setup lang="ts">
const { config } = useSiteConfig()
const { loading, getFeaturedPosts, getSortedPosts } = usePosts()
const { siteTitle, siteName, siteDescription, canonicalUrl } = usePageSeo()

const setSidebarConfig = inject<(config: Record<string, boolean>) => void>('setSidebarConfig', () => {})
setSidebarConfig({
  stats: true,
  siteInfo: true,
  social: true,
  announcement: true,
  log: false,
  toc: false,
})

const homeTitle = computed(() => String(config.value.site?.title || '').trim() || siteTitle.value)
const homeDescription = computed(() => {
  return String(config.value.site?.slogan || '').trim() || siteDescription.value
})

useSeoMeta({
  title: () => homeTitle.value,
  ogTitle: () => homeTitle.value,
  description: () => homeDescription.value,
  ogDescription: () => homeDescription.value,
  ogType: 'website',
  ogSiteName: () => siteName.value,
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => homeTitle.value,
  twitterDescription: () => homeDescription.value
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ]
}))

const sortOrder = ref<'desc' | 'asc'>('desc')
const currentPage = ref(1)
const itemsPerPage = 6
const atBottom = ref(false)
const featuredScrollEl = ref<HTMLElement | null>(null)

const featuredPosts = computed(() => getFeaturedPosts.value.slice(0, config.value.homepage?.carouselCount || 10))

const duplicatedFeatured = computed(() => {
  const fp = featuredPosts.value
  return [...fp.map((p, i) => ({ ...p, _key: `a-${i}` })), ...fp.map((p, i) => ({ ...p, _key: `b-${i}` }))]
})

const sortedPosts = computed(() => getSortedPosts(sortOrder.value))
const totalPages = computed(() => Math.ceil(sortedPosts.value.length / itemsPerPage))
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedPosts.value.slice(start, start + itemsPerPage)
})

const pageNumbers = computed<(number | '...')[]>(() => {
  const cur = currentPage.value
  const total = totalPages.value
  const pages: (number | '...')[] = []
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

const setSort = (order: 'desc' | 'asc') => {
  sortOrder.value = order
  currentPage.value = 1
}

const goToPage = (page: number | '...') => {
  if (typeof page !== 'number') return
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    const mainCol = document.querySelector('.main-column')
    if (mainCol) {
      mainCol.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

let featuredRAF = 0
let featuredPaused = false
let cleanupFeaturedHandlers: (() => void) | null = null
let cleanupScrollHandlers: (() => void) | null = null
let stopFeaturedWatcher: (() => void) | null = null

const clearFeaturedScroll = () => {
  if (featuredRAF) {
    cancelAnimationFrame(featuredRAF)
    featuredRAF = 0
  }
  if (cleanupFeaturedHandlers) {
    cleanupFeaturedHandlers()
    cleanupFeaturedHandlers = null
  }
}

const initFeaturedScroll = () => {
  clearFeaturedScroll()

  const container = featuredScrollEl.value
  if (!container || featuredPosts.value.length === 0) return

  const firstCard = container.querySelector('.featured-card') as HTMLElement | null
  const cardWidth = firstCard ? firstCard.offsetWidth : 240
  const computedGap = parseFloat(getComputedStyle(container).gap) || 16
  const originalWidth = featuredPosts.value.length * (cardWidth + computedGap)
  if (originalWidth <= 0) return

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

  const section = container.closest('.featured-section') as HTMLElement | null
  if (!section) return

  let wheelTimer: ReturnType<typeof setTimeout> | null = null
  let touchTimer: ReturnType<typeof setTimeout> | null = null
  let touchStartX = 0
  let touchStartY = 0
  let touchStartScroll = 0

  const onMouseEnter = () => { featuredPaused = true }
  const onMouseLeave = () => { featuredPaused = false }
  const onWheel = (e: WheelEvent) => {
    let delta = e.shiftKey
      ? (e.deltaX || e.deltaY)
      : (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
    if (delta === 0 || container.scrollWidth <= container.clientWidth) return

    e.preventDefault()
    featuredPaused = true
    if (wheelTimer) clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => { featuredPaused = false }, 2000)

    container.scrollLeft += delta
    if (container.scrollLeft >= originalWidth) container.scrollLeft -= originalWidth
    else if (container.scrollLeft < 0) container.scrollLeft += originalWidth
  }
  const onTouchStart = (e: TouchEvent) => {
    if (!e.touches[0]) return
    featuredPaused = true
    if (touchTimer) clearTimeout(touchTimer)
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartScroll = container.scrollLeft
  }
  const onTouchMove = (e: TouchEvent) => {
    if (!e.touches[0]) return
    const dx = touchStartX - e.touches[0].clientX
    const dy = touchStartY - e.touches[0].clientY

    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault()
      container.scrollLeft = touchStartScroll + dx
      if (container.scrollLeft >= originalWidth) {
        container.scrollLeft -= originalWidth
        touchStartScroll -= originalWidth
      } else if (container.scrollLeft < 0) {
        container.scrollLeft += originalWidth
        touchStartScroll += originalWidth
      }
    }
  }
  const onTouchEnd = () => {
    if (touchTimer) clearTimeout(touchTimer)
    touchTimer = setTimeout(() => { featuredPaused = false }, 2000)
  }

  section.addEventListener('mouseenter', onMouseEnter)
  section.addEventListener('mouseleave', onMouseLeave)
  section.addEventListener('wheel', onWheel, { passive: false, capture: true })
  section.addEventListener('touchstart', onTouchStart, { passive: true })
  section.addEventListener('touchmove', onTouchMove, { passive: false })
  section.addEventListener('touchend', onTouchEnd, { passive: true })

  cleanupFeaturedHandlers = () => {
    if (wheelTimer) clearTimeout(wheelTimer)
    if (touchTimer) clearTimeout(touchTimer)
    section.removeEventListener('mouseenter', onMouseEnter)
    section.removeEventListener('mouseleave', onMouseLeave)
    section.removeEventListener('wheel', onWheel, true)
    section.removeEventListener('touchstart', onTouchStart)
    section.removeEventListener('touchmove', onTouchMove)
    section.removeEventListener('touchend', onTouchEnd)
  }
}

const clearScrollDetect = () => {
  if (cleanupScrollHandlers) {
    cleanupScrollHandlers()
    cleanupScrollHandlers = null
  }
}

const initScrollDetect = () => {
  clearScrollDetect()

  const check = () => {
    const mainCol = document.querySelector('.main-column') as HTMLElement | null
    if (mainCol && getComputedStyle(mainCol).overflowY !== 'visible') {
      if (mainCol.scrollHeight > mainCol.clientHeight + 20) {
        atBottom.value = mainCol.scrollHeight - mainCol.scrollTop - mainCol.clientHeight < 80
        return
      }
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    const winH = window.innerHeight
    atBottom.value = docH > winH + 20 ? (docH - scrollY - winH < 120) : true
  }

  const mainCol = document.querySelector('.main-column') as HTMLElement | null
  const layoutContainer = document.querySelector('.layout-container') as HTMLElement | null

  window.addEventListener('scroll', check, { passive: true })
  window.addEventListener('resize', check, { passive: true })
  if (mainCol) mainCol.addEventListener('scroll', check, { passive: true })
  if (layoutContainer && layoutContainer !== mainCol) {
    layoutContainer.addEventListener('scroll', check, { passive: true })
  }
  requestAnimationFrame(check)

  cleanupScrollHandlers = () => {
    window.removeEventListener('scroll', check)
    window.removeEventListener('resize', check)
    if (mainCol) mainCol.removeEventListener('scroll', check)
    if (layoutContainer && layoutContainer !== mainCol) {
      layoutContainer.removeEventListener('scroll', check)
    }
  }
}

onMounted(() => {
  stopFeaturedWatcher = watch(() => featuredPosts.value.length, async (len) => {
    if (len <= 0) {
      clearFeaturedScroll()
      return
    }
    await nextTick()
    initFeaturedScroll()
  }, { immediate: true })

  initScrollDetect()
})

onUnmounted(() => {
  if (stopFeaturedWatcher) {
    stopFeaturedWatcher()
    stopFeaturedWatcher = null
  }
  clearFeaturedScroll()
  clearScrollDetect()
})
</script>

<style scoped>
.toolbar-gap {
  margin-bottom: 0.25rem;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 1024px) {
  .featured-scroll-wrapper {
    margin: 0 -6px;
  }
}

@media (max-width: 768px) {
  .home-page {
    gap: 10px;
  }

  .featured-header {
    padding: 0 4px;
    align-items: center;
  }

  .featured-title {
    font-size: 0.98rem;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sort-options {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }

  .post-list {
    gap: 10px;
  }

  :deep(.post-meta-tags) {
    margin-left: 0 !important;
  }
}

@media (max-width: 480px) {
  .featured-section {
    margin-bottom: 2px;
  }

  .featured-scroll-wrapper {
    margin: 0 -12px;
    padding: 0 6px;
  }

  .featured-card {
    flex-basis: 172px;
    height: 108px;
  }

  .toolbar-section {
    padding: 6px 0;
  }

  .sort-options :deep(.sort-btn) {
    padding: 2px 7px;
    font-size: 0.78rem;
  }
}

@media (max-width: 430px) {
  .featured-scroll-hint {
    display: none;
  }

  .post-list {
    gap: 9px;
  }

  :deep(.post-meta) {
    gap: 5px 8px;
  }
}

@media (max-width: 390px) {
  .featured-card {
    flex-basis: 162px;
    height: 102px;
  }

  .toolbar-section {
    font-size: 0.88rem;
  }

  .sort-options :deep(.sort-btn) {
    font-size: 0.72rem;
  }
}
</style>
