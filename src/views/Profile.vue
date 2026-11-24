<template>
  <div class="profile-page">
    <!-- 头部：旅行氛围 + 欢迎语 -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="title-wrap">
          <h1>个人中心</h1>
          <span class="sub-title">智旅网 · 智慧你的旅行</span>
        </div>
        <router-link to="/home" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          返回首页
        </router-link>
      </div>
      <!-- 欢迎语 -->
      <div class="welcome-bar">
        <span class="hello">👋 你好，{{ form?.nickname || '旅行者' }}</span>
        <span class="date">{{ today }}</span>
      </div>
    </div>

    <!-- 加载态 -->
    <div v-if="loading" class="empty-state">
      <div class="loader"></div>
      <span>加载中…</span>
    </div>

    <template v-else>
      <!-- ===== 头像 + 数据统计卡片 ===== -->
      <div class="card avatar-card">
        <div class="avatar-wrap">
          <img v-if="form?.avatar" :src="form.avatar" alt="头像" class="avatar" />
          <div v-else class="avatar avatar-placeholder">{{ avatarText }}</div>
          <div class="avatar-ring"></div>
          <!-- 在线状态小圆点 -->
          <span class="online-dot"></span>
        </div>

        <div class="avatar-info">
          <div class="name-row">
            <span class="nickname">{{ form?.nickname || '未设置昵称' }}</span>
            <span class="role-tag" :class="form?.role === 'ADMIN' ? 'admin' : 'user'">
              {{ form?.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </span>
          </div>

          <div class="info-list">
            <div class="info-row">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span class="value">{{ form?.phone || '未绑定' }}</span>
            </div>
            <div class="info-row">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span class="value">ID: {{ form?.id || '—' }}</span>
            </div>
          </div>
        </div>

          <!-- 数据统计 -->
          <div class="stats">
            <div class="stat-item">
              <span class="stat-num">{{ stats.scenic }}</span>
              <span class="stat-label">收藏景点</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.food }}</span>
              <span class="stat-label">收藏美食</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.total }}</span>
              <span class="stat-label">全部收藏</span>
            </div>
          </div>
          </div>



      <!-- ===== 账户概览卡片 ===== -->
      <div class="card overview-card">
        <div class="overview-item">
          <div class="overview-left">
            <span class="overview-icon">🛡️</span>
            <div>
              <span class="overview-title">账户安全</span>
              <span class="overview-desc">密码强度：高</span>
            </div>
          </div>
          <div class="security-bar"><span class="fill high"></span></div>
        </div>
        <div class="overview-item">
          <div class="overview-left">
            <span class="overview-icon">🕐</span>
            <div>
              <span class="overview-title">最近登录</span>
              <span class="overview-desc">2026-11-23 10:32 · 广州</span>
            </div>
          </div>
        </div>
      </div>
      <!-- ===== 我的收藏 ===== -->
      <div class="card fav-card">
        <div class="section-head">
          <div>
            <h2>我的收藏</h2>
            <p>你收藏的景点、美食和游玩项目会展示在这里</p>
          </div>
          <span class="fav-count">{{ favorites.length }} 条</span>
        </div>

        <div v-if="favLoading" class="fav-empty">收藏加载中…</div>

        <div v-else-if="!favorites.length" class="fav-empty">
          还没有收藏，去发现页点爱心收藏喜欢的地点吧
        </div>

        <div v-else class="fav-grid">
          <div v-for="item in favorites" :key="item.id || item.poiKey" class="fav-item">
            <div class="fav-cover">
              <img v-if="item.cover" :src="item.cover" :alt="item.name" @error="onImgError" />
              <span v-else class="fav-placeholder">{{ favIcon(item.type) }}</span>
            </div>

            <div class="fav-body">
              <strong>{{ item.name }}</strong>
              <p>{{ item.tags || item.intro || '暂无简介' }}</p>
              <span class="fav-type">{{ favTypeName(item.type) }}</span>
            </div>

            <button type="button" class="fav-remove" @click="removeFavorite(item)">
              取消收藏
            </button>
          </div>
        </div>
      </div>


      <!-- ===== 修改资料 ===== -->
      <div class="card section-card">
        <button class="section-toggle" @click="showProfile = !showProfile">
          <span class="toggle-left">
            <span class="toggle-icon-wrap edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </span>
            <span class="toggle-text">
              <span class="toggle-title">修改资料</span>
              <span class="toggle-desc">更新昵称、头像等个人信息</span>
            </span>
          </span>
          <span class="toggle-sign">{{ showProfile ? '收起' : '展开' }}</span>
        </button>

        <div v-if="showProfile" class="section-body">
          <label class="field">
            <span>昵称</span>
            <input v-model.trim="form.nickname" placeholder="请输入昵称" />
          </label>

          <!-- <label class="field">
            <span>头像链接</span>
            <input v-model.trim="form.avatar" placeholder="粘贴头像图片链接" />
          </label> -->

          <div class="avatar-pick">
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="avatar-input"
              @change="onAvatarChange"
            />
            <button type="button" class="btn-ghost" @click="avatarInput.click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              选择本地头像
            </button>
          </div>

          <div class="actions">
            <button class="btn-primary" :disabled="savingProfile" @click="saveProfile">
              <svg v-if="savingProfile" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/></svg>
              <span>{{ savingProfile ? '保存中…' : '保存资料' }}</span>
            </button>
          </div>

          <div v-if="profileMessage" class="message success">{{ profileMessage }}</div>
        </div>
      </div>

      <!-- ===== 修改密码 ===== -->
      <div class="card section-card">
        <button class="section-toggle" @click="showPassword = !showPassword">
          <span class="toggle-left">
            <span class="toggle-icon-wrap lock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span class="toggle-text">
              <span class="toggle-title">修改密码</span>
              <span class="toggle-desc">定期更换密码以保障账户安全</span>
            </span>
          </span>
          <span class="toggle-sign">{{ showPassword ? '收起' : '展开' }}</span>
        </button>

        <div v-if="showPassword" class="section-body">
          <label class="field">
            <span>当前密码</span>
            <input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" />
          </label>

          <label class="field">
            <span>新密码</span>
            <input v-model="passwordForm.newPassword" type="password" placeholder="至少 6 位" />
          </label>

          <label class="field">
            <span>确认新密码</span>
            <input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" />
          </label>

          <div class="actions">
            <button class="btn-primary" :disabled="changingPassword" @click="onChangePassword">
              <svg v-if="changingPassword" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/></svg>
              <span>{{ changingPassword ? '提交中…' : '更新密码' }}</span>
            </button>
          </div>

          <div v-if="passwordMessage" class="message success">{{ passwordMessage }}</div>
          <div v-if="passwordError" class="message error">{{ passwordError }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getProfile, updateProfile, changePassword } from '../api/user'
