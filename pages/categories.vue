<template>
  <div class="categories-page fade-in">
    <div class="categories-header">
      <div class="categories-header-left">
        <h1 class="categories-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          分类
        </h1>
        <div class="categories-stats">
          <span class="cat-stat"><em>{{ totalTags }}</em> 个分类</span>
          <span class="cat-stat-sep">·</span>
          <span class="cat-stat"><em>{{ posts.length }}</em> 篇文章</span>
        </div>
      </div>
    </div>

    <div v-if="sortedTags.length === 0" class="categories-empty">暂无分类标签</div>
    <div v-else class="categories-cloud">
      <NuxtLink
        v-for="(tag, index) in sortedTags"
        :key="tag.name"
        :to="'/category/' + encodeURIComponent(tag.name)"
        class="category-tag"
        :style="{ animationDelay: index * 0.02 + 's' }"
      >
        <span class="tag-label">{{ tag.name }}</span>
        <span class="tag-num">{{ tag.count }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { config } = useSiteConfig()
const { posts, getAllTags } = usePosts()

const setSidebarConfig = inject('setSidebarConfig', () => {})
setSidebarConfig({
  stats: false, siteInfo: false, social: false,
  announcement: false, log: true, toc: false
})

useHead({
  title: computed(() => `${config.value.site?.title || 'Dawnlight'} | 文章分类`)
})

const tagMap = computed(() => getAllTags())

const sortedTags = computed(() => {
  return Object.entries(tagMap.value)
    .map(([name, posts]) => ({ name, count: posts.length }))
    .sort((a, b) => b.count - a.count)
})

const totalTags = computed(() => sortedTags.value.length)
</script>
