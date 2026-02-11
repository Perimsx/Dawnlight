type MaybeEl = HTMLElement | null | undefined

// Toast 图标
const toastIcons = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
}

let toastTimer: any = null

// Toast 提示函数（与前台评论Toast保持一致）
const showCommentToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  if (typeof document === 'undefined') return
  let toast = document.getElementById('comment-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'comment-toast'
    toast.className = 'comment-toast'
    document.body.appendChild(toast)
  }

  toast.classList.remove('show')
  toast.className = `comment-toast comment-toast-${type}`
  const icon = toastIcons[type] || toastIcons.info
  toast.innerHTML = `<div class="comment-toast-icon">${icon}</div><div class="comment-toast-content">${message}</div>`
  requestAnimationFrame(() => toast.classList.add('show'))

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000)
}

// 与旧版保持一致的防盗链白名单
const HOTLINK_DOMAINS = [
  'cdn.nlark.com', // 语雀
  'cdn.yuque.com', // 语雀
  'mmbiz.qpic.cn', // 微信公众号
  'mmbiz.qlogo.cn', // 微信
  'pic1.zhimg.com', // 知乎
  'pic2.zhimg.com',
  'pic3.zhimg.com',
  'pic4.zhimg.com',
  'pica.zhimg.com',
  'picb.zhimg.com',
  'i.loli.net', // SM.MS
  's2.loli.net',
  'gitee.com', // Gitee
  'raw.githubusercontent.com', // GitHub
  'user-images.githubusercontent.com'
]

function needsImageProxy(url: string | null) {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return HOTLINK_DOMAINS.some(domain => urlObj.hostname.endsWith(domain))
  } catch {
    return false
  }
}

function getProxyImageUrl(originalUrl: string) {
  return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
}

function highlightCode(markdownBody: HTMLElement) {
  const hljs = (window as any).hljs
  if (!hljs || typeof hljs.highlightElement !== 'function') return

  markdownBody.querySelectorAll('pre code').forEach((block) => {
    try {
      hljs.highlightElement(block as any)
    } catch {
      // ignore
    }
  })
}

function enhanceCodeBlocks(markdownBody: HTMLElement) {
  const preBlocks = markdownBody.querySelectorAll('pre')
  const COPY_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
  const CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'

  preBlocks.forEach((pre) => {
    const preEl = pre as HTMLPreElement
    if (preEl.dataset.enhanced) return
    preEl.dataset.enhanced = 'true'

    const code = preEl.querySelector('code') as HTMLElement | null
    if (!code) return

    const codeText = code.textContent || (code as any).innerText || ''
    preEl.style.position = 'relative'

    // --- 提取语言（保持旧版一致，暂不显示，仅用于未来扩展）---
    const langMatch = (code.className || '').match(/(?:language|lang)-(\w+)/)
    const _langName = langMatch ? langMatch[1] : ''
    void _langName

    // --- 行号 ---
    const lines = code.innerHTML.split('\n')
    if (lines.length > 1 && lines[lines.length - 1].trim() === '') lines.pop()
    if (lines.length > 1) {
      code.innerHTML = lines.map((line, i) => `<span class="line" data-ln="${i + 1}">${line}</span>`).join('')
    }

    // --- 包裹 wrapper ---
    let wrapper = preEl.closest('.code-block-wrapper') as HTMLElement | null
    if (!wrapper) {
      wrapper = document.createElement('div')
      wrapper.className = 'code-block-wrapper'
      preEl.parentNode?.insertBefore(wrapper, preEl)
      wrapper.appendChild(preEl)
    }

    // --- 复制按钮 ---
    if (!wrapper.querySelector('.copy-code-btn')) {
      const copyBtn = document.createElement('button')
      copyBtn.type = 'button'
      copyBtn.className = 'copy-code-btn'
      copyBtn.innerHTML = `${COPY_SVG}<span>复制</span>`
      copyBtn.onclick = async function (e) {
        e.preventDefault()
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(codeText)
          showCommentToast('复制成功', 'success')
        } catch (_) {
          const ta = document.createElement('textarea')
          ta.value = codeText
          ta.style.cssText = 'position:fixed;opacity:0'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          showCommentToast('复制成功', 'success')
        }
      }
      wrapper.appendChild(copyBtn)
    }

    // --- 长代码折叠（>25行）---
    if (lines.length > 25) {
      wrapper.classList.add('code-collapsed')
      if (!wrapper.querySelector('.code-toggle-btn')) {
        const toggleBtn = document.createElement('button')
        toggleBtn.type = 'button'
        toggleBtn.className = 'code-toggle-btn'
        toggleBtn.textContent = `展开全部 (${lines.length} 行)`
        toggleBtn.onclick = function () {
          const collapsed = wrapper!.classList.toggle('code-collapsed')
          toggleBtn.textContent = collapsed ? `展开全部 (${lines.length} 行)` : '收起代码'
        }
        wrapper.appendChild(toggleBtn)
      }
    }
  })
}