import { getFavorites, deleteFavorite, deleteFavoriteByKey } from '../api/favorite'
import { getPoiKey } from '../api/poi'


const userStore = useUserStore()

const loading = ref(true)
const savingProfile = ref(false)
const changingPassword = ref(false)
const showProfile = ref(false)
const showPassword = ref(false)

const profileMessage = ref('')
const passwordMessage = ref('')
const passwordError = ref('')

const form = reactive({
  id: '',
  nickname: '',
  avatar: '',
  phone: '',
  role: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})


const favorites = ref([])
const favLoading = ref(false)

const stats = computed(() => ({
  total: favorites.value.length,
  scenic: favorites.value.filter((item) => Number(item.type) === 1).length,
  food: favorites.value.filter((item) => Number(item.type) === 2).length
}))


const avatarInput = ref(null)

// 今日日期
const today = computed(() => {
  const d = new Date()
  const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }
  return d.toLocaleDateString('zh-CN', opts)
})

const avatarText = computed(() => {
  const name = form?.nickname || userStore?.nickname || '游'
  return name.slice(0, 1)
})
async function loadFavorites() {
  favLoading.value = true
  try {
    favorites.value = (await getFavorites()) || []
  } catch (e) {
    console.error('加载收藏失败', e)
    favorites.value = []
  } finally {
    favLoading.value = false
  }
}

function favTypeName(type) {
  const map = { 1: '景点', 2: '美食', 3: '项目', 4: '购物' }
  return map[Number(type)] || '点位'
}

function favIcon(type) {
  const map = { 1: '🏞', 2: '🍜', 3: '🎢', 4: '🛍' }
  return map[Number(type)] || '📍'
}

