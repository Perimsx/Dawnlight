<template>
  <div>
    <!-- 顶栏 -->
    <div class="editor-header">
      <div class="editor-header-left">
        <NuxtLink to="/admin/posts" class="editor-back-btn" title="返回">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
        </NuxtLink>
        <input type="text" v-model="postData.title" class="editor-title-input" placeholder="输入文章标题..." ref="titleInputEl">
      </div>
      <div class="editor-header-actions">
        <span class="auto-save-text" v-if="autoSaveStatus">{{ autoSaveStatus }}</span>
        <div v-if="showSavedIndicator" class="status-indicator">
          <span class="status-dot"></span>
          <span>已保存</span>
        </div>
        <button class="a-btn a-btn-sm" @click="togglePreview">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          预览
        </button>
        <button class="a-btn a-btn-sm a-btn-primary" @click="savePost" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="editor-page">
      <!-- 编辑区 -->
      <div class="editor-main">
        <div class="editor-card">
          <!-- 工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-group">
              <button class="toolbar-btn" @click="insertMarkdown('bold')" title="粗体 Ctrl+B"><b>B</b></button>
              <button class="toolbar-btn" @click="insertMarkdown('italic')" title="斜体 Ctrl+I"><i>I</i></button>
              <button class="toolbar-btn" @click="insertMarkdown('strike')" title="删除线"><s>S</s></button>
            </div>
            <div class="toolbar-group">
              <button class="toolbar-btn" @click="insertMarkdown('h1')" title="一级标题">H1</button>
              <button class="toolbar-btn" @click="insertMarkdown('h2')" title="二级标题">H2</button>
              <button class="toolbar-btn" @click="insertMarkdown('h3')" title="三级标题">H3</button>
            </div>
            <div class="toolbar-group">
              <button class="toolbar-btn" @click="insertMarkdown('ul')" title="无序列表">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('quote')" title="引用">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.5 5 6"/></svg>
              </button>
            </div>
            <div class="toolbar-group">
              <button class="toolbar-btn" @click="insertMarkdown('code')" title="行内代码">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('codeblock')" title="代码块">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="16 15 20 12 16 9"/><polyline points="8 9 4 12 8 15"/></svg>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('link')" title="链接">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('image')" title="图片">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('table')" title="表格">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
              <button class="toolbar-btn" @click="insertMarkdown('hr')" title="分割线">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/></svg>
              </button>
            </div>
            <div class="toolbar-group" style="border-right:none;margin-left:auto;">
              <button class="toolbar-btn" :class="{ active: splitPreview }" @click="splitPreview = !splitPreview" title="分屏预览 Ctrl+Enter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
              </button>
            </div>
          </div>
          <!-- 编辑区域 -->
          <div class="editor-content">
            <div class="editor-write">
              <textarea
                ref="editorTextarea"
                v-model="postData.content"
                class="markdown-input"
                spellcheck="false"
                placeholder="使用 Markdown 撰写文章内容..."
                @click="updateCursorPosition"
                @keyup="updateCursorPosition"
              ></textarea>
            </div>
            <div class="editor-preview" :class="{ visible: splitPreview || fullPreview }">
              <div ref="previewBody" class="markdown-body" v-html="previewHtml"></div>
            </div>
          </div>
          <!-- 底栏 -->
          <div class="editor-footer">
            <div class="editor-stats">
              <span class="stat-chip">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {{ wordCount }} 字
              </span>
              <span class="stat-divider"></span>
              <span class="stat-chip">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                {{ lineCount }} 行
              </span>
              <span class="stat-divider"></span>
              <span class="stat-chip">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                行 {{ cursorPosition }}
              </span>
              <span v-if="readTime" class="stat-divider"></span>
              <span v-if="readTime" class="stat-chip">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                约 {{ readTime }} 分钟
              </span>
            </div>
            <div class="editor-shortcuts">
              <div class="shortcut-item"><span class="shortcut-key">Ctrl+S</span><span>保存</span></div>
              <div class="shortcut-item"><span class="shortcut-key">Ctrl+Enter</span><span>预览</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="editor-sidebar">
        <!-- 发布设置 -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <div class="sidebar-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              发布设置
            </div>
          </div>
          <div class="sidebar-card-body">
            <div class="form-field">
              <label class="form-label">发布时间</label>
              <input type="date" v-model="postData.date" class="form-input">
            </div>
            <div class="switch-row">
              <span class="switch-label">精选文章</span>
              <label class="a-toggle" title="精选文章">
                <input type="checkbox" v-model="postData.featured">
                <span class="a-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 摘要 -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <div class="sidebar-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
              摘要
            </div>
          </div>
          <div class="sidebar-card-body">
            <textarea v-model="postData.description" class="form-input form-textarea" placeholder="文章简介..."></textarea>
          </div>
        </div>

        <!-- 分类 -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <div class="sidebar-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              分类
            </div>
          </div>
          <div class="sidebar-card-body">
            <input type="text" v-model="postData.category" class="form-input" placeholder="文章分类">
          </div>
        </div>

        <!-- 封面 -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <div class="sidebar-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              封面
            </div>
          </div>
          <div class="sidebar-card-body">
            <div class="form-field">
              <input type="text" v-model="postData.cover" class="form-input" placeholder="图片链接...">
            </div>
            <div v-if="postData.cover" class="cover-preview" @click="coverPreviewOpen = true">
              <img :src="postData.cover" alt="封面" @error="onCoverError">
            </div>
            <div v-else class="cover-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>粘贴链接预览</span>
            </div>
          </div>
        </div>

        <!-- 标签 -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <div class="sidebar-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              标签
            </div>
          </div>
          <div class="sidebar-card-body">
            <div class="tags-container" @click="tagInputEl?.focus()">
              <TransitionGroup name="tag-pop" tag="div" class="tags-list">
                <span v-for="(tag, i) in postData.tags" :key="tag" class="tag-chip">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click.stop="removeTag(i)">✕</button>
                </span>
              </TransitionGroup>
              <input
                ref="tagInputEl"
                type="text"
                class="tag-input"
                placeholder="输入标签，按回车添加"
                v-model="newTag"
                @keydown.enter.prevent="addTag"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 封面大图预览 -->
    <Teleport to="body">
      <div v-if="coverPreviewOpen" class="cover-modal" @click.self="coverPreviewOpen = false">
        <button class="cover-modal-close" aria-label="关闭" @click="coverPreviewOpen = false">×</button>
        <img class="cover-modal-img" :src="postData.cover" alt="封面大图">
      </div>
    </Teleport>

    <!-- 草稿恢复提示 -->
    <Teleport to="body">
      <div v-if="showDraftPrompt" class="draft-prompt-overlay" @click.self="dismissDraft">
        <div class="draft-prompt">
          <div class="draft-prompt-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="draft-prompt-text">发现未保存的草稿，是否恢复？</div>
          <div class="draft-prompt-actions">
            <button class="a-btn a-btn-sm" @click="dismissDraft">丢弃</button>
            <button class="a-btn a-btn-sm a-btn-primary" @click="restoreDraft">恢复草稿</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const route = useRoute()
