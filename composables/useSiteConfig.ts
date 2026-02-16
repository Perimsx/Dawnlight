interface SiteConfig {
    site: {
        name: string
        title: string
        slogan: string
        logo: string
        favicon: string
        copyright: string
        announcement?: string
        announcements?: Array<{
            content: string
            type?: string
            active?: boolean
        }>
    }
    author: {
        name: string
        bio: string
        email: string
        birthYear?: number
        socials: Array<{
            name: string
            url: string
            icon?: string
            description?: string
            background?: string
            color?: string
        }>
    }
    homepage: {
        carouselEnabled: boolean
        itemsPerPage: number
        carouselCount: number
        defaultSort: string
    }
    navigation: Array<{
        name: string
        path: string
        icon: string
    }>
    siteInfo: {
        startTime?: string
        icp?: string
        policeBeian?: string
        imageStorage?: string
        softwareLicense?: string
        articleLicense?: string
        domain?: string
        logs: Array<{
            date: string
            content: string
        }>
    }
    links?: {
        recommended: Array<{
            name: string
            url: string
            avatar: string
            description: string
        }>
        applicationTitle?: string
        applicationInfo?: string
        requirements?: string[]
        note?: string
    }
    loaded: boolean
    [key: string]: any
}

// 默认配置
const defaultConfig: SiteConfig = {
    site: {
        name: 'Perimsx',
        title: 'Perimsx-blog',
        slogan: '欢迎莅临',
        logo: 'https://cdn-visitor-eo.7moor-fs2.com/im/1cf621c0-5c37-11e9-9460-658dbd81beae/2026-01-13-13:23:41/1768281821670/621f50a2-cb95-4e17-b82d-65408f3822b6.png',
        favicon: 'https://cdn-visitor-eo.7moor-fs2.com/im/1cf621c0-5c37-11e9-9460-658dbd81beae/2026-01-12-12:31:34/1768192294778/50dbdabe-ac32-4cea-81e9-27b0b982e598.png',
        copyright: '© 2025-2026 Perimsx'
    },
    author: {
        name: 'Perimsx',
        bio: '你好',
        email: 'Perimsx@qq.com',
        birthYear: 2006,
        socials: [
            { name: '1', url: 'https://perimsx.fun', icon: '🔗', description: '111111111' }
        ]
    },
    homepage: {
        carouselEnabled: true,
        itemsPerPage: 5,
        carouselCount: 10,
        defaultSort: 'desc'
    },
    navigation: [
        { name: '首页', path: '/', icon: 'home' },
        { name: '分类', path: '/categories', icon: 'categories' },
        { name: '归档', path: '/archives', icon: 'archives' },
        { name: '友链', path: '/links', icon: 'links' }
    ],
    siteInfo: {
        startTime: '2025-11-10',
        icp: '鄂ICP备2025157857号',
        policeBeian: '1',
        imageStorage: '图仓-聚合分发图床',
        softwareLicense: 'MIT',
        articleLicense: 'CC BY-NC-SA 4.0',
        domain: 'perimsx.fun',
        logs: [
            { date: '2026-01-17', content: '11111' }
        ]
    },
    links: {
        recommended: [],
        applicationTitle: '申请友链',
        applicationInfo: '欢迎交换友链！',
        requirements: [],
        note: ''
    },
    loaded: false
}

export const useSiteConfig = () => {
    const config = useState<SiteConfig>('siteConfig', () => ({ ...defaultConfig }))

    const fetchConfig = async () => {
        if (config.value.loaded) return

        try {
            const data = await $fetch<{ success: boolean; data: Partial<SiteConfig> }>('/api/config')
            if (data && data.success) {
                config.value = {
                    ...defaultConfig,
                    ...data.data,
                    site: { ...defaultConfig.site, ...(data.data.site || {}) },
                    author: { ...defaultConfig.author, ...(data.data.author || {}) },
                    homepage: { ...defaultConfig.homepage, ...(data.data.homepage || {}) },
                    siteInfo: { ...defaultConfig.siteInfo, ...(data.data.siteInfo || {}) },
                    navigation: data.data.navigation || defaultConfig.navigation,
                    links: data.data.links || defaultConfig.links,
                    loaded: true
                }
                return
            }
        } catch {
            // API 不可用
        }

        try {
            const data = await $fetch<Partial<SiteConfig>>('/config/site.json')
            if (data) {
                config.value = {
                    ...defaultConfig,
                    ...data,
                    site: { ...defaultConfig.site, ...(data.site || {}) },
                    author: { ...defaultConfig.author, ...(data.author || {}) },
                    homepage: { ...defaultConfig.homepage, ...(data.homepage || {}) },
                    siteInfo: { ...defaultConfig.siteInfo, ...(data.siteInfo || {}) },
                    navigation: data.navigation || defaultConfig.navigation,
                    loaded: true
                }
                return
            }
        } catch {
            // 静态文件不可用
        }

        // 使用默认配置
        config.value = { ...defaultConfig, loaded: true }
    }

    // 导航图标映射
    const getNavIcon = (name: string): string => {
        if (/\p{Emoji}/u.test(name)) return name

        const icons: Record<string, string> = {
            'home': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
            'archives': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
            'categories': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
            'links': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
            'about': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
            'rss': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>'
        }
        return icons[name] || icons['home']
    }

    // 社交平台图标映射
    const getSocialIcon = (name: string): string => {
        const lowerName = name.toLowerCase()
        const icons: Record<string, string> = {
            'github': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
            'twitter': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'bilibili': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>',
            'email': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
            'mail': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
            'telegram': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
            'discord': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
            'youtube': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
        }
        for (const [key, svg] of Object.entries(icons)) {
            if (lowerName.includes(key)) return svg
        }
        return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    }

    return {
        config,
        fetchConfig,
        getNavIcon,
        getSocialIcon
    }
}
