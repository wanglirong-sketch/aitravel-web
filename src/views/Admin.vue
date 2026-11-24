<template>
  <div class="admin-page">
    <div class="admin-hero">
      <div class="hero-text">
        <h1>后台管理</h1>
        <p>查看平台用户，搜索昵称或手机号，删除无效账号，管理首页轮播内容。</p>
      </div>
      <router-link to="/home" class="hero-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        返回首页
      </router-link>
    </div>

    <!-- 用户管理区块 -->
    <section class="admin-section user-section">
      <div class="section-head">
        <div>
          <h2>用户管理</h2>
          <p>查看平台用户，搜索昵称或手机号，删除无效账号</p>
        </div>
        <span class="section-count">{{ list.length }} 位用户</span>
      </div>

      <div class="panel-card">
        <div class="search-row">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              v-model.trim="keyword"
              placeholder="搜索手机号或昵称"
              @keyup.enter="load"
            />
          </div>
          <button class="btn-primary" @click="load">搜索</button>
          <button class="btn-ghost" @click="resetSearch">重置</button>
        </div>

        <div v-if="loading" class="empty">
          <div class="loader"></div>
          <span>加载中…</span>
        </div>
        <div v-else-if="error" class="empty error-text">{{ error }}</div>
        <div v-else-if="!list.length" class="empty">暂无用户数据</div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>手机号</th>
                <th>昵称</th>
                <th>角色</th>
                <th>状态</th>
                <th>注册时间</th>
                <th class="op-col">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td class="cell-id">#{{ item.id }}</td>
                <td>{{ item.phone || '—' }}</td>
                <td>
                  <div class="user-cell">
                    <span class="user-avatar">{{ avatarText(item.nickname) }}</span>
                    <span>{{ item.nickname || '未设置昵称' }}</span>
                  </div>
                </td>
                <td>
                  <span class="role-pill" :class="item.role === 'ADMIN' ? 'admin' : 'user'">
                    {{ item.role === 'ADMIN' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td>
                  <span class="status-pill" :class="item.status === 1 ? 'normal' : 'disabled'">
                    <i></i>{{ item.status === 1 ? '正常' : '禁用' }}
                  </span>
                </td>
                <td class="time-text">{{ formatTime(item.createTime) }}</td>
                <td class="op-col">
                  <button
                    class="btn-delete"
                    :disabled="deletingId === item.id || item.role === 'ADMIN'"
                    @click="onDelete(item)"
                  >
                    {{ deletingId === item.id ? '删除中…' : '删除' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 首页轮播图管理区块 -->
    <section class="admin-section">
      <BannerAdminPanel />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listAdminUsers, deleteAdminUser } from '../api/admin'
import BannerAdminPanel from './BannerAdminPanel.vue'

const list = ref([])
const keyword = ref('')
const loading = ref(false)
const error = ref('')
const deletingId = ref(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await listAdminUsers(keyword.value)
    list.value = data || []
  } catch (e) {
    error.value = e.message || '加载用户列表失败'
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  keyword.value = ''
  load()
}

async function onDelete(item) {
  if (item.role === 'ADMIN') return
  if (!window.confirm(`确定删除用户「${item.nickname || item.phone}」吗？`)) return

  deletingId.value = item.id
  try {
    await deleteAdminUser(item.id)
    list.value = list.value.filter((x) => x.id !== item.id)
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

function avatarText(name) {
  return (name || '游').slice(0, 1)
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  background: linear-gradient(180deg, #f5f7fb 0%, #f8fafc 100%);
  min-height: 100vh;
}

.admin-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 30px;
  border-radius: 22px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 48%, #60a5fa 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.22);
  margin-bottom: 24px;
}

.hero-text h1 {
  margin: 0 0 8px;
  font-size: 28px;
  letter-spacing: 0.5px;
}

.hero-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.hero-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
}

.hero-back svg {
  width: 16px;
  height: 16px;
}

.admin-section {
  margin-bottom: 24px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-head h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1f2937;
}

.section-head p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.section-count {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.panel-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  border: 1px solid #edf2f7;
}

.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
}

.search-box svg {
  width: 18px;
  height: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  height: 44px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #1f2937;
}

.search-box input:focus {
  border-color: #2563eb;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid #eef2f7;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  padding: 15px 18px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;
}

th {
  color: #64748b;
  font-weight: 600;
  background: #f8fafc;
  white-space: nowrap;
}

td {
  color: #1f2937;
}

tbody tr {
  transition: background 0.2s;
}

tbody tr:hover {
  background: #f8fbff;
}

tbody tr:last-child td {
  border-bottom: none;
}

.cell-id {
  color: #64748b;
  font-weight: 600;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
  font-weight: 600;
  flex-shrink: 0;
}

.role-pill {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.role-pill.admin {
  background: #eff6ff;
  color: #2563eb;
}

.role-pill.user {
  background: #f3f4f6;
  color: #6b7280;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 13px;
}

.status-pill i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}

.status-pill.disabled i {
  background: #94a3b8;
}

.time-text {
  color: #64748b;
  white-space: nowrap;
}

.op-col {
  text-align: right;
}

.btn-primary {
  height: 44px;
  padding: 0 22px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.22);
}

.btn-ghost {
  height: 44px;
  padding: 0 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  color: #4b5563;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-delete {
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 8px;
}

.btn-delete:hover:not(:disabled) {
  background: #fef2f2;
}

.btn-delete:disabled {
  color: #fca5a5;
  cursor: not-allowed;
}

.empty {
  padding: 60px 0;
  text-align: center;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-text {
  color: #ef4444;
}

.loader {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .admin-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-row {
    flex-wrap: wrap;
  }

  .search-box {
    min-width: 100%;
  }
}
</style>