const { authFetch } = useAdmin()
const ui = useAdminUI()
const { parse } = useMarkdown()
const { enhanceMarkdownBody } = useContentEnhance()

const isNew = computed(() => route.query.new === '1')
const postId = computed(() => route.query.id)

const postData = reactive({
  title: '',
  content: '',
  description: '',
  category: '',
  cover: '',
  tags: [],
  date: new Date().toISOString().split('T')[0],
  featured: false
})

const newTag = ref('')
const saving = ref(false)
const autoSaveStatus = ref('')
const showSavedIndicator = ref(false)
const splitPreview = ref(false)
const fullPreview = ref(false)
const coverPreviewOpen = ref(false)
const cursorPosition = ref('1:1')
const showDraftPrompt = ref(false)
let pendingDraft = null

const editorTextarea = ref(null)
const previewBody = ref(null)
const titleInputEl = ref(null)
const tagInputEl = ref(null)

const previewHtml = computed(() => parse(postData.content))

/**
 * 计算文章有效字数
 *
 * 统计规则：
 * - 排除 YAML frontmatter 元数据
 * - 排除代码块和行内代码（不计入字数）
 * - 保留链接文本但移除链接标记
 * - 排除图片标记（包括 alt 文本）
 * - 移除所有 Markdown 格式符号
 * - 移除 HTML 标签
 * - 统计剩余非空白字符数
 */
