function normalizeOrigin(input: string): string {
  const raw = String(input || '').trim()
  if (!raw) return ''
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const url = new URL(withProtocol)
    return `${url.protocol}//${url.host}`
  } catch {
    return ''
  }
}

export const usePageSeo = () => {
  const route = useRoute()
  const reqUrl = useRequestURL()
  const { config } = useSiteConfig()

  const siteTitle = computed(() => String(config.value.site?.title || '').trim() || 'Dawnlight')
  const siteName = computed(() => String(config.value.site?.name || '').trim() || siteTitle.value)
  const siteDescription = computed(() => {
    return String(config.value.site?.slogan || config.value.author?.bio || '').trim()
      || '记录与分享技术、实践与思考。'
  })

  const siteOrigin = computed(() => {
    const configured = normalizeOrigin(String(config.value.siteInfo?.domain || '').trim())
    if (configured) return configured
    const protocol = reqUrl.protocol || 'https:'
    const host = reqUrl.host || ''
    return host ? `${protocol}//${host}` : ''
  })

  const canonicalPath = computed(() => {
    const p = String(route.path || '/')
    return p.startsWith('/') ? p : `/${p}`
  })

  const canonicalUrl = computed(() => {
    return siteOrigin.value ? `${siteOrigin.value}${canonicalPath.value}` : canonicalPath.value
  })

  const toAbsoluteUrl = (input: string): string => {
    const raw = String(input || '').trim()
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    if (raw.startsWith('//')) {
      return `${reqUrl.protocol || 'https:'}${raw}`
    }
    if (!siteOrigin.value) return raw
    if (raw.startsWith('/')) return `${siteOrigin.value}${raw}`
    return `${siteOrigin.value}/${raw}`
  }

  return {
    siteTitle,
    siteName,
    siteDescription,
    siteOrigin,
    canonicalPath,
    canonicalUrl,
    toAbsoluteUrl
  }
}
