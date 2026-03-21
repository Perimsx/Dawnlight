<template>
  <div class="glass-card category-detail-container fade-in">
    <div class="category-detail-header">
      <NuxtLink to="/categories" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        返回分类
      </NuxtLink>
      <div class="category-title-wrap">
        <h1 class="page-title">
          <span class="category-tag-icon">#</span>{{ decodedTag }}
        </h1>
        <span class="category-post-count">共 {{ filteredPosts.length }} 篇文章</span>
      </div>
    </div>

    <div class="category-toolbar">
      <div class="category-search-bar">
        <input type="text" :placeholder="`在「${decodedTag}」分类中搜索...`" v-model="searchQuery">
      </div>
      <button class="category-sort-btn" @click="toggleSort">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          :style="{ transform: catSort === 'asc' ? 'rotate(180deg)' : '' }">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
        <span>{{ catSort === 'desc' ? '最新优先' : '最早优先' }}</span>
      </button>
    </div>

    <div class="category-posts-list">
      <div v-if="filteredPosts.length === 0" class="empty-category">
        {{ searchQuery ? '没有找到匹配的文章' : '该分类下暂无文章' }}
      </div>
      <NuxtLink
        v-else
        v-for="post in filteredPosts"
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
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { config } = useSiteConfig()
const { getPostsByTag } = usePosts()
const { siteTitle, siteName, siteDescription, canonicalUrl } = usePageSeo()

const setSidebarConfig = inject<(config: Record<string, boolean>) => void>('setSidebarConfig', () => {})
setSidebarConfig({
  stats: false,
  siteInfo: false,
  social: false,
  announcement: false,
  log: true,
  toc: false
})

const decodedTag = computed(() => {
  const raw = Array.isArray(route.params.tag) ? route.params.tag[0] : route.params.tag
  const value = String(raw || '')
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
})

const pageTitle = computed(() => `${String(config.value.site?.title || '').trim() || siteTitle.value} | ${decodedTag.value}`)
const pageDescription = computed(() => `${siteDescription.value} 查看分类「${decodedTag.value}」下的全部文章。`)

useSeoMeta({
  title: () => pageTitle.value,
  ogTitle: () => pageTitle.value,
  description: () => pageDescription.value,
  ogDescription: () => pageDescription.value,
  ogType: 'website',
  ogSiteName: () => siteName.value,
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ]
}))

const catSort = ref<'desc' | 'asc'>('desc')
const searchQuery = ref('')

const filteredPosts = computed(() => {
  let posts = getPostsByTag(decodedTag.value)
  if (searchQuery.value.trim()) {
    const kw = searchQuery.value.trim().toLowerCase()
    posts = posts.filter((p) => p.title.toLowerCase().includes(kw) || (p.description || '').toLowerCase().includes(kw))
  }
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return catSort.value === 'desc' ? dateB - dateA : dateA - dateB
  })
})

const toggleSort = () => {
  catSort.value = catSort.value === 'desc' ? 'asc' : 'desc'
}
</script>

<style scoped>
@media (max-width: 768px) {
  .category-detail-header {
    gap: 10px;
  }

  .category-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .category-toolbar .category-search-bar {
    min-width: 0;
    flex: 1 1 100%;
  }

  .category-sort-btn {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .category-title-wrap .page-title {
    font-size: 1.02rem;
  }

  .category-post-count {
    font-size: 0.76rem;
  }

  .category-toolbar .category-search-bar input {
    font-size: 0.82rem;
  }

  :deep(.post-meta) {
    gap: 5px 8px;
  }

  :deep(.post-meta-tags) {
    margin-left: 0 !important;
  }
}

@media (max-width: 390px) {
  .back-link {
    font-size: 0.74rem;
  }

  .category-sort-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