const wordCount = computed(() => {
  const content = postData.content
  if (!content || typeof content !== 'string') return 0

  // 使用更高效的正则组合，减少字符串遍历次数
  const cleanContent = content
    // 移除 YAML frontmatter（必须在前）
    .replace(/^---[\s\S]*?---\n*/, '')
    // 移除代码块和行内代码（使用非贪婪匹配）
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
    // 移除图片标记
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // 保留链接文本，移除链接 URL
    .replace(/\[([^\]]+)\]\((?:[^()]|\([^)]*\))*\)/g, '$1')
    // 移除 Markdown 格式符号
    .replace(/^#{1,6}\s+/gm, '')           // 标题
    .replace(/^\s*[-*+]\s+/gm, '')         // 无序列表
    .replace(/^\s*\d+\.\s+/gm, '')         // 有序列表
    .replace(/^>\s+/gm, '')                // 引用
    .replace(/\*\*([^*]+?)\*\*/g, '$1')    // 粗体（非贪婪）
    .replace(/\*([^*]+?)\*/g, '$1')        // 斜体（非贪婪）
    .replace(/~~([^~]+?)~~/g, '$1')        // 删除线（非贪婪）
    // 移除 HTML 标签
    .replace(/<[^>]*>/g, '')
    // 移除多余空白但保留单个空格用于分词
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanContent) return 0

  // 统计字数：中文字符 + 英文单词 + 标点符号
  let count = 0

  // 中日韩统一表意文字和假名
  const cjkChars = cleanContent.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g)
  count += (cjkChars || []).length

  // 英文单词和数字（连续的字母/数字/下划线）
  const words = cleanContent.match(/[a-zA-Z0-9_\u00C0-\u00FF]+/g)
  count += (words || []).length

  // 标点和其他符号（排除已统计的字符）
  const remaining = cleanContent
    .replace(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, '')
    .replace(/[a-zA-Z0-9_\u00C0-\u00FF]+/g, '')
    .replace(/\s/g, '')
  count += remaining.length

  return count
})

/**
 * 计算非空行数
 */
const lineCount = computed(() => {
  const content = postData.content
  if (!content || content.trim() === '') return 0

  // 统一换行符，处理 Windows 的 \r\n
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 计算非空行数
  const lines = normalizedContent.split('\n')
  return lines.filter(line => line.trim() !== '').length
})

const readTime = computed(() => {
  const count = wordCount.value
  if (count < 100) return 0
  return Math.max(1, Math.ceil(count / 400))
})

// ====== 标签管理 ======
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !postData.tags.includes(tag)) {
    postData.tags.push(tag)
  }
  newTag.value = ''
}

const removeTag = (i) => {
  postData.tags.splice(i, 1)
}

// ====== Markdown 工具栏 ======
const markdownTemplates = {
  bold: ['**', '**', '粗体'],
  italic: ['*', '*', '斜体'],
  strike: ['~~', '~~', '删除线'],
  h1: ['# ', '', '标题'],
  h2: ['## ', '', '标题'],
  h3: ['### ', '', '标题'],
  ul: ['- ', '', '列表项'],
  ol: ['1. ', '', '列表项'],
  quote: ['> ', '', '引用'],
  code: ['`', '`', '代码'],
  codeblock: ['```\n', '\n```', '代码'],
  link: ['[', '](url)', '链接'],
  image: ['![', '](url)', '图片'],
  table: ['| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |', '', ''],
  hr: ['\n---\n', '', '']
}

const insertMarkdown = (action) => {
  const el = editorTextarea.value
  if (!el) return
  const tpl = markdownTemplates[action]
  if (!tpl) return

  const s = el.selectionStart
  const e = el.selectionEnd
  const text = el.value
  const sel = text.substring(s, e)
  const inserted = tpl[0] + (sel || tpl[2]) + tpl[1]
  const cursorPos = sel ? s + inserted.length : s + tpl[0].length + tpl[2].length

  postData.content = text.substring(0, s) + inserted + text.substring(e)

  nextTick(() => {
    el.focus()
    el.setSelectionRange(cursorPos, cursorPos)
    updateCursorPosition()
  })
}

// ====== 预览 ======
const togglePreview = () => {
  if (splitPreview.value) {
    splitPreview.value = false
    fullPreview.value = !fullPreview.value
  } else {
    fullPreview.value = !fullPreview.value
  }
}

// 预览增强
let previewEnhanceTimer = null
const schedulePreviewEnhance = () => {
  if (!splitPreview.value && !fullPreview.value) return
  if (previewEnhanceTimer) clearTimeout(previewEnhanceTimer)
  previewEnhanceTimer = setTimeout(async () => {
    await nextTick()
    enhanceMarkdownBody(previewBody.value)
  }, 80)
}

