export const useAdmin = () => {
    const token = useCookie('admin-token')
    const isAuthenticated = computed(() => !!token.value)

    const login = async (password: string) => {
        try {
            const data = await $fetch<{ success: boolean; data?: { token: string }; message?: string }>('/api/auth/login', {
                method: 'POST',
                body: { password }
            })
            if (data.success && data.data?.token) {
                token.value = data.data.token
                return { success: true, message: data.message || '登录成功' }
            }
            return { success: false, message: data.message || '密码错误' }
        } catch (e: any) {
            // $fetch 在 4xx/5xx 会抛异常，这里把后端 message 透传给 UI
            const msg = e?.data?.message || e?.message || '登录失败'
            return { success: false, message: msg }
        }
    }

    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'x-admin-token': token.value || '' }
            })
        } catch {}
        token.value = null
    }

    const verify = async () => {
        if (!token.value) return false
        try {
            const data = await $fetch<{ success: boolean }>('/api/auth/verify', {
                headers: { 'x-admin-token': token.value || '' }
            })
            return data.success
        } catch {
            return false
        }
    }

    const authFetch = async (url: string, opts: any = {}) => {
        try {
            return await $fetch(url, {
                ...opts,
                headers: {
                    ...opts.headers,
                    'x-admin-token': token.value || ''
                }
            })
        } catch (e: any) {
            // 统一处理 401：清 token 并跳转登录
            const status = e?.statusCode || e?.response?.status || e?.data?.statusCode
            if (status === 401) {
                token.value = null
                if (process.client) {
                    try {
                        const ui = useAdminUI()
                        ui.toast('登录已过期，请重新登录', 'warning')
                    } catch {}
                    navigateTo('/admin/login')
                }
            }
            throw e
        }
    }

    return {
        token,
        isAuthenticated,
        login,
        logout,
        verify,
        authFetch
    }
}
