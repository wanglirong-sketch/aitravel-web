<template>
  <div class="itineraries">
    <div class="page-head">
      <div>
        <h1>我的行程</h1>
        <p class="sub">查看已保存的旅行规划，继续编辑或删除不需要的行程</p>
      </div>
      <router-link to="/plan" class="btn-primary">新建规划</router-link>
    </div>

    <div v-if="loading" class="empty">加载中…</div>
    <div v-else-if="error" class="empty alert">{{ error }}</div>
    <div v-else-if="!list.length" class="empty">
      还没有保存行程，先去智能规划生成一份吧
    </div>

    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="itinerary-card">
        <!-- 仅当有有效天数时展示左侧卡片 -->
        <div v-if="getDays(item) > 0" class="card-aside">
          <div class="aside-days">
            <span class="num">{{ getDays(item) }}</span>
            <span class="unit">天</span>
          </div>
        </div>

        <div class="card-main">
          <div class="card-top">
            <h2>{{ item.title || '未命名行程' }}</h2>
            <div class="meta">
              <span v-if="item.city" class="pill city">{{ item.city }}</span>
              <span v-if="item.totalCost" class="pill cost">人均 ¥{{ item.totalCost }}</span>
            </div>
          </div>

          <p class="summary" :class="{ placeholder: !item.summary }">
            {{ item.summary || '暂无行程摘要，点击查看详情' }}
          </p>

          <div class="card-footer">
            <div class="time">
              🕒 更新于 {{ formatTime(item.updateTime || item.createTime) }}
            </div>
            <div class="actions">
              <router-link :to="`/itinerary/${item.id}`" class="btn-detail">
                查看详情
              </router-link>
              <button
                class="btn-delete"
                :disabled="deletingId === item.id"
                @click="onDelete(item)"
              >
                {{ deletingId === item.id ? '删除中…' : '删除' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listItineraries, deleteItinerary } from '../api/itinerary'

const list = ref([])
const loading = ref(false)
const error = ref('')
const deletingId = ref(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await listItineraries()
    list.value = (data || []).map(item => ({
      ...item,
      // 前端兜底：确保有 daysLength（若后端没传）
      daysLength: item.daysLength ?? (Array.isArray(item.days) ? item.days.length : 0)
    }))
  } catch (e) {
    error.value = e.message || '加载行程失败'
  } finally {
    loading.value = false
  }
}

function getDays(item) {
  // 优先用兜底算好的，其次详情的 days 长度
  return item.daysLength || (Array.isArray(item.days) ? item.days.length : 0)
}

async function onDelete(item) {
  if (!window.confirm(`确定删除「${item.title || '未命名行程'}」吗？`)) return
  deletingId.value = item.id
  try {
    await deleteItinerary(item.id)
    list.value = list.value.filter(x => x.id !== item.id)
  } catch (e) {
    error.value = e.message || '删除失败'
  } finally {
    deletingId.value = null
  }
}

function formatTime(time) {
  if (!time) return '—'
  return String(time).replace('T', ' ').slice(0, 16)
}

onMounted(load)
</script>

<style scoped>
.itineraries {
  max-width: 860px;
  margin: 0 auto;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.page-head h1 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
}
.sub {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}
.btn-primary {
  padding: 10px 20px;
  border-radius: 12px;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.itinerary-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
  transition: 0.2s;
}
.itinerary-card:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.card-aside {
  width: 72px;
  flex-shrink: 0;
  text-align: center;
  padding-top: 4px;
}
.aside-days {
  background: rgba(37, 99, 235, 0.08);
  border-radius: 12px;
  padding: 12px 0;
  color: #2563eb;
}
.aside-days .num {
  font-size: 28px;
  font-weight: 700;
  display: block;
  line-height: 1;
}
.aside-days .unit {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
  display: block;
}

.card-main {
  flex: 1;
  min-width: 0;
}
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.card-top h2 {
  margin: 0;
  font-size: 19px;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.4;
}
.meta {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
}
.pill.city {
  background: #f1f5f9;
  color: #64748b;
}
.pill.cost {
  background: #fff7ed;
  color: #d97706;
}

.summary {
  margin: 12px 0 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}
.summary.placeholder {
  color: #94a3b8;
  font-style: italic;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed #e2e8f0;
  padding-top: 14px;
}
.time {
  color: #94a3b8;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.btn-detail {
  padding: 8px 16px;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}
.btn-delete {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 13px;
  padding: 8px;
}
.btn-delete:disabled {
  color: #fca5a5;
  cursor: not-allowed;
}

.empty {
  padding: 60px 0;
  text-align: center;
  color: #94a3b8;
}
.empty.alert {
  background: #fef2f2;
  color: #991b1b;
  border-radius: 12px;
  margin: 20px 0;
}

@media (max-width: 640px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .itinerary-card {
    flex-direction: column;
    gap: 12px;
  }
  .card-aside {
    width: auto;
    display: inline-flex;
    gap: 4px;
    align-items: baseline;
  }
  .aside-days {
    padding: 6px 12px;
    display: inline-flex;
    border-radius: 999px;
  }
  .aside-days .num,
  .aside-days .unit {
    display: inline;
    font-size: 14px;
  }
}
</style>