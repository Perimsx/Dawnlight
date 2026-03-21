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
              rel="noopener noreferrer"
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
            <p v-if="linksData.recommended.length === 0" style="color:var(--text-tertiary);padding:20px 0;">暂无友链</p>
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
            <ul v-if="linksData.requirements.length">
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

<script setup lang="ts">
const { config } = useSiteConfig()
const { parse } = useMarkdown()
const { siteTitle, siteName, siteDescription, canonicalUrl } = usePageSeo()

const setSidebarConfig = inject<(config: Record<string, boolean>) => void>('setSidebarConfig', () => {})
setSidebarConfig({
  stats: false,
  siteInfo: false,
  social: false,
  announcement: false,
  log: false,
  toc: false,
  blogInfo: true
})

const pageTitle = computed(() => `${String(config.value.site?.title || '').trim() || siteTitle.value} | 友情链接`)
const pageDescription = computed(() => `${siteDescription.value} 这里是友情链接与友链申请页面。`)

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

interface LinkItem {
  name: string
  url: string
  avatar: string
  description: string
}

interface LinksData {
  recommended: LinkItem[]
  applicationTitle: string
  applicationInfo: string
  requirements: string[]
  note: string
}

const normalizeLinksData = (raw: any): LinksData => {
  const recommendedRaw = Array.isArray(raw?.recommended) ? raw.recommended : []
  const recommended = recommendedRaw
    .map((item: any) => {
      const name = String(item?.name || '').trim()
      const url = String(item?.url || '').trim()
      if (!name || !url) return null
      return {
        name,
        url,
        avatar: String(item?.avatar || '').trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
        description: String(item?.description || '').trim()
      }
    })
    .filter((item: LinkItem | null): item is LinkItem => !!item)

  const applicationTitle = String(raw?.applicationTitle || '友链申请').trim() || '友链申请'
  const applicationInfo = String(raw?.applicationInfo || '')
  const requirements = (Array.isArray(raw?.requirements) ? raw.requirements : [])
    .map((item: unknown) => String(item || '').trim())
    .filter(Boolean)
  const note = String(raw?.note || '').trim()

  return {
    recommended,
    applicationTitle,
    applicationInfo,
    requirements,
    note
  }
}

const infoCollapsed = ref(false)
const linksData = ref<LinksData>(normalizeLinksData({
  recommended: [],
  applicationTitle: '友链申请',
  applicationInfo: '欢迎交换友链。',
  requirements: [],
  note: ''
}))

const renderedInfo = computed(() => parse(linksData.value.applicationInfo || ''))

const loadLinks = async () => {
  try {
    const data = await $fetch<{ success?: boolean; data?: unknown }>('/api/links')
    if (data?.success && data.data) {
      linksData.value = normalizeLinksData(data.data as any)
      return
    }
  } catch {
    // fallback to local config
  }

  if (config.value.links) {
    linksData.value = normalizeLinksData(config.value.links)
  }
}

onMounted(() => {
  loadLinks()
})
</script>

<style scoped>
@media (max-width: 768px) {
  .links-section-title {
    margin-bottom: 10px;
  }

  .links-info-header {
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .links-container {
    padding: 12px 10px;
  }

  .links-grid {
    gap: 10px;
  }

  .link-card {
    padding: 10px;
  }

  .link-title {
    font-size: 0.86rem;
  }

  .link-desc {
    font-size: 0.75rem;
    line-height: 1.45;
  }
}

@media (max-width: 390px) {
  .links-info-header h3 {
    font-size: 0.92rem;
  }
}
</style>