watch([() => splitPreview.value, () => fullPreview.value], () => schedulePreviewEnhance())
watch(() => previewHtml.value, () => schedulePreviewEnhance())

// ====== 光标位置 ======
const updateCursorPosition = () => {
  const el = editorTextarea.value
  if (!el) return
  const lines = el.value.substring(0, el.selectionStart).split('\n')
  cursorPosition.value = `${lines.length}:${lines[lines.length - 1].length + 1}`
}

// ====== 封面预览 ======
const onCoverError = (e) => {
  if (e?.target) e.target.style.display = 'none'
}

// ====== 保存 ======
const savePost = async () => {
  if (!postData.title.trim()) {
    ui.toast('请输入标题', 'warning')
    titleInputEl.value?.focus()
    return
  }
  saving.value = true
  try {
    const payload = {
      title: postData.title,
      content: postData.content,
      description: postData.description,
      category: postData.category,
      cover: postData.cover,
      tags: postData.tags,
      date: postData.date,
      featured: postData.featured
    }

    if (isNew.value) {
      const res = await authFetch('/api/posts', { method: 'POST', body: payload })
      if (res?.success && res.data?.id) {
        clearDraft()
        ui.toast('创建成功', 'success')
        showSavedIndicator.value = true
        setTimeout(() => { showSavedIndicator.value = false }, 2000)
        navigateTo(`/admin/posts/edit?id=${encodeURIComponent(res.data.id)}`)
      } else {
        ui.toast(res?.message || '保存失败', 'error')
      }
    } else if (postId.value) {
      const res = await authFetch(`/api/posts/${postId.value}`, { method: 'PUT', body: payload })
      if (res?.success) {
        clearDraft()
        ui.toast('保存成功', 'success')
        showSavedIndicator.value = true
        setTimeout(() => { showSavedIndicator.value = false }, 2000)
      } else {
        ui.toast(res?.message || '保存失败', 'error')
      }
    }
  } catch {
    ui.toast('保存失败', 'error')
  }
  saving.value = false
}

// ====== 草稿自动保存 ======
const DRAFT_KEY = computed(() => `post_draft_${postId.value || 'new'}`)
let lastSavedHash = ''
let autoSaveTimer = null
let hasUnsavedChanges = false

const getContentHash = () => `${postData.title}|${postData.content}|${postData.description}`

const saveDraft = () => {
  const hash = getContentHash()
  if (hash === lastSavedHash) return
  try {
    localStorage.setItem(DRAFT_KEY.value, JSON.stringify({
      ...postData,
      savedAt: Date.now()
    }))
    lastSavedHash = hash
    hasUnsavedChanges = false
    autoSaveStatus.value = '草稿已保存'
    setTimeout(() => { autoSaveStatus.value = '' }, 2000)
  } catch {}
}

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY.value)
    if (!raw) return null
    const draft = JSON.parse(raw)
    if (Date.now() - draft.savedAt > 86400000) return null // 超过24小时丢弃
    return draft
  } catch { return null }
}

const clearDraft = () => {
  try { localStorage.removeItem(DRAFT_KEY.value) } catch {}
  lastSavedHash = ''
  hasUnsavedChanges = false
}

const restoreDraft = () => {
  if (!pendingDraft) return
  Object.assign(postData, {
    title: pendingDraft.title || '',
    content: pendingDraft.content || '',
    description: pendingDraft.description || '',
    category: pendingDraft.category || '',
    cover: pendingDraft.cover || '',
    tags: pendingDraft.tags || [],
    date: pendingDraft.date || postData.date,
    featured: pendingDraft.featured || false
  })
  showDraftPrompt.value = false
  pendingDraft = null
  ui.toast('草稿已恢复', 'success')
}

const dismissDraft = () => {
  showDraftPrompt.value = false
  pendingDraft = null
  clearDraft()
}

// 监听内容变化标记未保存
watch([() => postData.title, () => postData.content, () => postData.description], () => {
  hasUnsavedChanges = true
})

// ====== 键盘快捷键 ======
const handleKeydown = (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 's') {
      e.preventDefault()
      savePost()
    } else if (e.key === 'b') {
      e.preventDefault()
      insertMarkdown('bold')
    } else if (e.key === 'i') {
      e.preventDefault()
      insertMarkdown('italic')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      splitPreview.value = !splitPreview.value
    }
  }
}

