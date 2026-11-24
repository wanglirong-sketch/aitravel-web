<template>
  <div class="plan-page">
    <!-- 顶部输入区 -->
    <div class="hero">
      <h1>说说你的想法，帮你定制行程</h1>
      <p class="sub">例如：广州两天，想看日落顺便吃早茶</p>

      <div class="search-card">
        <div class="input-wrapper">
          <span class="input-icon">📍</span>
          <input
            v-model.trim="query"
            type="text"
            placeholder="想去哪、玩几天、有什么偏好…"
            @keyup.enter="start"
          />
        </div>
        <button v-if="!streaming" class="btn-primary embedded" @click="start">
          生成行程
        </button>
        <button v-else class="btn-stop embedded" @click="stop">
          停止生成
        </button>
      </div>

      <!-- 快捷标签 -->
      <div class="quick-tags">
        <span @click="applyQuick('广州两天，吃早茶看日落')">☕ 广州早茶</span>
        <span @click="applyQuick('厦门三天，海边漫步')">🌊 厦门海岸</span>
        <span @click="applyQuick('成都周末，火锅与熊猫')">🐼 成都美食</span>
        <span @click="applyQuick('大理四天，洱海骑行')">🚲 大理洱海</span>
      </div>
    </div>

    <!-- 候选点位 -->
    <div v-if="candidates.length" class="candidates">
      <span class="label">已检索到候选：</span>
      <span v-for="n in candidates" :key="n" class="pill">{{ n }}</span>
    </div>

    <!-- 生成中状态 (骨架屏) -->
    <div v-if="streaming" class="stream-skeleton">
      <div class="skeleton-head"></div>
      <div class="skeleton-line w-90"></div>
      <div class="skeleton-line w-70"></div>
      <div class="skeleton-day">
        <div class="skeleton-time"></div>
        <div class="skeleton-text"></div>
      </div>
      <div class="skeleton-day">
        <div class="skeleton-time"></div>
        <div class="skeleton-text"></div>
      </div>
      <span class="streaming-text">正在为你安排行程<span class="dots">…</span></span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="empty alert">{{ error }}</div>

    <!-- 生成完成的行程卡片 -->
    <div v-if="plan" class="plan-card">
      <div class="plan-head">
        <div>
          <h2>{{ plan.title || '我的行程' }}</h2>
          <div class="meta">
            <span class="pill">{{ plan.city || '-' }}</span>
            <span class="pill">{{ plan.days?.length || 0 }} 天</span>
            <span class="pill cost">人均 ¥{{ plan.totalCost || 0 }}</span>
          </div>
        </div>
      </div>

      <p class="summary">{{ plan.summary || '暂无行程描述' }}</p>

      <div v-for="day in (plan.days || [])" :key="day.day" class="day">
        <h3>第 {{ day.day }} 天</h3>
        <div v-for="(item, idx) in (day.items || [])" :key="idx" class="item">
          <span class="time">{{ item.time || '' }}</span>
          <div class="item-content">
            <span class="item-name">{{ item.name || '未命名' }}</span>
            <span class="item-cost">¥{{ item.cost || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? '保存中…' : '保存到我的行程' }}
        </button>
        <button v-if="!streaming" class="btn-ghost" @click="start">
          重新生成
        </button>
        <button v-else class="btn-ghost" @click="stop">
          停止生成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { planStreamUrl } from '../api/stream'
import { createItinerary } from '../api/itinerary'

const router = useRouter()

const query = ref('')
const streaming = ref(false)
const candidates = ref([])
const plan = ref(null)
const error = ref('')
const saving = ref(false)

let es = null

function applyQuick(text) {
  query.value = text
  start()
}

function start() {
  const q = query.value
  if (!q) {
    error.value = '先填一句想去哪玩'
    return
  }

  closeStream()
  candidates.value = []
  plan.value = null
  error.value = ''

  query.value = ''
  streaming.value = true

  es = new EventSource(planStreamUrl(q))

  es.addEventListener('start', () => {
    // 开始生成
  })

  es.addEventListener('retrieving', (e) => {
    try {
      const data = JSON.parse(e.data)
      const names = (data && data.names) || []
      candidates.value = [...new Set(names)]
    } catch {
      // ignore parse error
    }
  })

  es.addEventListener('token', () => {
    // 模型在输出内容，保持生成中状态
  })

  es.addEventListener('done', (e) => {
    try {
      const data = JSON.parse(e.data)
      // ✅ 完整兜底，防止任何字段缺失导致渲染崩溃
      plan.value = {
        title: data.title || '定制行程',
        city: data.city || '',
        summary: data.summary || '',
        totalCost: data.totalCost || 0,
        days: Array.isArray(data.days)
          ? data.days.map(d => ({
              day: d.day || 0,
              items: Array.isArray(d.items)
                ? d.items.map(i => ({
                    time: i.time || '',
                    name: i.name || '未命名',
                    cost: i.cost || 0
                  }))
                : []
            }))
          : []
      }
    } catch (err) {
      error.value = '行程解析失败：' + err.message
    }
    closeStream()
  })

  es.addEventListener('error', (e) => {
    try {
      const data = JSON.parse(e.data)
      const msg = (data && data.message) || '生成失败，请重试'
      error.value = msg.length > 60 ? msg.slice(0, 60) + '…' : msg
    } catch {
      error.value = '生成失败，请重试'
    }
    closeStream()
  })

  es.onerror = () => {
    if (streaming.value) {
      error.value = '连接中断，请检查后端服务后重试'
      closeStream()
    }
  }
}

