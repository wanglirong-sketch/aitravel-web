<template>
  <div class="discover-page">
    <!-- 顶部视觉区 -->
    <div class="page-header">
      <h1 class="page-title">探索周边好去处</h1>
      <p class="page-desc">发现城市里的风景、味道与惊喜</p>
    </div>

    <!-- 分类大 Tab (景点/美食/游玩/购物) -->
    <div class="main-tabs">
      <router-link to="/discover/scenic" class="m-tab" active-class="active">
        <span class="m-tab-icon">🏞️</span> 景点
      </router-link>
      <router-link to="/discover/food" class="m-tab" active-class="active">
        <span class="m-tab-icon">🍜</span> 美食
      </router-link>
      <router-link to="/discover/play" class="m-tab" active-class="active">
        <span class="m-tab-icon">🎡</span> 游玩项目
      </router-link>
      <router-link to="/discover/shopping" class="m-tab" active-class="active">
        <span class="m-tab-icon">🛍️</span> 购物
      </router-link>
    </div>

    <!-- 原有筛选栏 (城市+搜索) -->
    <FilterBar
      v-model:city="city"
      v-model:keyword="keyword"
      @change="load"
    />

    <!-- 状态展示 -->
    <div v-if="loading" class="state-box">
      <div class="skeleton-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="sk-img"></div>
          <div class="sk-line w-70"></div>
          <div class="sk-line w-40"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="error" class="state-box alert">
      {{ error }}
    </div>
    
    <div v-else-if="!list.length" class="state-box empty">
      <div class="empty-icon">🔍</div>
      <p>没有找到相关点位</p>
      <span>换个关键词或城市试试吧</span>
    </div>

    <!-- 卡片网格 (优化了原 grid 样式) -->
    <div v-else class="poi-grid">
      <PoiCard
        v-for="p in list"
        :key="p.id || `${p.lng}_${p.lat}`"
        :poi="p"
        @select="openDetail"
      />
    </div>

    <PoiDetailModal :poi="selected" @close="closeDetail" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PoiCard from '../components/PoiCard.vue'
import FilterBar from '../components/FilterBar.vue'
import PoiDetailModal from '../components/PoiDetailModal.vue'
import { getOnlinePois } from '../api/poi'

const route = useRoute()

const city = ref('')
const keyword = ref('')
const list = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref(null)

function getRouteKey() {
  return typeof route.query.key === 'string' ? route.query.key.trim() : ''
}

keyword.value = getRouteKey()

const type = () => Number(route.meta.type)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getOnlinePois({
      city: city.value || undefined,
      type: type(),
      key: keyword.value.trim() || undefined
    })
    list.value = data || []
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function openDetail(poi) {
  selected.value = poi
}

function closeDetail() {
  selected.value = null
}

watch(
  () => route.meta.type,
  () => {
    city.value = ''
    load()
  }
)

watch(
  () => route.query.key,
  (key) => {
    keyword.value = typeof key === 'string' ? key.trim() : ''
    load()
  }
)

onMounted(load)
</script>

<style scoped>
/* 基础与变量 */
.discover-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 60px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 头部 */
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #0f766e; /* 延续松石绿 */
  margin: 0 0 6px;
}
.page-desc {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* 分类大Tab */
.main-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.m-tab {
  padding: 12px 0;
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-size: 15px;
  text-align: center;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.25s ease;
}
.m-tab-icon {
  margin-right: 4px;
}
.m-tab.active {
  background: #0d9488;
  color: #fff;
  border-color: #0d9488;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
  font-weight: 500;
}

/* 网格布局 */
.poi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 状态与骨架屏 */
.state-box {
  padding: 60px 0;
  text-align: center;
  color: #94a3b8;
}
.state-box.alert {
  color: #991b1b;
  background: #fef2f2;
  border-radius: 12px;
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.empty p {
  margin: 0 0 4px;
  font-size: 15px;
  color: #475569;
}
.empty span {
  font-size: 13px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.skeleton-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
.sk-img {
  height: 160px;
  background: #e2e8f0;
  animation: pulse 1.5s infinite;
}
.sk-line {
  height: 14px;
  margin: 12px 16px;
  background: #e2e8f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}
.w-70 { width: 70%; }
.w-40 { width: 40%; margin-bottom: 20px; }
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 响应式 */
@media (max-width: 640px) {
  .main-tabs { grid-template-columns: repeat(2, 1fr); }
  .poi-grid { grid-template-columns: 1fr; }
}
</style>