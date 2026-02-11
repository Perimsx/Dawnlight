export interface Post {
    id: string
    title: string
    date: string
    description?: string
    tags: string[]
    category?: string
    cover?: string
    wordCount?: number
    readTime?: number
    views?: number
    likes?: number
    featured?: boolean
    file?: string
    content?: string
}

interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

export const usePosts = () => {
    const posts = useState<Post[]>('posts', () => [])
    const loading = useState<boolean>('postsLoading', () => false)
    const error = useState<any>('postsError', () => null)

    const fetchPosts = async () => {
        if (posts.value.length > 0) return // 已加载过
        loading.value = true
        error.value = null
        try {
            const data = await $fetch<ApiResponse<Post[]>>('/api/posts')
            if (data && data.success && Array.isArray(data.data)) {
                posts.value = data.data
                loading.value = false
                return
            }
        } catch {
            // API 不可用
        }

        try {
            // 回退到静态文件
            const data = await $fetch<Post[]>('/content/posts/list.json')
            if (Array.isArray(data)) {
                posts.value = data
                loading.value = false
                return
            }
        } catch {
            // 静态文件也不可用
        }

        error.value = '无法加载文章列表'
        loading.value = false
    }

    const getPost = async (id: string): Promise<Post | null> => {
        const existing = posts.value.find((p: Post) => p.id === id)
        if (existing) return existing

        if (posts.value.length === 0) {
            await fetchPosts()
            return posts.value.find((p: Post) => p.id === id) || null
        }
        return null
    }

    const getPostContent = async (post: Post): Promise<string> => {
        try {
            // 先尝试 API
            const data = await $fetch<ApiResponse<{ content: string; html: string }>>(`/api/posts/${post.id}/content`)
            if (data && data.success && data.data.content) {
                return data.data.content
            }
        } catch {
            // API 不可用
        }

        try {
            // 回退到静态文件
            const fileUrl = post.file ? `/${post.file}` : `/content/posts/${post.id}.md`
            const content = await $fetch<string>(fileUrl, { responseType: 'text' })
            return content
        } catch {
            return ''
        }
    }

    const getFeaturedPosts = computed(() => {
        return posts.value.filter((p: Post) => p.featured)
    })

    const getSortedPosts = (order: 'desc' | 'asc' = 'desc') => {
        return [...posts.value].sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return order === 'desc' ? dateB - dateA : dateA - dateB
        })
    }

    const getPostsByTag = (tag: string) => {
        return posts.value.filter((p: Post) => p.tags.includes(tag))
    }

    const getPostsByYear = () => {
        const grouped: Record<string, Post[]> = {}
        posts.value.forEach(post => {
            const year = post.date.split('-')[0]
            if (!grouped[year]) grouped[year] = []
            grouped[year].push(post)
        })
        return grouped
    }

    const getAllTags = () => {
        const tagMap: Record<string, Post[]> = {}
        posts.value.forEach(post => {
            post.tags.forEach(tag => {
                if (!tagMap[tag]) tagMap[tag] = []
                tagMap[tag].push(post)
            })
        })
        return tagMap
    }

    return {
        posts,
        loading,
        error,
        fetchPosts,
        getPost,
        getPostContent,
        getFeaturedPosts,
        getSortedPosts,
        getPostsByTag,
        getPostsByYear,
        getAllTags
    }
}
