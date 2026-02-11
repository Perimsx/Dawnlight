<template>
  <div>
    <div class="a-topbar">
      <div>
        <div class="a-title">友链管理</div>
        <div class="a-subtitle">共 {{ links.length }} 个友链</div>
      </div>
      <div class="a-actions">
        <button class="a-btn" @click="showInfoModal = true">申请信息</button>
        <button class="a-btn a-btn-primary" @click="openAddModal">添加友链</button>
      </div>
    </div>

    <div class="a-card" style="flex:1;min-height:0;display:flex;flex-direction:column;">
      <div class="a-card-b" style="flex:1;overflow-y:auto;min-height:0;">
        <div v-if="loading" style="text-align:center;padding:40px;color:var(--a-text-3);">加载中...</div>
        <div v-else-if="links.length === 0" class="links-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--a-text-3);opacity:.4;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span>暂无友链，点击右上角添加</span>
        </div>
        <div v-else class="links-admin-grid">
          <div v-for="link in links" :key="link.name" class="link-admin-card">
            <div class="link-admin-avatar">
              <img v-if="link.avatar" :src="link.avatar" :alt="link.name">
              <div v-else class="link-avatar-placeholder">{{ link.name[0] }}</div>
            </div>
            <div class="link-admin-info">
              <div style="font-weight:500;font-size:14px;">{{ link.name }}</div>
              <div v-if="link.description" style="font-size:12px;color:var(--a-text-2);margin-top:2px;">{{ link.description }}</div>
            </div>
            <div class="link-admin-actions">
              <button class="a-btn a-btn-sm" @click="editLink(link)">编辑</button>
              <button class="a-btn a-btn-sm a-btn-danger" @click="deleteLink(link)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-container">
          <h3>{{ editingLink ? '编辑友链' : '添加友链' }}</h3>
          <div class="modal-field">
            <label>名称</label>
            <input type="text" v-model="formData.name" class="a-input" style="width:100%;">
          </div>
          <div class="modal-field">
            <label>URL</label>
            <input type="text" v-model="formData.url" class="a-input" style="width:100%;" placeholder="https://">
          </div>
          <div class="modal-field">
            <label>头像URL</label>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="text" v-model="formData.avatar" class="a-input" style="flex:1;">
              <img v-if="formData.avatar" :src="formData.avatar" alt="" class="avatar-preview" @error="(e) => e.target.style.display='none'">
            </div>
          </div>
          <div class="modal-field">
            <label>描述</label>
            <input type="text" v-model="formData.description" class="a-input" style="width:100%;">
          </div>
          <div class="modal-actions">
            <button class="a-btn" @click="showModal = false">取消</button>
            <button class="a-btn a-btn-primary" @click="saveLink">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 申请信息弹窗 -->
    <Teleport to="body">
      <div v-if="showInfoModal" class="modal-overlay" @click.self="showInfoModal = false">
        <div class="modal-container" style="max-width:600px;">
          <h3>申请友链信息</h3>
          <div class="modal-field">
            <label>申请说明 (Markdown)</label>
            <textarea v-model="applicationInfo" class="a-input" style="width:100%;min-height:200px;resize:vertical;" placeholder="支持 Markdown 格式"></textarea>
          </div>
          <div class="modal-actions">
            <button class="a-btn" @click="showInfoModal = false">取消</button>
            <button class="a-btn a-btn-primary" @click="saveApplicationInfo">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { authFetch } = useAdmin()
const ui = useAdminUI()

const links = ref([])
const loading = ref(true)
const showModal = ref(false)
const showInfoModal = ref(false)
const editingLink = ref(null)
const applicationInfo = ref('')
const formData = reactive({ name: '', url: '', avatar: '', description: '' })

const loadLinks = async () => {
  loading.value = true
  try {
    const data = await authFetch('/api/links')
    if (data.success) {
      links.value = data.data?.recommended || []
      applicationInfo.value = data.data?.applicationInfo || ''
    }
  } catch {}
  loading.value = false
}

const openAddModal = () => {
  editingLink.value = null
  Object.assign(formData, { name: '', url: '', avatar: '', description: '' })
  showModal.value = true
}

const editLink = (link) => {
  editingLink.value = link
  Object.assign(formData, { ...link })
  showModal.value = true
}

const saveLink = async () => {
  if (!formData.name.trim()) { ui.toast('请填写名称', 'warning'); return }
  if (!formData.url.trim()) { ui.toast('请填写 URL', 'warning'); return }
  try {
    if (editingLink.value) {
      await authFetch(`/api/links/${encodeURIComponent(editingLink.value.name)}`, {
        method: 'PUT', body: { ...formData }
      })
      ui.toast('已保存', 'success')
    } else {
      await authFetch('/api/links', { method: 'POST', body: { ...formData } })
      ui.toast('已添加', 'success')
    }
    showModal.value = false
    await loadLinks()
  } catch {}
}

const deleteLink = async (link) => {
  const ok = await ui.confirm(`确定删除「${link.name}」？`, { danger: true, confirmText: '删除' })
  if (!ok) return
  try {
    await authFetch(`/api/links/${encodeURIComponent(link.name)}`, { method: 'DELETE' })
    await loadLinks()
    ui.toast('删除成功', 'success')
  } catch {}
}

const saveApplicationInfo = async () => {
  try {
    await authFetch('/api/links/info', { method: 'PUT', body: { applicationInfo: applicationInfo.value } })
    showInfoModal.value = false
    ui.toast('已保存', 'success')
  } catch (e) {
    ui.toast(e?.data?.message || '保存失败', 'error')
  }
}

onMounted(loadLinks)
</script>

<style scoped>
.links-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.link-admin-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--a-bg-2); border-radius: 10px; border: 1px solid var(--a-border); }
.link-admin-avatar img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
.link-avatar-placeholder { width: 48px; height: 48px; border-radius: 10px; background: var(--a-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; }
.link-admin-info { flex: 1; min-width: 0; }
.link-admin-actions { display: flex; gap: 6px; flex-shrink: 0; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-container { background: var(--a-bg); border-radius: 16px; padding: 24px; max-width: 480px; width: 90%; max-height: 80vh; overflow-y: auto; }
.modal-container h3 { margin: 0 0 16px; font-size: 18px; }
.modal-field { margin-bottom: 14px; }
.modal-field label { display: block; font-size: 12px; font-weight: 600; color: var(--a-text-2); margin-bottom: 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.links-empty { text-align:center; padding:50px 20px; color:var(--a-text-3); font-size:14px; display:flex; flex-direction:column; align-items:center; gap:10px; }
.avatar-preview { width:36px; height:36px; border-radius:8px; object-fit:cover; border:1px solid var(--a-border); flex-shrink:0; }
</style>