function enhanceCallouts(markdownBody: HTMLElement) {
  const CALLOUT_MAP: Record<string, { icon: string, label: string, type: string }> = {
    NOTE: { icon: 'ℹ️', label: '注意', type: 'note' },
    TIP: { icon: '💡', label: '提示', type: 'tip' },
    WARNING: { icon: '⚠️', label: '警告', type: 'warning' },
    CAUTION: { icon: '🔥', label: '小心', type: 'caution' },
    IMPORTANT: { icon: '💜', label: '重要', type: 'important' },
    INFO: { icon: 'ℹ️', label: '信息', type: 'info' },
    DANGER: { icon: '🚫', label: '危险', type: 'danger' },
    SUCCESS: { icon: '✅', label: '成功', type: 'success' }
  }

  markdownBody.querySelectorAll('blockquote').forEach((bq) => {
    const bqEl = bq as HTMLElement
    if ((bqEl as any).dataset.callout) return
    const firstP = bqEl.querySelector('p')
    if (!firstP) return

    const text = (firstP.textContent || '').trim()
    const match = text.match(/^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|INFO|DANGER|SUCCESS)\]\s*(.*)?$/i)
    if (!match) return

    const key = match[1].toUpperCase()
    const customTitle = match[2] || ''
    const callout = CALLOUT_MAP[key]
    if (!callout) return

    bqEl.setAttribute('data-callout', callout.type)
    ;(bqEl as any).style.borderLeftColor = ''

    const titleEl = document.createElement('div')
    titleEl.className = 'callout-title'
    titleEl.innerHTML = `<span class="callout-icon">${callout.icon}</span> ${customTitle || callout.label}`

    const remaining = (firstP as HTMLElement).innerHTML
      .replace(/\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|INFO|DANGER|SUCCESS)\]\s*/i, '')
      .trim()

    if (remaining) {
      ;(firstP as HTMLElement).innerHTML = remaining
      bqEl.insertBefore(titleEl, firstP)
    } else {
      firstP.replaceWith(titleEl)
    }
  })
}

function enhanceTables(markdownBody: HTMLElement) {
  markdownBody.querySelectorAll('table').forEach((table) => {
    const t = table as HTMLTableElement
    if (t.parentElement && t.parentElement.classList.contains('table-wrapper')) return
    const wrapper = document.createElement('div')
    wrapper.className = 'table-wrapper'
    t.parentNode?.insertBefore(wrapper, t)
    wrapper.appendChild(t)
  })

  requestAnimationFrame(() => {
    markdownBody.querySelectorAll('.table-wrapper').forEach((wrapperEl) => {
      const wrapper = wrapperEl as HTMLElement
      const oldHint = wrapper.querySelector('.table-scroll-hint')
      if (oldHint) oldHint.remove()

      const table = wrapper.querySelector('table') as HTMLTableElement | null
      if (table && table.scrollWidth > wrapper.clientWidth + 2) {
        const hint = document.createElement('div')
        hint.className = 'table-scroll-hint'
        hint.textContent = '← 左右滑动查看完整表格 →'
        wrapper.appendChild(hint)
      }
    })
  })
}

