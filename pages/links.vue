<template>
  <div>
    <div class="glass-card links-container fade-in">
      <h1 class="page-title">友情链接</h1>

      <div class="links-section">
        <h2 class="links-section-title">推荐友链</h2>
        <ClientOnly>
          <div class="links-grid">
            <a
              v-for="link in linksData.recommended"
              :key="link.name"
              :href="link.url"
              target="_blank"
              class="link-card"
            >
              <div class="link-avatar">
                <img :src="link.avatar" :alt="link.name" loading="lazy">
              </div>
              <div class="link-info">
                <h3 class="link-title">{{ link.name }}</h3>
                <p class="link-desc">{{ link.description }}</p>
              </div>
            </a>
            <p v-if="!linksData.recommended || linksData.recommended.length === 0" style="color:var(--text-tertiary);padding:20px 0;">暂无友链</p>
          </div>
          <template #fallback>
            <div class="links-grid">
              <p style="color:var(--text-tertiary);padding:20px 0;">加载中...</p>
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="links-info">
        <ClientOnly>
          <div class="links-info-header" @click="infoCollapsed = !infoCollapsed">
            <h3>{{ linksData.applicationTitle }}</h3>
            <svg class="links-info-toggle" :style="{ transform: infoCollapsed ? 'rotate(-90deg)' : '', transition: 'transform .2s' }"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div v-show="!infoCollapsed" class="links-info-body">
            <div class="links-info-content markdown-body" v-html="renderedInfo"></div>
            <ul v-if="linksData.requirements && linksData.requirements.length">
              <li v-for="req in linksData.requirements" :key="req">{{ req }}</li>
            </ul>
            <p v-if="linksData.note" class="links-note">{{ linksData.note }}</p>
          </div>
          <template #fallback>
            <div class="links-info-header">
              <h3>友链申请</h3>
            </div>
            <div class="links-info-body">
              <p style="color:var(--text-tertiary);padding:10px 0;">加载中...</p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
const { config } = useSiteConfig()
const { parse } = useMarkdown()

const setSidebarConfig = inject('setSidebarConfig', () => {})
setSidebarConfig({
  stats: false, siteInfo: false, social: false,
  announcement: false, log: false, toc: false,
  blogInfo: true
})

useHead({
  title: computed(() => `${config.value.site?.title || 'Dawnlight'} | 友情链接`)
})

const infoCollapsed = ref(false)

// 确保服务端和客户端使用相同的默认值，与配置文件保持一致
const linksData = ref({
  recommended: [],
  applicationTitle: '友链申请',
  applicationInfo: '欢迎交换友链！',
  requirements: [],
  note: ''
})

const renderedInfo = computed(() => parse(linksData.value.applicationInfo || ''))

const loadLinks = async () => {
  try {
    const data = await $fetch('/api/links')
    if (data?.success && data.data) {
      linksData.value = { ...linksData.value, ...data.data }
    }
  } catch {
    if (config.value.links) {
      linksData.value = { ...linksData.value, ...config.value.links }
    }
  }
}

// 在客户端加载数据，避免SSR水合不匹配
onMounted(() => {
  loadLinks()
})
</script>
