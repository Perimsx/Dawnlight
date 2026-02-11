<template>
  <div class="archive-page fade-in">
    <!-- 顶部统计 -->
    <div class="archive-header-card">
      <div class="archive-header-main">
        <h1 class="archive-page-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          归档
        </h1>
        <div class="archive-header-stats">
          <span class="header-stat"><em>{{ posts.length }}</em> 篇文章</span>
          <span class="header-stat-sep">·</span>
          <span class="header-stat"><em>{{ formatWordCount(totalWords) }}</em></span>
          <span class="header-stat-sep">·</span>
          <span class="header-stat"><em>{{ sortedYears.length }}</em> 个年份</span>
          <template v-if="authorAge">
            <span class="header-stat-sep">·</span>
            <span class="header-stat"><em>{{ authorAge }}</em> 岁</span>
          </template>
        </div>
      </div>
      <div class="archive-header-controls">
        <button class="archive-sort-btn" @click="toggleSort">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            :style="{ transform: archiveSort === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
          <span>{{ archiveSort === 'desc' ? '最新优先' : '最早优先' }}</span>
        </button>
        <div class="archive-density">
          <span class="density-label">密度</span>
          <input type="range" class="density-slider" min="1" max="3" v-model="density">
        </div>
      </div>
    </div>

    <!-- 年份时间线 -->
    <div class="archive-timeline" :data-density="density">
      <section v-for="year in sortedYears" :key="year" class="archive-year-block" :data-year="year">
        <header class="archive-year-heading">
          <h2 class="year-num">{{ year }}</h2>
        </header>
        <ul class="archive-list">
          <li v-for="p in sortedYearPosts(year)" :key="p.id" class="archive-item">
            <NuxtLink :to="'/post/' + p.id" class="archive-link">
              <time class="archive-date">{{ formatShortDate(p.date) }}</time>
              <span class="archive-title">{{ p.title }}</span>
              <span v-if="p.tags && p.tags.length" class="archive-tags">
                <span v-for="tag in p.tags" :key="tag" class="post-tag">{{ tag }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
const { config } = useSiteConfig()
const { posts, getPostsByYear } = usePosts()

// 侧边栏
const setSidebarConfig = inject('setSidebarConfig', () => {})
setSidebarConfig({
  stats: false, siteInfo: false, social: false,
  announcement: false, log: true, toc: false
})

useHead({
  title: computed(() => `${config.value.site?.title || 'Dawnlight'} | 文章归档`)
})

const archiveSort = ref('desc')
const density = ref(2)

// 博主年龄
const authorAge = computed(() => {
  const birthYear = config.value.author?.birthYear
  if (!birthYear) return null
  return new Date().getFullYear() - birthYear
})

const postsByYear = computed(() => getPostsByYear())

const sortedYears = computed(() => {
  const years = Object.keys(postsByYear.value)
  return archiveSort.value === 'desc'
    ? years.sort((a, b) => parseInt(b) - parseInt(a))
    : years.sort((a, b) => parseInt(a) - parseInt(b))
})

const sortedYearPosts = (year) => {
  const yearPosts = [...(postsByYear.value[year] || [])]
  return archiveSort.value === 'desc'
    ? yearPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : yearPosts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const totalWords = computed(() => posts.value.reduce((sum, p) => sum + (p.wordCount || 0), 0))

const formatWordCount = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(2) + '万字'
  return count + '字'
}

const formatShortDate = (dateStr) => {
  const parts = dateStr.split('-')
  return parts[1] + '/' + (parts[2] || '').split(' ')[0]
}

const toggleSort = () => {
  archiveSort.value = archiveSort.value === 'desc' ? 'asc' : 'desc'
}
</script>