async function removeFavorite(item) {
  try {
    if (item.id) {
      await deleteFavorite(item.id)
    } else {
      await deleteFavoriteByKey({ poiKey: getPoiKey(item) })
    }
    favorites.value = favorites.value.filter(
      (f) => f.id !== item.id && f.poiKey !== item.poiKey
    )
  } catch (e) {
    console.error('取消收藏失败', e)
    passwordError.value = e.message || '取消收藏失败'
  }
}

function onImgError(e) {
  e.target.style.display = 'none'
}


async function loadProfile() {
  loading.value = true
  try {
    const data = await getProfile() || {}
    form.id = data.id ?? userStore.userId ?? ''
    form.nickname = data.nickname ?? userStore.nickname ?? ''
    form.avatar = data.avatar ?? ''
    form.phone = data.phone ?? data.mobile ?? userStore.phone ?? ''
    form.role = data.role ?? userStore.role ?? ''
  } catch (e) {
    console.error('加载个人信息失败', e)
    passwordError.value = e.message || '加载个人信息失败'
    form.id = userStore.userId || ''
    form.nickname = userStore.nickname || ''
    form.avatar = ''
    form.phone = userStore.phone || ''
    form.role = userStore.role || ''
  } finally {
    loading.value = false
  }
}

function onAvatarChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (file.size > 200 * 1024) {
    passwordError.value = '头像图片不能超过 200KB，请换小图或使用图片链接'
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => { form.avatar = ev.target.result }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  savingProfile.value = true
  profileMessage.value = ''
  passwordError.value = ''
  try {
    const data = await updateProfile({ nickname: form.nickname, avatar: form.avatar })
    const profile = data || {}
    const nextNickname = profile.nickname ?? form.nickname
    const nextAvatar = profile.avatar ?? form.avatar
    const nextPhone = profile.phone ?? form.phone
    const nextRole = profile.role ?? form.role
    userStore.updateProfile({ nickname: nextNickname, avatar: nextAvatar, phone: nextPhone, role: nextRole })
    form.nickname = nextNickname
    form.avatar = nextAvatar
    form.phone = nextPhone
    form.role = nextRole
    profileMessage.value = '资料已保存'
  } catch (e) {
    passwordError.value = e.message || '保存资料失败'
  } finally {
    savingProfile.value = false
  }
}

async function onChangePassword() {
  passwordMessage.value = ''
  passwordError.value = ''
  if (!passwordForm.oldPassword) { passwordError.value = '请输入当前密码'; return }
  if (passwordForm.newPassword.length < 6) { passwordError.value = '新密码至少 6 位'; return }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) { passwordError.value = '两次输入的新密码不一致'; return }
  changingPassword.value = true
  try {
    await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
    passwordMessage.value = '密码已更新'
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    passwordError.value = e.message || '密码更新失败'
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadProfile()
  loadFavorites()
})

</script>

<style scoped>
/* ===== 全局 ===== */
.profile-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* ===== 头部 ===== */
.page-header {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0d9488 60%, #14b8a6 100%);
  box-shadow: 0 8px 30px rgba(13, 148, 136, 0.25);
}
.header-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.06) 0%, transparent 35%);
}
.header-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px 20px;
}
.title-wrap { display: flex; flex-direction: column; gap: 4px; }
.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}
.sub-title { font-size: 13px; color: rgba(255,255,255,0.75); }
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  text-decoration: none;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}
.back-btn:hover { background: rgba(255,255,255,0.28); }
.back-btn .icon { width: 15px; height: 15px; }

/* 欢迎语 */
.welcome-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px 22px;
}
.welcome-bar .hello { font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500; }
.welcome-bar .date { font-size: 12px; color: rgba(255,255,255,0.6); }

/* ===== 卡片通用 ===== */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-bottom: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

/* ===== 头像卡片 ===== */
.avatar-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 28px;
  position: relative;
  overflow: hidden;
}
.avatar-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%);
}
.avatar-wrap { position: relative; }
.avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 3px solid #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.avatar-placeholder {
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0d9488, #5eead4);
  color: #fff; font-size: 28px; font-weight: 600;
}
.avatar-ring {
  position: absolute; inset: -5px;
  border-radius: 50%;
  border: 2px solid #5eead4;
  opacity: 0.4; z-index: 1;
}
.online-dot {
  position: absolute; bottom: 4px; right: 4px;
  width: 14px; height: 14px;
  background: #22c55e;
  border: 2.5px solid #fff;
  border-radius: 50%;
  z-index: 3;
}