// 离开检测
const beforeUnloadHandler = (e) => {
  if (hasUnsavedChanges) {
    const msg = '您有未保存的更改，确定要离开吗？'
    e.returnValue = msg
    return msg
  }
}

// ====== 生命周期 ======
onMounted(async () => {
  // 加载已有文章
  if (postId.value && !isNew.value) {
    try {
      const data = await authFetch(`/api/posts/${postId.value}`)
      if (data.success) {
        Object.assign(postData, data.data)
      }
      const contentData = await authFetch(`/api/posts/${postId.value}/content`)
      if (contentData.success) {
        postData.content = contentData.data.content || ''
      }
    } catch {}
  }

  // 检查草稿
  const draft = loadDraft()
  if (draft && (draft.title || draft.content)) {
    const currentContent = postData.content
    if (isNew.value || (draft.content && draft.content !== currentContent)) {
      pendingDraft = draft
      showDraftPrompt.value = true
    }
  }

  // 初始化哈希
  lastSavedHash = getContentHash()

  // 启动自动保存
  autoSaveTimer = setInterval(saveDraft, 30000)

  // 键盘快捷键
  document.addEventListener('keydown', handleKeydown)

  // 离开检测
  window.addEventListener('beforeunload', beforeUnloadHandler)

  // 聚焦标题
  setTimeout(() => titleInputEl.value?.focus(), 100)
})

onUnmounted(() => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  if (previewEnhanceTimer) clearTimeout(previewEnhanceTimer)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>

<style scoped>
/* 顶栏 */
.editor-header { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:var(--a-bg-2); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--a-border); border-radius:10px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,.06); }
.editor-header-left { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
.editor-back-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:rgba(var(--a-primary-rgb),0.06); border:1px solid var(--a-border); border-radius:6px; color:var(--a-text-2); cursor:pointer; transition:all .2s; flex-shrink:0; }
.editor-back-btn:hover { background:rgba(var(--a-primary-rgb),0.12); color:var(--a-primary); }
.editor-title-input { flex:1; font-size:16px; font-weight:600; border:none; background:transparent; color:var(--a-text); outline:none; min-width:0; }
.editor-header-actions { display:flex; gap:8px; align-items:center; flex-shrink:0; }
.auto-save-text { font-size:12px; color:var(--a-text-3); opacity:.6; }
.status-indicator { display:flex; align-items:center; gap:4px; padding:4px 10px; background:rgba(34,197,94,.1); border-radius:12px; font-size:11px; color:#16a34a; }
.status-dot { width:5px; height:5px; background:#22c55e; border-radius:50%; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }

/* 主布局 */
.editor-page {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  /* 使用 max() 防止负值高度，确保最小高度 */
  height: max(calc(100vh - 140px), 400px);
  min-height: 0;
  overflow: hidden;
}

.editor-main {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  /* 优化滚动条处理，使用 scrollbar-gutter 预留空间 */
  scrollbar-gutter: stable;
  overflow-y: auto;
  overflow-x: hidden;
  /* 性能优化：创建独立渲染层 */
  contain: paint style;
}

/* 编辑器卡片 */
.editor-card { flex:1; display:flex; flex-direction:column; background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:10px; overflow:hidden; min-height:0; box-shadow:0 1px 3px rgba(0,0,0,.06); }

/* 工具栏 */
.editor-toolbar { display:flex; align-items:center; gap:1px; padding:6px 8px; background:var(--a-bg-2); border-bottom:1px solid var(--a-border); flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; }
.editor-toolbar::-webkit-scrollbar { display:none; }
.toolbar-group { display:flex; gap:1px; padding:0 4px; border-right:1px solid var(--a-border); flex-shrink:0; }
.toolbar-group:last-child { border-right:none; }
.toolbar-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:none; border-radius:4px; background:transparent; color:var(--a-text-2); cursor:pointer; transition:all .15s; font-size:12px; }
.toolbar-btn:hover { background:rgba(var(--a-primary-rgb),.1); color:var(--a-primary); }
.toolbar-btn.active { background:var(--a-primary); color:#fff; }
.toolbar-btn svg { width:14px; height:14px; }

/* 编辑区域 */
.editor-content { flex:1; display:flex; min-height:0; overflow:hidden; }
.editor-write { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
.markdown-input { flex:1; border:none; resize:none; padding:14px; font-family:'SF Mono','JetBrains Mono','Consolas',monospace; font-size:13px; line-height:1.7; color:var(--a-text); background:var(--a-bg); outline:none; overflow-y:auto; }
.editor-preview { flex:1; padding:14px; overflow-y:auto; background:var(--a-bg); border-left:1px solid var(--a-border); display:none; min-width:0; }
.editor-preview.visible { display:block; }

/* 底栏 */
.editor-footer { display:flex; align-items:center; justify-content:space-between; padding:6px 14px; background:var(--a-bg-2); border-top:1px solid var(--a-border); font-size:11px; color:var(--a-text-3); }
.editor-stats { display:flex; align-items:center; gap:0; }
.stat-chip { display:inline-flex; align-items:center; gap:4px; padding:2px 0; white-space:nowrap; }
.stat-chip svg { opacity:.5; flex-shrink:0; }
.stat-divider { width:1px; height:10px; background:var(--a-border); margin:0 10px; flex-shrink:0; }
.editor-shortcuts { display:flex; gap:10px; }
.shortcut-item { display:flex; align-items:center; gap:4px; }
.shortcut-key { padding:2px 6px; background:var(--a-bg); border:1px solid var(--a-border); border-radius:4px; font-family:'SF Mono',monospace; font-size:10px; color:var(--a-text-2); box-shadow:0 1px 2px rgba(0,0,0,.05); }

/* 侧边栏 */
.sidebar-card {
  background: var(--a-bg-2);
  border: 1px solid var(--a-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  flex-shrink: 0; /* 防止被压缩 */
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--a-primary-rgb),0.02);
  border-bottom: 1px solid var(--a-border);
  flex-shrink: 0; /* 防止头部被压缩 */
}

.sidebar-card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--a-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-card-title svg { width:14px; height:14px; color:var(--a-primary); }

.sidebar-card-body {
  padding: 10px;
  overflow: hidden; /* 防止内容溢出 */
}

.form-field { margin-bottom:8px; }
.form-field:last-child { margin-bottom:0; }

.form-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--a-text-2);
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--a-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--a-text);
  background: var(--a-bg);
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box; /* 确保padding不会导致溢出 */
}