function ensureImageViewerOverlay() {
  let overlay = document.querySelector('.image-viewer-overlay') as HTMLElement | null
  if (overlay) return overlay

  overlay = document.createElement('div')
  overlay.className = 'image-viewer-overlay'
  overlay.innerHTML = `
    <img src="" alt="查看大图">
    <button class="image-viewer-close" type="button">&times;</button>
  `
  document.body.appendChild(overlay)

  const closeViewer = () => overlay!.classList.remove('active')
  overlay.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null
    if (target === overlay || target?.classList.contains('image-viewer-close')) closeViewer()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay!.classList.contains('active')) closeViewer()
  })

  return overlay
}

function enhanceImages(markdownBody: HTMLElement) {
  const overlay = ensureImageViewerOverlay()
  const viewerImg = overlay.querySelector('img') as HTMLImageElement | null
  if (!viewerImg) return

  markdownBody.querySelectorAll('img').forEach((imgEl) => {
    const img = imgEl as HTMLImageElement
    if (img.dataset.lightbox) return
    img.dataset.lightbox = 'true'
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => {
      viewerImg.src = img.src
      viewerImg.alt = img.alt || ''
      overlay.classList.add('active')
    })
  })
}

function renderMath(markdownBody: HTMLElement) {
  const renderFn = (window as any).renderMathInElement
  if (!renderFn) return
  try {
    renderFn(markdownBody, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    })
  } catch {
    // ignore
  }
}

function enhanceHeadings(markdownBody: HTMLElement) {
  markdownBody.querySelectorAll('h2, h3, h4, h5, h6').forEach((headingEl) => {
    const heading = headingEl as HTMLElement
    if (!heading.id) return
    if (heading.querySelector('.heading-anchor')) return

    const anchor = document.createElement('a')
    anchor.className = 'heading-anchor'
    anchor.href = `#${heading.id}`
    anchor.textContent = '#'
    anchor.setAttribute('aria-label', '复制链接')

    anchor.addEventListener('click', (e) => {
      e.preventDefault()
      const url = window.location.origin + window.location.pathname + `#${heading.id}`
      navigator.clipboard.writeText(url).then(() => {
        anchor.textContent = '✓'
        anchor.classList.add('copied')
        setTimeout(() => {
          anchor.textContent = '#'
          anchor.classList.remove('copied')
        }, 1500)
      }).catch(() => {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    heading.appendChild(anchor)
  })
}

function processHotlinkImages(markdownBody: HTMLElement) {
  const images = markdownBody.querySelectorAll('img')
  images.forEach((imgEl) => {
    const img = imgEl as HTMLImageElement
    const originalSrc = img.getAttribute('src')

    if (!originalSrc) return
    if (img.dataset.originalSrc) return // 避免重复处理

    if (needsImageProxy(originalSrc)) {
      img.classList.add('loading')
      const proxyUrl = getProxyImageUrl(originalSrc)
      img.dataset.originalSrc = originalSrc

      const newImg = new Image()
      newImg.onload = () => {
        img.src = proxyUrl
        img.classList.remove('loading')
        img.classList.remove('error')
      }
      newImg.onerror = () => {
        img.classList.remove('loading')
        img.classList.add('error')
        img.alt = `图片加载失败: ${img.alt || '未知图片'}`
        img.title = `原始地址: ${originalSrc}`
        console.warn('防盗链图片加载失败:', originalSrc)
      }
      newImg.src = proxyUrl
    }
  })
}

export const useContentEnhance = () => {
  const enhanceMarkdownBody = (markdownBody: MaybeEl) => {
    if (!import.meta.client) return
    if (!markdownBody) return

    highlightCode(markdownBody)
    enhanceCodeBlocks(markdownBody)
    enhanceCallouts(markdownBody)
    enhanceTables(markdownBody)
    enhanceImages(markdownBody)
    renderMath(markdownBody)
    enhanceHeadings(markdownBody)
    processHotlinkImages(markdownBody)
  }

  return { enhanceMarkdownBody }
}

