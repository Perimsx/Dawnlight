<template>
  <div>
    <div class="a-topbar">
        <div>
            <div class="a-title">控制台</div>
            <div class="a-subtitle">概览与关键指标</div>
        </div>
        <div class="a-actions">
            <a class="a-btn" href="/" target="_blank">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              打开站点
            </a>
            <NuxtLink class="a-btn a-btn-primary" to="/admin/posts/edit?new=1">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建文章
            </NuxtLink>
        </div>
    </div>

    <!-- 统计概览 -->
    <div class="db-stats-row">
      <div class="db-stat">
        <div class="db-stat-icon" style="background:rgba(var(--a-primary-rgb),0.1);color:var(--a-primary);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="db-stat-num">{{ stats.totalPosts }}</div>
        <div class="db-stat-label">文章数</div>
      </div>
      <div class="db-stat">
        <div class="db-stat-icon" style="background:rgba(52,199,89,0.1);color:#34c759;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div class="db-stat-num">{{ formatWordCount(stats.totalWords) }}字</div>
        <div class="db-stat-label">总字数</div>
      </div>
      <div class="db-stat">
        <div class="db-stat-icon" style="background:rgba(0,122,255,0.1);color:#007aff;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div class="db-stat-num">{{ formatNumber(stats.totalViews) }}</div>
        <div class="db-stat-label">总浏览量</div>
      </div>
      <div class="db-stat">
        <div class="db-stat-icon" style="background:rgba(255,149,0,0.1);color:#ff9500;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="db-stat-num">{{ stats.postsThisYear }}</div>
        <div class="db-stat-label">本年发文</div>
      </div>
      <div class="db-stat">
        <div class="db-stat-icon" style="background:rgba(88,86,214,0.1);color:#5856d6;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="db-stat-num">{{ stats.postsThisMonth }}</div>
        <div class="db-stat-label">本月发文</div>
      </div>
      <div class="db-stat">
        <div class="db-stat-icon" style="background:rgba(255,59,48,0.1);color:#ff3b30;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="db-stat-num">{{ stats.activeDays }}</div>
        <div class="db-stat-label">活跃天数</div>
      </div>
    </div>

    <div class="dashboard-spacer"></div>

    <!-- 趋势图表 -->
    <div class="a-card">
        <div class="a-card-h">
            <div class="a-badge">发文趋势</div>
        </div>
        <div class="a-card-b" style="height: 160px;">
           <Line v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
        </div>
    </div>

    <div class="dashboard-spacer"></div>

    <!-- 最近文章 -->
    <div class="a-card" style="flex:1;min-height:0;display:flex;flex-direction:column;">
        <div class="a-card-h" style="flex-shrink:0;">
            <div class="a-badge">最近文章</div>
            <NuxtLink to="/admin/posts" class="a-btn a-btn-sm">查看全部</NuxtLink>
        </div>
        <div class="a-card-b dashboard-recent-posts" style="padding:0;flex:1;overflow-y:auto;min-height:0;">
             <!-- Desktop Table -->
             <div class="dashboard-table-wrapper dashboard-desktop-table">
                <table class="a-table" style="table-layout: auto; width: auto; min-width: 100%;">
                    <colgroup>
                        <col style="width: auto;">
                        <col style="width: 1%;">
                        <col style="width: 1%;">
                    </colgroup>
                    <thead>
                        <tr>
                            <th style="padding-left: 12px;">标题</th>
                            <th style="white-space: nowrap; padding-left: 16px; padding-right: 12px;">发布时间</th>
                            <th style="white-space: nowrap; padding-right: 12px;">字数</th>
                        </tr>
                    </thead>
                    <tbody>
                         <tr v-if="loading">
                            <td colspan="3" style="text-align:center; padding:20px; color:var(--a-text-3);">加载中...</td>
                        </tr>
                        <tr v-else-if="recentPosts.length === 0">
                            <td colspan="3" style="text-align:center; padding:20px; color:var(--a-text-3);">暂无文章</td>
                        </tr>
                        <tr v-else v-for="post in recentPosts" :key="post.id">
                            <td style="padding-left: 12px;">
                                <NuxtLink :to="`/admin/posts/edit?id=${post.id}`" style="color:var(--a-text); text-decoration:none;">
                                    {{ post.title }}
                                </NuxtLink>
                                <span v-if="post.featured" class="featured-badge" style="margin-left:6px;">精选</span>
                            </td>
                            <td style="color:var(--a-text-3); font-family:'SF Mono','Consolas',monospace; font-size:12px; white-space:nowrap; padding-left:16px; padding-right:12px;">
                                {{ formatDateTime(post.date) }}
                            </td>
                            <td style="color:var(--a-text-3); white-space:nowrap; padding-right:12px; font-size:13px;">
                                {{ formatWordCount(post.wordCount || 0) }}字
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile Cards -->
             <div class="dashboard-mobile-cards">
                 <div v-if="loading" style="text-align:center; padding:20px; color:var(--a-text-3);">加载中...</div>
                 <div v-else-if="recentPosts.length === 0" style="text-align:center; padding:20px; color:var(--a-text-3);">暂无文章</div>
                 <NuxtLink v-else v-for="post in recentPosts" :key="'mobile-'+post.id" :to="`/admin/posts/edit?id=${post.id}`" class="dashboard-post-card">
                    <div class="dashboard-post-card-title">
                        {{ post.title }}
                        <span v-if="post.featured" class="featured-badge">精选</span>
                    </div>
                    <div class="dashboard-post-card-meta">
                        <span>{{ formatDate(post.date) }}</span>
                        <span>{{ formatWordCount(post.wordCount || 0) }}字</span>
                    </div>
                 </NuxtLink>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({
  layout: 'admin'
})