.form-input:focus {
  border-color: var(--a-primary);
  box-shadow: 0 0 0 3px rgba(var(--a-primary-rgb),.1);
}

.form-textarea {
  min-height: 50px;
  max-height: 120px; /* 限制最大高度，防止无限扩展 */
  resize: vertical; /* 允许垂直调整大小 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
  font-family: inherit;
  box-sizing: border-box;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--a-bg);
  border-radius: 6px;
}

.switch-label { font-size:12px; color:var(--a-text); }

/* 标签 */
.tags-container { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:10px 12px; min-height:44px; background:var(--a-bg); border:1px solid var(--a-border); border-radius:6px; cursor:text; transition:border-color .2s, box-shadow .2s; }
.tags-container:focus-within { border-color:var(--a-primary); box-shadow:0 0 0 3px rgba(var(--a-primary-rgb),.1); }
.tags-list { display:contents; }
.tag-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:rgba(var(--a-primary-rgb),.1); color:var(--a-primary); border-radius:16px; font-size:13px; font-weight:500; white-space:nowrap; transition:all .2s; }
.tag-chip:hover { background:rgba(var(--a-primary-rgb),.16); transform:translateY(-1px); }
.tag-remove { width:18px; height:18px; min-width:18px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; cursor:pointer; font-size:14px; font-weight:bold; background:rgba(var(--a-primary-rgb),.15); color:inherit; border:none; padding:0; line-height:1; transition:all .2s; }
.tag-remove:hover { background:rgba(var(--a-primary-rgb),.25); transform:scale(1.1); }
.tag-input { flex:1; min-width:100px; border:none; outline:none; background:transparent; font-size:14px; padding:4px 0; color:var(--a-text); }
.tag-input::placeholder { color:var(--a-text-3); font-size:13px; }
.tag-pop-enter-active,.tag-pop-leave-active { transition:all .18s ease; }
.tag-pop-enter-from { opacity:0; transform:translateY(6px) scale(.98); }
.tag-pop-leave-to { opacity:0; transform:translateY(-6px) scale(.98); }

