<template>
  <div>
    <!-- 移动端顶部导航 -->
    <header class="mobile-header" role="banner" aria-label="移动端顶部导航">
      <div class="mobile-brand">
        <img class="mobile-logo" :src="config.site.logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'" :alt="config.site.name">
        <span class="mobile-title">{{ config.site.name }}</span>
      </div>
      <button class="mobile-menu-btn" aria-label="打开菜单" :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- 移动端侧边栏 -->
    <TheMobileSidebar
      :is-open="mobileMenuOpen"
      @close="mobileMenuOpen = false"
      @search="handleMobileSearch"
    />

    <div class="mobile-overlay" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = false"></div>

    <!-- 阅读进度条 -->
    <div class="reading-progress" :class="{ active: isPostPage }" :style="{ width: readingProgress + '%' }"></div>

    <div class="layout-container">
      <!-- 左侧边栏 -->
      <TheSidebarLeft @open-search="searchOpen = true" />

      <!-- 主内容区 -->
      <main class="main-column">
        <slot />
      </main>

      <!-- 右侧边栏 -->
      <TheSidebarRight
        :show-stats="sidebarConfig.stats"
        :show-site-info="sidebarConfig.siteInfo"
        :show-social="sidebarConfig.social"
        :show-announcement="sidebarConfig.announcement"
        :show-log="sidebarConfig.log"
        :show-toc="sidebarConfig.toc"
        :show-blog-info="sidebarConfig.blogInfo"
        :toc-items="tocItems"
        :active-toc-id="activeTocId"
      />
    </div>

    <!-- 全局元素 -->
    <TheGlobalElements
      :show-back-btn="isPostPage"
      :show-comment-btn="isPostPage"
      :show-toc-btn="isPostPage && tocItems.length > 0"
      :toc-items="tocItems"
      :active-toc-id="activeTocId"
      :mobile-menu-open="mobileMenuOpen"
      v-model:search-open="searchOpen"
    />
  </div>
</template>

<script setup>
const route = useRoute()
const { config } = useSiteConfig()
const { fetchPosts } = usePosts()

// 状态
const mobileMenuOpen = ref(false)
const searchOpen = ref(false)
const readingProgress = ref(0)
const tocItems = ref([])
const activeTocId = ref('')

// 是否是文章页面
const isPostPage = computed(() => route.path.startsWith('/post/'))

// 侧边栏配置（由子页面通过 provide/inject 传递）
const sidebarConfig = ref({
  stats: true,
  siteInfo: true,
  social: true,
  announcement: true,
  log: false,
  toc: false,
  blogInfo: false
})

// 提供给子组件的方法
const defaultSidebarConfig = {
  stats: true, siteInfo: true, social: true, announcement: true,
  log: false, toc: false, blogInfo: false
}

const setSidebarConfig = (config) => {
  sidebarConfig.value = { ...defaultSidebarConfig, ...config }
}

const setTocItems = (items) => {
  tocItems.value = items
}

const setActiveTocId = (id) => {
  activeTocId.value = id
}

provide('setSidebarConfig', setSidebarConfig)
provide('setTocItems', setTocItems)
provide('setActiveTocId', setActiveTocId)

// 加载文章数据（用 useAsyncData 包裹，SSR 失败不会白屏）
useAsyncData('posts', async () => { await fetchPosts(); return true })

// 阅读进度条
onMounted(() => {
  const updateProgress = () => {
    if (!isPostPage.value) {
      readingProgress.value = 0
      return
    }
    const mainCol = document.querySelector('.main-column')
    if (mainCol && mainCol.scrollHeight > mainCol.clientHeight) {
      const progress = mainCol.scrollTop / (mainCol.scrollHeight - mainCol.clientHeight)
      readingProgress.value = Math.min(100, Math.max(0, progress * 100))
    } else {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      readingProgress.value = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
    }
  }

  window.addEventListener('scroll', updateProgress, { passive: true })
  const mainCol = document.querySelector('.main-column')
  if (mainCol) mainCol.addEventListener('scroll', updateProgress, { passive: true })
})

// 路由变化时关闭菜单 + 重置侧边栏/TOC
watch(() => route.path, () => {
  mobileMenuOpen.value = false
  // 路由变化时重置 TOC（子页面的 setup 会立即重新设置侧边栏配置）
  tocItems.value = []
  activeTocId.value = ''
})

const handleMobileSearch = (query) => {
  searchOpen.value = true
}
</script>
