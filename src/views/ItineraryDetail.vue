<template>
  <div class="detail">
    <div class="back-row">
      <router-link to="/itineraries" class="back-link">← 返回我的行程</router-link>
    </div>

    <div v-if="loading" class="empty">加载中…</div>
    <div v-else-if="error" class="empty">{{ error }}</div>

    <template v-else-if="plan">
      <div class="plan-head card">
        <div>
          <h1>{{ plan.title || '未命名行程' }}</h1>
          <div class="meta">
            <span v-if="plan.city" class="pill">{{ plan.city }}</span>
            <span v-if="plan.days" class="pill">{{ plan.days.length }} 天</span>
            <span v-if="plan.totalCost" class="pill">人均 ¥{{ plan.totalCost }}</span>
          </div>
          <p v-if="plan.summary" class="summary">{{ plan.summary }}</p>
        </div>

        <div class="head-actions">
          <button class="btn-ghost" @click="load">刷新</button>
        </div>
      </div>

      <div v-for="day in plan.days || []" :key="day.day" class="day card">
        <h2 class="day-title">第 {{ day.day }} 天</h2>

        <div v-if="!day.items || !day.items.length" class="empty small">
          当天暂无安排
        </div>

        <div v-else class="timeline">
          <div v-for="(item, idx) in day.items" :key="idx" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="item-top">
                <span class="time">{{ item.time || '时间待定' }}</span>
                <span v-if="item.cost" class="cost">¥{{ item.cost }}</span>
              </div>
              <div class="item-name">{{ item.name }}</div>
              <div v-if="item.tips || item.description" class="item-desc">
                {{ item.tips || item.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getItinerary } from '../api/itinerary'

const route = useRoute()

const plan = ref(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getItinerary(route.params.id)
    plan.value = data || null
  } catch (e) {
    error.value = e.message || '加载行程详情失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.detail {
  max-width: 860px;
  margin: 0 auto;
}

.back-row {
  margin-bottom: 16px;
}

.back-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plan-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.plan-head h1 {
  margin: 0 0 12px;
  font-size: 24px;
  color: #1f2937;
}

.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
}

.summary {
  margin: 14px 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.head-actions {
  white-space: nowrap;
}

.day {
  margin-bottom: 16px;
}

.day-title {
  margin: 0 0 16px;
  font-size: 16px;
  color: #2563eb;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  padding: 0 0 18px 16px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -19px;
  top: 6px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid #dbeafe;
}

.item-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.time {
  color: #6b7280;
  font-size: 13px;
}

.cost {
  color: #2563eb;
  font-size: 13px;
}

.item-name {
  margin-top: 4px;
  font-size: 15px;
  color: #1f2937;
}

.item-desc {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.btn-ghost {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  cursor: pointer;
}

.empty {
  padding: 60px 0;
  text-align: center;
  color: #9ca3af;
}

.empty.small {
  padding: 20px 0;
}
</style>