/* 封面预览 */
.cover-preview { width:100%; aspect-ratio:16/9; background:rgba(var(--a-primary-rgb),.04); border-radius:6px; overflow:hidden; cursor:pointer; margin-top:6px; }
.cover-preview img { width:100%; height:100%; object-fit:cover; }
.cover-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; height:60px; color:var(--a-text-3); font-size:11px; }
.cover-placeholder svg { width:20px; height:20px; margin-bottom:4px; opacity:.4; }

/* 封面模态框 */
.cover-modal { position:fixed; inset:0; background:rgba(0,0,0,.9); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px; }
.cover-modal-close { position:absolute; top:16px; right:16px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.1); border:none; border-radius:50%; color:#fff; font-size:18px; cursor:pointer; }
.cover-modal-img { max-width:90%; max-height:90%; border-radius:6px; }

/* 草稿提示 */
.draft-prompt-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
.draft-prompt { background:var(--a-bg); border-radius:16px; padding:24px; max-width:360px; width:90%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.2); }
.draft-prompt-icon { color:var(--a-primary); margin-bottom:12px; }
.draft-prompt-text { font-size:15px; font-weight:500; color:var(--a-text); margin-bottom:16px; }
.draft-prompt-actions { display:flex; gap:8px; justify-content:center; }

/* 响应式 */
@media (max-width:900px) {
  .editor-page {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
  .editor-sidebar {
    order: 2;
    height: auto;
    overflow-y: visible;
  }
  .editor-main {
    order: 1;
    overflow: visible;
  }
  .editor-card { min-height:400px; }
  .editor-shortcuts { display:none; }
}
@media (max-width:768px) {
  .editor-header { flex-direction:column; align-items:stretch; gap:12px; padding:12px 16px; }
  .editor-card { min-height:350px; }
  .toolbar-btn { width:44px; height:44px; min-width:44px; }
  .markdown-input { font-size:16px; }
}

/* 美化滚动条 - 支持现代浏览器和 Firefox */
.editor-sidebar::-webkit-scrollbar { width:8px; }
.editor-sidebar::-webkit-scrollbar-track { background:transparent; }
.editor-sidebar::-webkit-scrollbar-thumb { background:var(--a-border); border-radius:4px; }
.editor-sidebar::-webkit-scrollbar-thumb:hover { background:var(--a-text-3); }

.markdown-input::-webkit-scrollbar { width:8px; }
.markdown-input::-webkit-scrollbar-track { background:transparent; }
.markdown-input::-webkit-scrollbar-thumb { background:var(--a-border); border-radius:4px; }
.markdown-input::-webkit-scrollbar-thumb:hover { background:var(--a-text-3); }

.editor-preview::-webkit-scrollbar { width:8px; }
.editor-preview::-webkit-scrollbar-track { background:transparent; }
.editor-preview::-webkit-scrollbar-thumb { background:var(--a-border); border-radius:4px; }
.editor-preview::-webkit-scrollbar-thumb:hover { background:var(--a-text-3); }

/* Firefox 滚动条样式 */
@supports (scrollbar-width: thin) {
  .editor-sidebar { scrollbar-width: thin; scrollbar-color: var(--a-border) transparent; }
  .markdown-input { scrollbar-width: thin; scrollbar-color: var(--a-border) transparent; }
  .editor-preview { scrollbar-width: thin; scrollbar-color: var(--a-border) transparent; }
}

/* 暗色模式 */
[data-theme="dark"] .editor-toolbar { background:var(--a-bg-3, var(--a-bg-2)); }
[data-theme="dark"] .markdown-input { background:var(--a-bg-2); }
[data-theme="dark"] .editor-footer { background:var(--a-bg-3, var(--a-bg-2)); }
[data-theme="dark"] .sidebar-card-header { background:var(--a-bg-3, var(--a-bg-2)); }
[data-theme="dark"] .tag-chip { background:rgba(56,189,248,.2); color:#38bdf8; }
[data-theme="dark"] .tag-chip:hover { background:rgba(56,189,248,.3); }
[data-theme="dark"] .status-indicator { background:rgba(34,197,94,.15); color:#4ade80; }
[data-theme="dark"] .status-dot { background:#4ade80; }
[data-theme="dark"] .shortcut-key { background:var(--a-bg-3, var(--a-bg-2)); box-shadow:0 1px 2px rgba(0,0,0,.2); }
</style>
