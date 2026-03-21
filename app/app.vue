<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const { fetchConfig } = useSiteConfig()

// 使用 useAsyncData 包裹，SSR 失败时也不至于白屏
useAsyncData('siteConfig', async () => {
  await fetchConfig()
  return true
})
</script>
