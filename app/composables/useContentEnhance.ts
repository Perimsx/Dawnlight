type MaybeEl = HTMLElement | null | undefined


const { toast } = useToast()


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
    if (lines.length > 1 && lines[lines.length - 1]!.trim() === '') lines.pop()
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
      let copiedTimer: ReturnType<typeof setTimeout> | null = null

      const setCopiedState = () => {
        if (copiedTimer) clearTimeout(copiedTimer)
        copyBtn.classList.add('copied')
        copyBtn.innerHTML = `${CHECK_SVG}<span>已复制</span>`
        copiedTimer = setTimeout(() => {
          copyBtn.classList.remove('copied')
          copyBtn.innerHTML = `${COPY_SVG}<span>复制</span>`
        }, 1500)
      }

      copyBtn.onclick = async function (e) {
        e.preventDefault()
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(codeText)
          toast('复制成功', 'success')
          setCopiedState()
        } catch (_) {
          const ta = document.createElement('textarea')
          ta.value = codeText
          ta.style.cssText = 'position:fixed;opacity:0'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          toast('复制成功', 'success')
          setCopiedState()
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
        const EXPAND_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
        const COLLAPSE_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'

        toggleBtn.innerHTML = `${EXPAND_ICON} 展开全部 (${lines.length} 行)`
        toggleBtn.onclick = function () {
          const collapsed = wrapper!.classList.toggle('code-collapsed')
          toggleBtn.innerHTML = collapsed ? `${EXPAND_ICON} 展开全部 (${lines.length} 行)` : `${COLLAPSE_ICON} 收起代码`
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

    const key = match[1]!.toUpperCase()
    const customTitle = match[2] || ''
    const callout = CALLOUT_MAP[key]
    if (!callout) return

    bqEl.setAttribute('data-callout', callout.type)
      ; (bqEl as any).style.borderLeftColor = ''

    const titleEl = document.createElement('div')
    titleEl.className = 'callout-title'
    titleEl.innerHTML = `<span class="callout-icon">${callout.icon}</span> ${customTitle || callout.label}`

    const remaining = (firstP as HTMLElement).innerHTML
      .replace(/\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|INFO|DANGER|SUCCESS)\]\s*/i, '')
      .trim()

    if (remaining) {
      ; (firstP as HTMLElement).innerHTML = remaining
      bqEl.insertBefore(titleEl, firstP)
    } else {
      firstP.replaceWith(titleEl)
    }
  })
}

function enhanceTables(markdownBody: HTMLElement) {
  const isTouchOnlyDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches

  const bindDesktopWheelHorizontal = (scrollEl: HTMLElement) => {
    if (scrollEl.dataset.tableWheelBound === '1') return
    scrollEl.dataset.tableWheelBound = '1'

    scrollEl.addEventListener('wheel', (event) => {
      // 纯触屏设备保持原生行为；桌面与触屏笔记本都启用滚轮横移
      if (isTouchOnlyDevice()) return

      const maxScrollX = scrollEl.scrollWidth - scrollEl.clientWidth
      if (maxScrollX <= 0) return

      const modeRatio = event.deltaMode === 1 ? 16 : (event.deltaMode === 2 ? scrollEl.clientWidth : 1)
      const deltaX = event.deltaX * modeRatio
      const deltaY = event.deltaY * modeRatio
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      let delta = 0

      // 触控板横向滚动
      if (absX > 0) delta += deltaX
      // 鼠标滚轮纵向 -> 横向（桌面端查看超宽表格）
      if (event.shiftKey || absY >= absX) delta += deltaY
      if (!delta) return

      const prev = scrollEl.scrollLeft
      const next = Math.max(0, Math.min(maxScrollX, prev + delta))

      if (next !== prev) {
        scrollEl.scrollLeft = next
        event.preventDefault()
      }
    }, { passive: false, capture: true })
  }

  markdownBody.querySelectorAll('table').forEach((table) => {
    const t = table as HTMLTableElement
    if (t.parentElement && t.parentElement.classList.contains('table-scroll-container')) return

    // 结构: .table-wrapper -> .table-scroll-container -> table
    const wrapper = document.createElement('div')
    wrapper.className = 'table-wrapper'

    const scrollContainer = document.createElement('div')
    scrollContainer.className = 'table-scroll-container'

    t.parentNode?.insertBefore(wrapper, t)
    scrollContainer.appendChild(t)
    wrapper.appendChild(scrollContainer)
  })

  requestAnimationFrame(() => {
    markdownBody.querySelectorAll('.table-wrapper').forEach((wrapperEl) => {
      const wrapper = wrapperEl as HTMLElement
      const scrollContainer = wrapper.querySelector('.table-scroll-container') as HTMLElement
      const table = scrollContainer.querySelector('table') as HTMLTableElement
      if (!scrollContainer || !table) return

      // 始终绑定，避免首次测量时机导致桌面滚轮横移失效
      bindDesktopWheelHorizontal(scrollContainer)

      // 移除旧提示
      const oldHint = wrapper.querySelector('.table-scroll-hint')
      if (oldHint) oldHint.remove()

      // 判断是否需要滚动
      if (table.scrollWidth > scrollContainer.clientWidth + 1) {
        const hint = document.createElement('div')
        hint.className = 'table-scroll-hint'
        hint.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11l-5-5-5 5M17 13l-5 5-5-5" transform="rotate(-90 12 12)"/></svg>
          桌面端滚轮横向查看，移动端左右滑动查看
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11l-5-5-5 5M17 13l-5 5-5-5" transform="rotate(90 12 12)"/></svg>
        `
        // 追加到 wrapper 底部，即 scrollContainer 后面
        wrapper.appendChild(hint)
        requestAnimationFrame(() => wrapper.classList.add('show-hint'))
      } else {
        wrapper.classList.remove('show-hint')
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

