<template>
  <div>
    <div class="a-topbar">
      <div>
        <div class="a-title">站点设置</div>
        <div class="a-subtitle">管理站点配置、个人资料与安全选项</div>
      </div>
      <div class="a-actions">
        <button class="a-btn" @click="resetConfig">重置默认</button>
        <button class="a-btn a-btn-primary" @click="saveConfig" :disabled="saving">{{ saving ? '保存中...' : '保存设置' }}</button>
      </div>
    </div>

    <div v-if="loading" style="text-align:center;padding:40px;color:var(--a-text-3);">加载中...</div>

    <template v-else>
      <div class="settings-layout">
        <!-- 顶部 Tab 导航（对齐旧版） -->
        <nav class="settings-nav">
          <div class="settings-nav-list">
            <button class="settings-nav-item" :class="{ active: activeSection === 'site' }" @click="activeSection = 'site'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              站点配置
              <span class="nav-dot" :class="{ visible: dirty.site }"></span>
            </button>
            <button class="settings-nav-item" :class="{ active: activeSection === 'siteinfo' }" @click="activeSection = 'siteinfo'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              站点信息
              <span class="nav-dot" :class="{ visible: dirty.siteinfo }"></span>
            </button>
            <button class="settings-nav-item" :class="{ active: activeSection === 'profile' }" @click="activeSection = 'profile'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              个人资料
              <span class="nav-dot" :class="{ visible: dirty.profile }"></span>
            </button>
            <button class="settings-nav-item" :class="{ active: activeSection === 'announcements' }" @click="activeSection = 'announcements'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
              公告管理
              <span class="nav-dot" :class="{ visible: dirty.announcements }"></span>
            </button>
            <button class="settings-nav-item" :class="{ active: activeSection === 'logs' }" @click="activeSection = 'logs'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
              建站日志
              <span class="nav-dot" :class="{ visible: dirty.logs }"></span>
            </button>
            <button class="settings-nav-item" :class="{ active: activeSection === 'security' }" @click="activeSection = 'security'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              安全设置
              <span class="nav-dot" :class="{ visible: dirty.security }"></span>
            </button>
          </div>
        </nav>

        <!-- 内容区域 -->
        <div class="settings-content">
          <!-- ===== 站点配置 ===== -->
          <div v-show="activeSection === 'site'" class="settings-section active">
            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  基本信息
                </div>
              </div>
              <div class="s-card-body">
                <div class="s-form-grid">
                  <div class="s-form-group">
                    <label class="s-label">站点名称</label>
                    <input type="text" class="s-input" v-model="configData.site.name" @input="markDirty('site')" placeholder="我的博客">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">页面标题</label>
                    <input type="text" class="s-input" v-model="configData.site.title" @input="markDirty('site')" placeholder="我的博客 | 分享生活与技术">
                  </div>
                  <div class="s-form-group full">
                    <label class="s-label">站点标语 <span class="s-label-hint">显示在站点名称下方</span></label>
                    <input type="text" class="s-input" v-model="configData.site.slogan" @input="markDirty('site')" placeholder="记录生活，分享技术">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">Logo URL</label>
                    <input type="url" class="s-input" v-model="configData.site.logo" @input="markDirty('site')" placeholder="https://example.com/logo.png">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">Favicon URL</label>
                    <input type="url" class="s-input" v-model="configData.site.favicon" @input="markDirty('site')" placeholder="https://example.com/favicon.ico">
                  </div>
                  <div class="s-form-group full">
                    <label class="s-label">版权信息</label>
                    <input type="text" class="s-input" v-model="configData.site.copyright" @input="markDirty('site')" placeholder="© 2026 My Blog">
                  </div>
                  <div class="s-form-group full">
                    <label class="s-label">登录页提示 <span class="s-label-hint">显示在登录按钮下方</span></label>
                    <input type="text" class="s-input" v-model="configData.site.loginHint" @input="markDirty('site')" placeholder="欢迎回来">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== 站点信息与备案 ===== -->
          <div v-show="activeSection === 'siteinfo'" class="settings-section active">
            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  站点信息与备案
                </div>
              </div>
              <div class="s-card-body">
                <div class="s-form-grid">
                  <div class="s-form-group">
                    <label class="s-label">建站日期 <span class="s-label-hint">用于计算运行时间</span></label>
                    <input type="date" class="s-input" v-model="configData.siteInfo.startTime" @input="markDirty('siteinfo')">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">域名</label>
                    <input type="text" class="s-input" v-model="configData.siteInfo.domain" @input="markDirty('siteinfo')" placeholder="example.com">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">ICP 备案号</label>
                    <input type="text" class="s-input" v-model="configData.siteInfo.icp" @input="markDirty('siteinfo')" placeholder="鄂ICP备xxxxxxxx号">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">公安备案号</label>
                    <input type="text" class="s-input" v-model="configData.siteInfo.policeBeian" @input="markDirty('siteinfo')" placeholder="京公网安备 xxxxxxxx号">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">图片存储</label>
                    <input type="text" class="s-input" v-model="configData.siteInfo.imageStorage" @input="markDirty('siteinfo')" placeholder="GitHub / OSS / 本地">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">软件许可</label>
                    <input type="text" class="s-input" v-model="configData.siteInfo.softwareLicense" @input="markDirty('siteinfo')" placeholder="MIT / Apache 2.0">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">文章许可</label>
                    <input type="text" class="s-input" v-model="configData.siteInfo.articleLicense" @input="markDirty('siteinfo')" placeholder="CC BY-NC-SA 4.0">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">出生年份 <span class="s-label-hint">用于计算年龄</span></label>
                    <input type="number" class="s-input" v-model.number="configData.author.birthYear" @input="markDirty('siteinfo')" placeholder="2000" min="1900" max="2100">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== 个人资料（作者 + 社交） ===== -->
          <div v-show="activeSection === 'profile'" class="settings-section active">
            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  博客信息卡片
                </div>
                <span style="font-size:12px;color:var(--a-text-3);">对应友链页右侧显示的内容</span>
              </div>
              <div class="s-card-body">
                <!-- 预览 -->
                <div class="profile-preview">
                  <div class="profile-preview-header">
                    <img :src="authorAvatarPreview" alt="头像" class="profile-preview-avatar" @error="onAuthorAvatarError">
                    <div>
                      <div class="profile-preview-name">{{ configData.author.name || '博主' }}</div>
                      <div class="profile-preview-slogan">{{ configData.author.bio || '介绍文字' }}</div>
                    </div>
                  </div>
                  <div class="profile-preview-fields">
                    <div class="profile-pf"><span class="profile-pf-label">博主</span><span class="profile-pf-value">{{ configData.author.name || '-' }}</span></div>
                    <div class="profile-pf"><span class="profile-pf-label">介绍</span><span class="profile-pf-value">{{ configData.author.bio || '-' }}</span></div>
                    <div class="profile-pf"><span class="profile-pf-label">网址</span><span class="profile-pf-value profile-pf-mono">{{ configData.author.website || '-' }}</span></div>
                    <div class="profile-pf"><span class="profile-pf-label">头像</span><span class="profile-pf-value profile-pf-mono">{{ configData.author.avatar || '-' }}</span></div>
                  </div>
                </div>
                <!-- 表单 -->
                <div class="s-form-grid" style="margin-top:16px;">
                  <div class="s-form-group">
                    <label class="s-label">博主名称 <span class="s-label-hint">对应「博主」字段</span></label>
                    <input type="text" class="s-input" v-model="configData.author.name" @input="markDirty('profile')" placeholder="管理员">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">联系邮箱</label>
                    <input type="email" class="s-input" v-model="configData.author.email" @input="markDirty('profile')" placeholder="admin@example.com">
                  </div>
                  <div class="s-form-group full">
                    <label class="s-label">个人简介 <span class="s-label-hint">对应「介绍」字段</span></label>
                    <textarea class="s-input" rows="2" v-model="configData.author.bio" @input="markDirty('profile')" placeholder="简单介绍一下自己..."></textarea>
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">网址 <span class="s-label-hint">对应「网址」字段</span></label>
                    <input type="url" class="s-input" v-model="configData.author.website" @input="markDirty('profile')" placeholder="https://example.com">
                  </div>
                  <div class="s-form-group">
                    <label class="s-label">头像 URL <span class="s-label-hint">对应「头像」字段</span></label>
                    <input type="url" class="s-input" v-model="configData.author.avatar" @input="markDirty('profile')" placeholder="https://example.com/avatar.jpg">
                  </div>
                </div>
              </div>
            </div>

            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  社交媒体链接
                </div>
              </div>
              <div class="s-card-body">
                <div class="social-grid">
                  <div v-for="(s, i) in socials" :key="i" class="social-item" :class="{ 'has-bg': !!s.background, 'has-color': !!s.color }" :style="socialCardPreviewStyle(s)" @click="openSocialModal(i)">
                    <div class="social-item-icon" v-html="s.icon || getSocialIcon(s.name || '')"></div>
                    <div class="social-item-info">
                      <div class="social-item-name">{{ s.name || '未命名' }}</div>
                      <div v-if="s.description" class="social-item-desc">{{ s.description }}</div>
                    </div>
                    <div class="social-item-actions">
                      <svg class="social-item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      <button class="social-action-btn delete" @click.stop="removeSocial(i)" title="删除">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                  <div class="social-add-btn" @click="openSocialModal(-1)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>添加社交链接</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== 公告管理 ===== -->
          <div v-show="activeSection === 'announcements'" class="settings-section active">
            <!-- 前台预览 -->
            <div v-if="activeAnnouncements.length > 0" class="s-card" style="margin-bottom:20px;">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  前台预览
                </div>
              </div>
              <div class="s-card-body">
                <div class="ann-preview-list">
                  <div v-for="ann in activeAnnouncements" :key="ann.content" class="ann-preview-item" :class="'ann-type-' + (ann.type || 'info')">
                    <span class="ann-preview-icon" v-html="getAnnIcon(ann.type || 'info')"></span>
                    <div class="ann-preview-text">{{ ann.content }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                  站点公告
                </div>
                <button class="a-btn a-btn-sm a-btn-primary" @click="addAnnouncement">+ 添加</button>
              </div>
              <div class="s-card-body">
                <div v-if="!configData.site.announcements || configData.site.announcements.length === 0" style="text-align:center;padding:20px;color:var(--a-text-3);">暂无公告</div>
                <div v-else v-for="(ann, i) in configData.site.announcements" :key="i" class="ann-row">
                  <div class="ann-type-dot" :class="'dot-' + (ann.type || 'info')"></div>
                  <select v-model="ann.type" class="s-input" style="width:110px;" @change="markDirty('announcements')">
                    <option value="info">信息</option>
                    <option value="warning">警告</option>
                    <option value="danger">危险</option>
                    <option value="success">成功</option>
                  </select>
                  <input type="text" v-model="ann.content" class="s-input" style="flex:1;" placeholder="公告内容" @input="markDirty('announcements')">
                  <label class="ann-active">
                    <input type="checkbox" v-model="ann.active" @change="markDirty('announcements')"> 启用
                  </label>
                  <button class="a-btn a-btn-sm a-btn-danger" @click="removeAnnouncement(i)">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== 建站日志 ===== -->
          <div v-show="activeSection === 'logs'" class="settings-section active">
            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                  建站日志
                </div>
                <button class="a-btn a-btn-sm a-btn-primary" @click="addLog">+ 添加</button>
              </div>
              <div class="s-card-body">
                <div v-if="!configData.siteInfo.logs || configData.siteInfo.logs.length === 0" style="text-align:center;padding:20px;color:var(--a-text-3);">暂无日志</div>
                <div v-else v-for="(log, i) in configData.siteInfo.logs" :key="i" class="log-row">
                  <input type="date" v-model="log.date" class="s-input" style="width:160px;" @input="markDirty('logs')">
                  <input type="text" v-model="log.content" class="s-input" style="flex:1;" placeholder="日志内容" @input="markDirty('logs')">
                  <button class="a-btn a-btn-sm a-btn-danger" @click="removeLog(i)">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== 安全设置 ===== -->
          <div v-show="activeSection === 'security'" class="settings-section active">
            <div class="s-card">
              <div class="s-card-header">
                <div class="s-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  安全设置
                </div>
              </div>
              <div class="s-card-body">
                <div class="security-card">
                  <div class="security-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div class="security-content">
                    <div class="security-title">修改管理密码</div>
                    <div class="security-desc">定期更换密码可以提高账户安全性。新密码长度至少 6 位。</div>
                    <div class="security-form">
                      <input type="password" class="s-input" v-model="pwd.current" placeholder="当前密码" @input="markDirty('security')">
                      <input type="password" class="s-input" v-model="pwd.next" placeholder="新密码" @input="markDirty('security')">
                      <button class="a-btn a-btn-danger" @click="changePassword" :disabled="pwdLoading">{{ pwdLoading ? '提交中...' : '修改密码' }}</button>
                    </div>
                    <div v-if="pwdStrength.visible" class="password-strength">
                      <div class="password-strength-bar">
                        <div class="password-strength-fill" :style="{ width: pwdStrength.percent + '%' }"></div>
                      </div>
                      <span>{{ pwdStrength.text }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 社交编辑弹窗 -->
    <Teleport to="body">
      <div v-if="socialModalOpen" class="modal" @click.self="closeSocialModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingSocialIndex >= 0 ? '编辑社交链接' : '添加社交链接' }}</h3>
            <button class="modal-close" @click="closeSocialModal">&times;</button>
          </div>
          <div class="modal-body">
            <!-- 实时预览 -->
            <div class="social-preview-wrap">
              <div class="social-preview-label">前台预览效果</div>
              <div class="social-preview-card" :class="{ 'has-bg': !!socialForm.background, 'has-color': !!socialForm.color }" :style="socialFormPreviewStyle">
                <div class="social-preview-icon" v-html="socialForm.icon || getSocialIcon(socialForm.name || '')"></div>
                <div class="social-preview-info">
                  <div class="social-preview-name">{{ socialForm.name || '平台名称' }}</div>
                  <div v-if="socialForm.description" class="social-preview-desc">{{ socialForm.description }}</div>
                </div>
                <svg class="social-preview-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
            <!-- 预设平台快捷选择 -->
            <div class="social-presets">
              <span class="social-presets-label">快捷选择：</span>
              <button v-for="p in socialPresets" :key="p.name" class="social-preset-btn" :class="{ active: socialForm.name === p.name }" @click="applySocialPreset(p)">
                <span v-html="getSocialIcon(p.name)"></span>
                {{ p.label }}
              </button>
            </div>
            <div class="social-modal-grid">
              <div class="form-group">
                <label>平台名称 <span class="form-hint">前台显示的标题</span></label>
                <input class="s-input" v-model="socialForm.name" placeholder="GitHub / Bilibili / Email">
              </div>
              <div class="form-group">
                <label>链接地址</label>
                <input class="s-input" v-model="socialForm.url" placeholder="https://... 或 mailto:...">
              </div>
              <div class="form-group">
                <label>描述（可选）<span class="form-hint">显示在名称下方</span></label>
                <input class="s-input" v-model="socialForm.description" placeholder="一句话描述">
              </div>
              <div class="form-group">
                <label>主题颜色（可选）<span class="form-hint">卡片背景色</span></label>
                <div style="display:flex;gap:8px;align-items:center;">
                  <input class="s-input" v-model="socialForm.color" placeholder="#3b82f6" style="flex:1;">
                  <input v-if="socialForm.color" type="color" :value="socialForm.color" @input="socialForm.color = $event.target.value" style="width:32px;height:32px;border:1px solid var(--a-border);border-radius:6px;padding:2px;cursor:pointer;">
                </div>
              </div>
              <div class="form-group full">
                <label>背景图片（可选）<span class="form-hint">覆盖主题颜色</span></label>
                <input class="s-input" v-model="socialForm.background" placeholder="https://example.com/bg.jpg">
                <div v-if="socialForm.background" class="social-bg-preview">
                  <img :src="socialForm.background" alt="背景预览" @error="(e) => e.target.style.display='none'">
                </div>
              </div>
              <div class="form-group full">
                <label>图标 SVG（可选）<span class="form-hint">留空自动识别</span></label>
                <textarea class="s-input" rows="3" v-model="socialForm.icon" placeholder="留空将根据平台名称自动生成图标"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="a-btn" @click="closeSocialModal">取消</button>
            <button class="a-btn a-btn-primary" @click="saveSocial">保存</button>
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
const loading = ref(true)
const saving = ref(false)
const activeSection = ref('site')

const dirty = reactive({
  site: false,
  siteinfo: false,
  profile: false,
  announcements: false,
  logs: false,
  security: false
})

const markDirty = (key) => {
  dirty[key] = true
}

const fullConfig = ref({})

const configData = reactive({
  site: { name: '', title: '', slogan: '', logo: '', favicon: '', copyright: '', announcements: [], loginHint: '' },
  author: { name: '', bio: '', email: '', socials: [], birthYear: undefined, avatar: '', website: '' },
  siteInfo: { startTime: '', icp: '', policeBeian: '', imageStorage: '', domain: '', softwareLicense: '', articleLicense: '', logs: [] }
})

const { getSocialIcon } = useSiteConfig()
const socials = computed(() => configData.author.socials || [])

// 公告预览：只显示启用且有内容的公告
const activeAnnouncements = computed(() => {
  return (configData.site.announcements || []).filter(a => a.active !== false && a.content?.trim())
})

// 公告图标（与前台 TheSidebarRight.vue getAnnouncementIcon 完全一致）
const getAnnIcon = (type) => {
  const icons = {
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-warning"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    danger: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-danger"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  }
  return icons[type] || icons.info
}

// 社交平台预设列表（用于快速选择）
const socialPresets = [
  { name: 'GitHub', label: 'GitHub' },
  { name: 'Bilibili', label: 'Bilibili' },
  { name: 'Twitter', label: 'X/Twitter' },
  { name: 'Telegram', label: 'Telegram' },
  { name: 'Discord', label: 'Discord' },
  { name: 'YouTube', label: 'YouTube' },
  { name: 'Email', label: '邮箱' },
]

const applySocialPreset = (preset) => {
  socialForm.name = preset.name
  socialForm.icon = '' // 清空自定义图标，让 getSocialIcon 自动生成
}

const loadConfig = async () => {
  loading.value = true
  try {
    const data = await authFetch('/api/config')
    if (data.success) {
      fullConfig.value = data.data || {}
      Object.assign(configData, {
        site: { ...configData.site, ...data.data.site },
        author: { ...configData.author, ...data.data.author },
        siteInfo: { ...configData.siteInfo, ...data.data.siteInfo }
      })
    }
  } catch {}
  loading.value = false
}

const saveConfig = async () => {
  saving.value = true
  try {
    // 保留其他未在此页编辑的配置字段，避免覆盖写丢失（服务端也会做深合并）
    const body = {
      ...fullConfig.value,
      site: { ...(fullConfig.value.site || {}), ...configData.site },
      author: { ...(fullConfig.value.author || {}), ...configData.author },
      siteInfo: { ...(fullConfig.value.siteInfo || {}), ...configData.siteInfo }
    }
    // Bot 功能全删：不再写入 bot 字段
    if (body.bot) delete body.bot

    await authFetch('/api/config', {
      method: 'PUT',
      body
    })
    ui.toast('保存成功', 'success')
    Object.keys(dirty).forEach((k) => { dirty[k] = false })
    // 刷新 fullConfig，避免后续保存丢字段
    fullConfig.value = body
  } catch {}
  saving.value = false
}

const resetConfig = async () => {
  const ok = await ui.confirm('确定要重置为默认配置？', { danger: true, confirmText: '重置' })
  if (!ok) return
  try {
    await authFetch('/api/config/reset', { method: 'POST' })
    await loadConfig()
    ui.toast('已重置为默认配置', 'success')
  } catch {}
}

const addAnnouncement = () => {
  if (!configData.site.announcements) configData.site.announcements = []
  configData.site.announcements.push({ type: 'info', content: '', active: true })
  markDirty('announcements')
}

const addLog = () => {
  if (!configData.siteInfo.logs) configData.siteInfo.logs = []
  configData.siteInfo.logs.unshift({ date: new Date().toISOString().split('T')[0], content: '' })
  markDirty('logs')
}

const removeAnnouncement = async (i) => {
  const ok = await ui.confirm('确定删除这条公告？', { danger: true, confirmText: '删除' })
  if (!ok) return
  configData.site.announcements.splice(i, 1)
  markDirty('announcements')
}

const removeLog = async (i) => {
  const ok = await ui.confirm('确定删除这条日志？', { danger: true, confirmText: '删除' })
  if (!ok) return
  configData.siteInfo.logs.splice(i, 1)
  markDirty('logs')
}

// 社交编辑弹窗
const socialModalOpen = ref(false)
const editingSocialIndex = ref(-1)
const socialForm = reactive({
  name: '',
  url: '',
  color: '',
  description: '',
  background: '',
  icon: ''
})

const openSocialModal = (index) => {
  editingSocialIndex.value = index
  const s = index >= 0 ? (configData.author.socials[index] || {}) : {}
  Object.assign(socialForm, {
    name: s.name || s.platform || '',
    url: s.url || '',
    color: s.color || '',
    description: s.description || '',
    background: s.background || '',
    icon: s.icon || ''
  })
  socialModalOpen.value = true
}

const closeSocialModal = () => {
  socialModalOpen.value = false
  editingSocialIndex.value = -1
}

const saveSocial = async () => {
  const name = socialForm.name.trim()
  const url = socialForm.url.trim()
  if (!name || !url) {
    ui.toast('请填写平台名称与链接地址', 'warning')
    return
  }
  const data = {
    name,
    url,
    color: socialForm.color.trim(),
    description: socialForm.description.trim(),
    background: socialForm.background.trim(),
    icon: (socialForm.icon || '').trim() || getSocialIcon(name)
  }
  if (!Array.isArray(configData.author.socials)) configData.author.socials = []
  if (editingSocialIndex.value >= 0) {
    configData.author.socials.splice(editingSocialIndex.value, 1, data)
  } else {
    configData.author.socials.push(data)
  }
  markDirty('profile')
  ui.toast('已保存', 'success')
  closeSocialModal()
}

const removeSocial = async (i) => {
  const ok = await ui.confirm('确定要删除这个社交链接吗？', { danger: true, confirmText: '删除' })
  if (!ok) return
  configData.author.socials.splice(i, 1)
  markDirty('profile')
  ui.toast('已删除', 'success')
}

// 与前台 TheSidebarRight.vue 的 socialCardStyle 保持一致
const socialCardPreviewStyle = (s) => {
  let style = ''
  if (s.color) style += `background: ${s.color};`
  if (s.background) style += `--social-bg-image: url('${s.background}');`
  return style
}

// 弹窗中的实时预览样式
const socialFormPreviewStyle = computed(() => {
  let style = ''
  if (socialForm.color) style += `background: ${socialForm.color};`
  if (socialForm.background) style += `--social-bg-image: url('${socialForm.background}');`
  return style
})

// 作者头像预览
const authorAvatarPreview = computed(() => {
  return configData.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
})
const onAuthorAvatarError = (e) => {
  if (e?.target) e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
}

// 安全设置：修改密码
const pwd = reactive({ current: '', next: '' })
const pwdLoading = ref(false)
const pwdStrength = reactive({ visible: false, percent: 0, text: '弱' })

watch(() => pwd.next, (val) => {
  const p = (val || '').length
  pwdStrength.visible = !!val
  if (p < 6) { pwdStrength.percent = 20; pwdStrength.text = '太短' }
  else if (p < 9) { pwdStrength.percent = 45; pwdStrength.text = '弱' }
  else if (p < 12) { pwdStrength.percent = 70; pwdStrength.text = '中' }
  else { pwdStrength.percent = 90; pwdStrength.text = '强' }
})

const changePassword = async () => {
  if (pwdLoading.value) return
  if (!pwd.current || !pwd.next) {
    ui.toast('请填写当前密码和新密码', 'warning')
    return
  }
  if (pwd.next.length < 6) {
    ui.toast('新密码长度至少 6 位', 'warning')
    return
  }
  pwdLoading.value = true
  try {
    const res = await authFetch('/api/auth/password', {
      method: 'PUT',
      body: { currentPassword: pwd.current, newPassword: pwd.next }
    })
    if (res?.success) {
      ui.toast('密码已修改，请重新登录', 'success')
      pwd.current = ''
      pwd.next = ''
      // 服务端会清空会话，客户端这里直接跳转
      await useAdmin().logout()
      navigateTo('/admin/login')
    } else {
      ui.toast(res?.message || '修改失败', 'error')
    }
  } catch (e) {
    ui.toast(e?.data?.message || e?.message || '修改失败', 'error')
  }
  pwdLoading.value = false
}

onMounted(loadConfig)
</script>

<style scoped>
.settings-layout { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; }
.settings-nav { flex-shrink:0; margin-bottom:20px; }
.settings-nav-list { display:flex; gap:0; border-bottom: 1px solid var(--a-border); overflow-x: auto; scrollbar-width:none; }
.settings-nav-list::-webkit-scrollbar { display:none; }
.settings-nav-item { display:flex; align-items:center; gap:8px; padding: 12px 18px; color: var(--a-text-2); cursor:pointer; transition: color .2s ease; border:none; background:none; font-size: 13.5px; position: relative; flex-shrink:0; white-space: nowrap; }
.settings-nav-item::after { content:''; position:absolute; bottom:-1px; left:12px; right:12px; height:2px; background:transparent; border-radius:2px 2px 0 0; transition: background .25s ease; }
.settings-nav-item:hover { color: var(--a-text); }
.settings-nav-item.active { color: var(--a-primary); font-weight: 600; }
.settings-nav-item.active::after { background: var(--a-primary); }
.settings-nav-item svg { width:16px; height:16px; flex-shrink:0; opacity:.5; transition: opacity .2s; }
.settings-nav-item.active svg { stroke: var(--a-primary); opacity: 1; }
.settings-nav-item .nav-dot { width:6px; height:6px; border-radius:50%; background: var(--a-warning); flex-shrink:0; opacity:0; transform: scale(0); transition: all .3s ease; }
.settings-nav-item .nav-dot.visible { opacity:1; transform: scale(1); }

.settings-content { display:flex; flex-direction:column; gap:20px; min-width:0; flex:1; overflow-y:auto; min-height:0; }
.settings-section { display:block; }

.s-card { background: var(--a-bg-2); backdrop-filter: blur(var(--a-glass-blur)); -webkit-backdrop-filter: blur(var(--a-glass-blur)); border: 1px solid var(--a-border); border-radius: 16px; overflow: hidden; margin-bottom: 20px; box-shadow: var(--a-shadow), inset 0 1px 0 0 var(--a-glass-highlight); transition: transform .25s ease, box-shadow .25s ease; }
.s-card:hover { transform: translateY(-1px); box-shadow: var(--a-shadow-2), inset 0 1px 0 0 var(--a-glass-highlight); }
.s-card-header { display:flex; justify-content: space-between; align-items:center; padding: 14px 20px; border-bottom: 1px solid var(--a-border); background: linear-gradient(to right, rgba(var(--a-primary-rgb), 0.02), transparent); }
.s-card-title { display:flex; align-items:center; gap: 10px; font-size: 15px; font-weight: 600; color: var(--a-text); }
.s-card-title svg { width:18px; height:18px; color: var(--a-primary); }
.s-card-body { padding: 20px; }
.s-form-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.s-form-group { display:flex; flex-direction: column; gap: 6px; }
.s-form-group.full { grid-column: 1 / -1; }
.s-label { font-size: 13px; font-weight: 500; color: var(--a-text); display:flex; align-items:center; gap: 6px; }
.s-label-hint { font-size: 11px; color: var(--a-text-3); font-weight: normal; }
.s-input { padding: 10px 14px; border: 1px solid var(--a-border); border-radius: 10px; font-size: 14px; background: rgba(255,255,255,.5); color: var(--a-text); transition: border-color .25s ease, box-shadow .25s ease, background .25s ease; line-height: 1.5; }
[data-theme="dark"] .s-input { background: rgba(255,255,255,.05); }
.s-input:focus { outline:none; border-color: var(--a-primary); box-shadow: 0 0 0 3px rgba(var(--a-primary-rgb), 0.1); background: rgba(255,255,255,.7); }
[data-theme="dark"] .s-input:focus { background: rgba(255,255,255,.08); }
textarea.s-input { resize: vertical; min-height: 90px; }

/* 博客信息卡片预览 */
.profile-preview { padding:16px; border:1px solid var(--a-border); border-radius:12px; background:rgba(var(--a-primary-rgb),.02); }
.profile-preview-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--a-border); }
.profile-preview-avatar { width:40px; height:40px; border-radius:10px; object-fit:cover; }
.profile-preview-name { font-size:15px; font-weight:700; color:var(--a-text); }
.profile-preview-slogan { font-size:11px; color:var(--a-text-3); margin-top:1px; }
.profile-preview-fields { display:flex; flex-direction:column; }
.profile-pf { display:flex; align-items:center; padding:6px 0; border-bottom:1px solid rgba(var(--a-primary-rgb),.04); }
.profile-pf:last-child { border-bottom:none; }
.profile-pf-label { width:44px; flex-shrink:0; font-size:12px; font-weight:500; color:var(--a-text-3); text-align:center; padding:2px 6px; background:rgba(0,0,0,.03); border-radius:5px; margin-right:10px; }
[data-theme="dark"] .profile-pf-label { background:rgba(255,255,255,.05); }
.profile-pf-value { flex:1; font-size:12px; color:var(--a-text); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.profile-pf-mono { font-family:'SF Mono','Consolas',monospace; font-size:11px; }

/* 社交卡片（与前台 TheSidebarRight 风格一致） */
.social-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.social-item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1px solid var(--a-border); background:var(--a-bg); cursor:pointer; transition:transform .2s, border-color .2s, box-shadow .2s; overflow:hidden; }
.social-item:hover { transform:translateY(-1px); border-color:rgba(var(--a-primary-rgb),.25); box-shadow:0 4px 12px rgba(0,0,0,.05); }
.social-item.has-color { color:#fff; border-color:transparent; }
.social-item.has-color .social-item-name { color:#fff; }
.social-item.has-color .social-item-desc { color:rgba(255,255,255,.8); }
.social-item.has-color .social-item-icon { background:rgba(255,255,255,.2); color:#fff; }
.social-item.has-color .social-item-arrow { color:rgba(255,255,255,.6); }
.social-item.has-bg { background-size:cover; background-position:center; background-image:var(--social-bg-image); border-color:transparent; }
.social-item.has-bg::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.4),rgba(0,0,0,.25)); z-index:0; }
.social-item.has-bg > * { position:relative; z-index:1; }
.social-item.has-bg .social-item-name { color:#fff; }
.social-item.has-bg .social-item-desc { color:rgba(255,255,255,.8); }
.social-item.has-bg .social-item-icon { background:rgba(255,255,255,.2); color:#fff; }
.social-item.has-bg .social-item-arrow { color:rgba(255,255,255,.6); }
.social-item-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(var(--a-primary-rgb),.1); color:var(--a-primary); flex-shrink:0; }
.social-item-icon :deep(svg) { width:20px; height:20px; }
.social-item-info { min-width:0; flex:1; }
.social-item-name { font-size:14px; font-weight:600; color:var(--a-text); line-height:1.3; }
.social-item-desc { font-size:11px; color:var(--a-text-3); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.social-item-actions { display:flex; align-items:center; gap:4px; opacity:0; transition:opacity .2s; }
.social-item:hover .social-item-actions { opacity:1; }
.social-item-arrow { color:var(--a-text-3); flex-shrink:0; }
.social-action-btn { width:26px; height:26px; border-radius:8px; border:1px solid var(--a-border); background:rgba(255,255,255,.8); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.social-action-btn.delete { color:#ff3b30; }
.social-action-btn.delete:hover { background:rgba(255,59,48,.1); border-color:#ff3b30; }
.social-add-btn { display:flex; align-items:center; justify-content:center; gap:8px; padding:14px; border-radius:12px; border:1px dashed rgba(var(--a-primary-rgb),.35); background:rgba(var(--a-primary-rgb),.04); color:var(--a-primary); cursor:pointer; transition:all .2s; font-size:13px; }
.social-add-btn:hover { background:rgba(var(--a-primary-rgb),.08); border-color:rgba(var(--a-primary-rgb),.55); transform:translateY(-1px); }

/* 弹窗中的实时预览 */
.social-preview-wrap { margin-bottom:16px; padding:14px; background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:12px; }
.social-preview-label { font-size:11px; color:var(--a-text-3); margin-bottom:8px; font-weight:500; }
.social-preview-card { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1px solid var(--a-border); background:var(--a-bg); overflow:hidden; position:relative; }
.social-preview-card.has-color { color:#fff; border-color:transparent; }
.social-preview-card.has-color .social-preview-name { color:#fff; }
.social-preview-card.has-color .social-preview-desc { color:rgba(255,255,255,.8); }
.social-preview-card.has-color .social-preview-icon { background:rgba(255,255,255,.2); color:#fff; }
.social-preview-card.has-color .social-preview-arrow { color:rgba(255,255,255,.6); }
.social-preview-card.has-bg { background-size:cover; background-position:center; background-image:var(--social-bg-image); border-color:transparent; }
.social-preview-card.has-bg::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.4),rgba(0,0,0,.25)); }
.social-preview-card.has-bg > * { position:relative; z-index:1; }
.social-preview-card.has-bg .social-preview-name { color:#fff; }
.social-preview-card.has-bg .social-preview-desc { color:rgba(255,255,255,.8); }
.social-preview-card.has-bg .social-preview-icon { background:rgba(255,255,255,.2); color:#fff; }
.social-preview-card.has-bg .social-preview-arrow { color:rgba(255,255,255,.6); }
.social-preview-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(var(--a-primary-rgb),.1); color:var(--a-primary); flex-shrink:0; }
.social-preview-icon :deep(svg) { width:20px; height:20px; }
.social-preview-info { flex:1; min-width:0; }
.social-preview-name { font-size:14px; font-weight:600; color:var(--a-text); }
.social-preview-desc { font-size:11px; color:var(--a-text-3); margin-top:1px; }
.social-preview-arrow { color:var(--a-text-3); flex-shrink:0; }
.form-hint { font-size:10px; color:var(--a-text-3); font-weight:normal; margin-left:4px; }

/* 预设平台选择 */
.social-presets { display:flex; align-items:center; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
.social-presets-label { font-size:11px; color:var(--a-text-3); flex-shrink:0; }
.social-preset-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg); cursor:pointer; font-size:12px; color:var(--a-text-2); transition:all .15s; }
.social-preset-btn:hover { border-color:var(--a-primary); color:var(--a-primary); background:rgba(var(--a-primary-rgb),.04); }
.social-preset-btn.active { border-color:var(--a-primary); color:var(--a-primary); background:rgba(var(--a-primary-rgb),.08); font-weight:600; }
.social-preset-btn :deep(svg) { width:14px; height:14px; }

/* 背景图预览 */
.social-bg-preview { margin-top:8px; width:100%; aspect-ratio:16/6; border-radius:8px; overflow:hidden; border:1px solid var(--a-border); }
.social-bg-preview img { width:100%; height:100%; object-fit:cover; }

/* 公告预览（与前台一致） */
.ann-preview-list { display:flex; flex-direction:column; gap:6px; }
.ann-preview-item { padding:10px 12px; border-radius:8px; font-size:13px; line-height:1.4; display:flex; align-items:center; gap:10px; }
.ann-preview-icon { flex-shrink:0; display:flex; align-items:center; }
.ann-preview-text { flex:1; min-width:0; }
.ann-type-info { background:rgba(59,130,246,.08); color:rgba(59,130,246,.9); }
.ann-type-info .ann-preview-icon { color:#3b82f6; }
.ann-type-warning { background:rgba(245,158,11,.08); color:rgba(245,158,11,.9); }
.ann-type-warning .ann-preview-icon { color:#f59e0b; }
.ann-type-danger { background:rgba(239,68,68,.08); color:rgba(239,68,68,.9); }
.ann-type-danger .ann-preview-icon { color:#ef4444; }
.ann-type-success { background:rgba(34,197,94,.08); color:rgba(34,197,94,.9); }
.ann-type-success .ann-preview-icon { color:#22c55e; }
.ann-preview-item .ann-preview-text { color:var(--a-text); }

/* 行布局 */
.ann-row, .log-row { display:flex; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid var(--a-border); }
.ann-row:last-child, .log-row:last-child { border-bottom:none; }
.ann-active { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--a-text-2); }
.ann-type-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.ann-type-dot.dot-info { background:#3b82f6; }
.ann-type-dot.dot-warning { background:#f59e0b; }
.ann-type-dot.dot-danger { background:#ef4444; }
.ann-type-dot.dot-success { background:#22c55e; }

/* 安全设置 */
.security-card { display:flex; gap: 14px; padding: 14px; border-radius: 16px; border: 1px solid var(--a-border); background: rgba(var(--a-primary-rgb), 0.03); }
.security-icon { width: 44px; height: 44px; border-radius: 14px; display:flex; align-items:center; justify-content:center; background: rgba(var(--a-primary-rgb), 0.1); color: var(--a-primary); flex-shrink:0; }
.security-icon svg { width: 22px; height: 22px; }
.security-content { flex: 1; min-width:0; }
.security-title { font-size: 14px; font-weight: 700; color: var(--a-text); }
.security-desc { font-size: 12px; color: var(--a-text-3); margin-top: 2px; margin-bottom: 10px; }
.security-form { display:flex; gap: 10px; flex-wrap: wrap; align-items:center; }
.password-strength { margin-top: 10px; font-size: 12px; color: var(--a-text-3); display:flex; align-items:center; gap: 10px; }
.password-strength-bar { width: 140px; height: 6px; border-radius: 999px; background: rgba(0,0,0,0.08); overflow:hidden; }
.password-strength-fill { height: 100%; background: var(--a-primary); border-radius: 999px; transition: width .2s ease; }

/* 社交弹窗（复用 admin-style 的 .modal/.modal-content 结构） */
.social-modal-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.social-modal-grid .full { grid-column: 1 / -1; }

@media (max-width: 860px) {
  .s-form-grid { grid-template-columns: 1fr; }
}
</style>