function closeStream() {
  streaming.value = false
  if (es) {
    es.close()
    es = null
  }
}

function stop() {
  error.value = ''
  closeStream()
}

async function save() {
  if (!plan.value) return
  saving.value = true
  try {
    const id = await createItinerary(plan.value)
    router.push('/itinerary/' + id)
  } catch (e) {
    error.value = e.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onUnmounted(closeStream)
</script>

<style scoped>
:root {
  --primary: #0d9488;
  --primary-light: #14b8a6;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text-main: #1e293b;
  --text-sub: #64748b;
  --border: #e2e8f0;
  --radius-card: 20px;
}

.plan-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

/* Hero & 输入区 */
.hero {
  text-align: center;
  padding: 50px 0 32px;
}
.hero h1 {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.5px;
  margin-bottom: 10px;
}
.sub {
  color: var(--text-sub);
  font-size: 15px;
}

.search-card {
  display: flex;
  align-items: center;
  margin-top: 28px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 8px 8px 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: all 0.3s;
}
.search-card:focus-within {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.12);
}
.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.input-icon {
  font-size: 18px;
  color: var(--primary);
}
.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: var(--text-main);
}
.btn-primary.embedded {
  padding: 12px 26px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
  transition: 0.2s;
}
.btn-primary.embedded:hover {
  transform: translateY(-1px);
}
.btn-stop.embedded {
  padding: 12px 26px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid var(--border);
  cursor: pointer;
}

/* 快捷标签 */
.quick-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}
.quick-tags span {
  padding: 6px 14px;
  background: #f1f5f9;
  color: var(--text-sub);
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}
.quick-tags span:hover {
  background: #fff;
  border-color: var(--primary);
  color: var(--primary);
}

/* 候选 */
.candidates {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 24px 0;
}
.label { font-size: 13px; color: var(--text-sub); }
.pill {
  padding: 4px 12px;
  background: #ecfdf5;
  color: var(--primary);
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid #a7f3d0;
}

/* 骨架屏 */
.stream-skeleton {
  position: relative;
  margin-top: 24px;
  padding: 28px;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
}
.skeleton-head { width: 40%; height: 22px; background: #e2e8f0; border-radius: 6px; margin-bottom: 16px; }
.skeleton-line { height: 14px; background: #f1f5f9; border-radius: 4px; margin-bottom: 10px; }
.w-90 { width: 90%; }
.w-70 { width: 70%; margin-bottom: 24px; }
.skeleton-day { display: flex; gap: 12px; margin-bottom: 16px; }
.skeleton-time { width: 50px; height: 16px; background: #f1f5f9; border-radius: 4px; }
.skeleton-text { flex: 1; height: 16px; background: #f8fafc; border-radius: 4px; }
.streaming-text {
  position: absolute;
  bottom: 16px;
  right: 24px;
  font-size: 13px;
  color: var(--primary);
}
.dots { display: inline-block; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.3; } }

/* 行程卡片 */
.plan-card {
  margin-top: 24px;
  padding: 32px;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
.plan-head h2 { font-size: 22px; color: var(--text-main); margin-bottom: 10px; }
.meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.pill.cost { background: #fff; color: #d97706; border-color: #fcd34d; }

.summary {
  color: var(--text-sub);
  font-size: 15px;
  margin: 20px 0;
  line-height: 1.8;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--border);
}

/* 时间轴 */
.day { margin-bottom: 24px; }
.day h3 {
  font-size: 15px;
  color: var(--primary);
  margin-bottom: 12px;
  font-weight: 600;
}
.item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  position: relative;
}
.item::before {
  content: '';
  position: absolute;
  left: 65px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border);
  z-index: 0;
}
.time {
  width: 52px;
  color: var(--text-sub);
  font-size: 13px;
  padding-top: 2px;
  font-weight: 500;
}
.item-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  z-index: 1;
}
.item-name { font-size: 14px; color: var(--text-main); font-weight: 500; }
.item-cost { color: #d97706; font-size: 13px; font-weight: 600; }

.actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.btn-primary {
  padding: 12px 28px;
  border-radius: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost {
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text-sub);
  cursor: pointer;
  font-size: 14px;
}

.empty.alert {
  margin-top: 20px;
  padding: 12px;
  background: #fef2f2;
  color: #991b1b;
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
}
</style>