.avatar-info { display: flex; flex-direction: column; gap: 8px; }
.name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.nickname { font-size: 20px; font-weight: 700; color: #1e293b; }
.role-tag {
  display: inline-flex; padding: 3px 10px;
  border-radius: 20px; font-size: 11px; font-weight: 600;
}
.role-tag.admin { background: #ecfdf5; color: #0d9488; border: 1px solid #a7f3d0; }
.role-tag.user { background: #f3f4f6; color: #6b7280; }

.info-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.info-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }
.info-icon { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.info-row .value { color: #475569; font-weight: 500; }

/* 数据统计 */
.stats { display: flex; align-items: center; gap: 16px; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num { font-size: 20px; font-weight: 700; color: #0f172a; }
.stat-label { font-size: 11px; color: #94a3b8; }
.stat-divider { width: 1px; height: 32px; background: #e2e8f0; }

/* ===== 账户概览 ===== */
.overview-card { display: flex; flex-direction: column; gap: 16px; }
.overview-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}
.overview-item:last-child { border-bottom: none; padding-bottom: 0; }
.overview-left { display: flex; align-items: center; gap: 12px; }
.overview-icon { font-size: 22px; }
.overview-title { display: block; font-size: 14px; font-weight: 600; color: #334155; }
.overview-desc { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }
.security-bar {
  width: 80px; height: 6px;
  background: #e2e8f0; border-radius: 3px; overflow: hidden;
}
.security-bar .fill { display: block; height: 100%; border-radius: 3px; }
.security-bar .fill.high { width: 85%; background: linear-gradient(90deg, #22c55e, #4ade80); }

/* ===== 折叠面板 ===== */
.section-card {
  cursor: default;
}
.section-toggle {
  width: 100%; border: none; background: transparent;
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; padding: 4px 0;
}
.toggle-left { display: flex; align-items: center; gap: 14px; }
.toggle-icon-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 42px; height: 42px;
  border-radius: 12px;
  flex-shrink: 0;
}
.toggle-icon-wrap svg { width: 20px; height: 20px; }
.toggle-icon-wrap.edit { background: #eff6ff; color: #2563eb; }
.toggle-icon-wrap.lock { background: #fef3c7; color: #d97706; }
.toggle-text { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.toggle-title { font-size: 16px; font-weight: 600; color: #1e293b; }
.toggle-desc { font-size: 12px; color: #94a3b8; }
.toggle-sign {
  font-size: 13px; color: #64748b;
  padding: 4px 12px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}
.section-toggle:hover .toggle-sign { background: #0d9488; color: #fff; border-color: #0d9488; }

.section-body { margin-top: 22px; padding-top: 20px; border-top: 1px dashed #e2e8f0; }

/* ===== 表单 ===== */
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field span { font-size: 13px; color: #475569; font-weight: 500; }
.field input {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s;
  background: #f8fafc;
}
.field input:focus {
  border-color: #0d9488;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(13,148,136,0.1);
}

.avatar-pick { margin-bottom: 20px; }
.avatar-input { display: none; }

.actions { display: flex; gap: 12px; }
.btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 28px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3);
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,148,136,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

.btn-ghost {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-icon { width: 16px; height: 16px; }

/* 加载动画 */
.spinner {
  width: 16px; height: 16px;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 消息 ===== */
.message { margin-top: 16px; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
.success { color: #065f46; background: #ecfdf5; border: 1px solid #a7f3d0; }
.error { color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; }

/* ===== 加载态 ===== */
.empty-state {
  padding: 80px 0;
  text-align: center;
  color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.loader {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
/* ===== 我的收藏 ===== */
.fav-card {
  margin-bottom: 16px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-head h2 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #1e293b;
}

.section-head p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.fav-count {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #0d9488;
  font-size: 12px;
  font-weight: 600;
}

.fav-empty {
  padding: 36px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  background: #f8fafc;
  border-radius: 12px;
}

.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.fav-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.fav-cover {
  width: 88px;
  height: 88px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
}

.fav-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fav-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 30px;
}

.fav-body {
  flex: 1;
  min-width: 0;
}

.fav-body strong {
  display: block;
  margin-bottom: 6px;
  color: #1e293b;
  font-size: 15px;
}

.fav-body p {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.fav-type {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
}

.fav-remove {
  align-self: flex-start;
  border: 1px solid #fecaca;
  background: #fff;
  color: #ef4444;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

</style>