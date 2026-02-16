<template>
  <aside class="sidebar-left">
    <div class="glass-card left-panel">
      <!-- 品牌区域 -->
      <div class="brand-area">
        <NuxtLink to="/admin/login" class="logo-avatar" title="管理后台">
          <img :src="config.site.logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'" :alt="config.site.name">
        </NuxtLink>
        <div class="brand-info">
          <NuxtLink to="/" class="brand-title">{{ config.site.name }}</NuxtLink>
          <p class="brand-slogan">{{ config.site.slogan }}</p>
        </div>
      </div>

      <!-- 搜索按钮 -->
      <button class="search-trigger-btn" id="search-trigger-btn" title="搜索 (Ctrl+K)" @click="$emit('openSearch')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>搜索文章...</span>
        <kbd>Ctrl+K</kbd>
      </button>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <NuxtLink
          v-for="nav in config.navigation"
          :key="nav.path"
          :to="nav.path"
          class="nav-item"
          :class="{ active: isActive(nav.path) }"
        >
          <span class="nav-icon" v-html="getNavIcon(nav.icon)"></span>
          <span>{{ nav.name }}</span>
        </NuxtLink>
      </nav>

      <!-- 底部功能区 -->
      <div class="left-footer">
        <TheThemeSwitcher />
        <div class="footer-info">
          <div class="copyright">{{ config.site.copyright }}</div>
          <div class="beian-info" v-if="hasBeian">
            <a v-if="config.siteInfo.icp" href="https://beian.miit.gov.cn/" target="_blank" class="beian-link">{{ config.siteInfo.icp }}</a>
            <span v-if="config.siteInfo.policeBeian && config.siteInfo.policeBeian !== '1'" class="police-beian">{{ config.siteInfo.policeBeian }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineEmits(['openSearch'])

const route = useRoute()
const { config, getNavIcon } = useSiteConfig()

const hasBeian = computed(() => {
  return (config.value.siteInfo?.icp && config.value.siteInfo.icp.trim() !== '') ||
    (config.value.siteInfo?.policeBeian && config.value.siteInfo.policeBeian.trim() !== '' && config.value.siteInfo.policeBeian !== '1')
})

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
