// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [],

  // 开发服务器绑定到 IPv4，避免仅监听 ::1 导致打不开
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  // Nuxt 4 源目录
  srcDir: 'app/',

  css: [
    '~/assets/css/style.css',
    '~/assets/css/post-style.css'
  ],

  app: {
    head: {
      title: 'Dawnlight | Perimsx',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0f1419', media: '(prefers-color-scheme: dark)' },
        { name: 'format-detection', content: 'telephone=no, email=no, address=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdn-font.hyperos.mi.com/font/css?family=MiSans:100,200,300,400,450,500,600,650,700,900:Chinese_Simplify,Latin&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css' }
      ],
      script: [
        // 清除旧 Service Worker（防止拦截请求导致 MIME type 错误）
        {
          innerHTML: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(reg){reg.unregister()})})}`
        },
        // 防止主题闪烁
        {
          innerHTML: `(function(){var m=localStorage.getItem('themeMode')||'system';var t=m==='system'?(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):m;document.documentElement.setAttribute('data-theme',t)})();`
        },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js' },
        { src: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js', defer: true },
        { src: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js', defer: true }
      ]
    }
  },

  // SSR 配置
  ssr: true,

  // 路由配置
  routeRules: {
    '/admin/**': { ssr: false } // 管理后台不需要 SSR
  }
})