const { fetchPosts, posts } = usePosts()
const loading = ref(true)

const stats = reactive({
    totalPosts: 0,
    totalWords: 0,
    totalViews: 0,
    postsThisYear: 0,
    postsThisMonth: 0,
    activeDays: 0
})

const recentPosts = computed(() => {
    // Sort by date desc
    const sorted = [...posts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return sorted.slice(0, 5)
})

const chartData = reactive({
    labels: [],
    datasets: []
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
        }
    }
}

// Utils
const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

const formatWordCount = (num) => {
     if (typeof num !== 'number' || isNaN(num)) return '0';
     return num.toLocaleString('zh-CN');
}

const formatDateTime = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '--';
    // Simple format YYYY-MM-DD HH:mm:ss
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

const formatDate = (dateStr) => {
     if (!dateStr) return '--';
     const date = new Date(dateStr);
     return isNaN(date.getTime()) ? '--' : date.toLocaleDateString('zh-CN');
}

onMounted(async () => {
    loading.value = true
    await fetchPosts()
    
    // Calculate stats
    calculateStats(posts.value)
    prepareChart(posts.value)

    loading.value = false
})

const calculateStats = (posts) => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    let totalWords = 0;
    let totalViews = 0;
    let postsThisYear = 0;
    let postsThisMonth = 0;
    const activeDays = new Set();

    posts.forEach(post => {
        totalWords += post.wordCount || 0;
        totalViews += post.views || 0;

        if (post.date) {
            const postDate = new Date(post.date);
            if (postDate.getFullYear() === thisYear) {
                postsThisYear++;
                if (postDate.getMonth() === thisMonth) {
                    postsThisMonth++;
                }
            }
            activeDays.add(postDate.toDateString());
        }
    });

    stats.totalPosts = posts.length
    stats.totalWords = totalWords
    stats.totalViews = totalViews
    stats.postsThisYear = postsThisYear
    stats.postsThisMonth = postsThisMonth
    stats.activeDays = activeDays.size
}

const prepareChart = (posts) => {
    const monthlyData = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = 0;
    }

    posts.forEach(post => {
        if (post.date) {
            const d = new Date(post.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData.hasOwnProperty(key)) {
                monthlyData[key]++;
            }
        }
    });

    chartData.labels = Object.keys(monthlyData).map(k => k.split('-')[1] + '月');
    chartData.datasets = [{
        label: '发文数',
        data: Object.values(monthlyData),
        borderColor: '#0066cc', // Should ideally get from CSS var
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
    }]
}
</script>

<style scoped>
/* 统计卡片 */
.db-stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:12px; }
.db-stat { display:flex; align-items:center; gap:10px; padding:14px 16px; background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:12px; }
.db-stat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.db-stat-num { font-size:20px; font-weight:700; color:var(--a-text); line-height:1; }
.db-stat-label { font-size:11px; color:var(--a-text-3); }

.dashboard-mobile-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
}

.dashboard-post-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    background: var(--a-bg-2);
    border-radius: 10px;
    border: 1px solid var(--a-border);
    text-decoration: none;
    transition: background 0.2s;
}

.dashboard-post-card:active {
    background: rgba(var(--a-primary-rgb), 0.04);
}

.dashboard-post-card-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--a-text);
    line-height: 1.4;
}

.dashboard-post-card-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--a-text-3);
}

.dashboard-desktop-table :deep(thead th) { position:sticky; top:0; background:var(--a-bg-2); z-index:2; }

.dashboard-spacer {
    height: 12px;
}

@media (max-width: 768px) {
    .db-stats-row {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
    }
    .dashboard-desktop-table {
        display: none !important;
    }
    .dashboard-mobile-cards {
        display: flex !important;
    }
}

@media (min-width: 769px) {
    .dashboard-mobile-cards {
        display: none !important;
    }
}

@media (max-width: 480px) {
    .dashboard-stats-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
    }
    .dashboard-stat-value {
        font-size: 16px !important;
    }
}
</style>
