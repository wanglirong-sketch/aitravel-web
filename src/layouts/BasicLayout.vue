<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <div class="header-left">
          <div class="logo">智游</div>
          <span class="divider"></span>

          <nav class="nav">
            <router-link to="/home" class="nav-link">首页</router-link>
            <router-link to="/plan" class="nav-link">智能规划</router-link>
            <router-link to="/discover/scenic" class="nav-link">发现</router-link>
            <router-link to="/itineraries" class="nav-link">我的行程</router-link>
          </nav>
        </div>

       <div v-if="userStore.isLogin" ref="profileRef" class="profile" @click="open = !open">
          <img
            v-if="userStore.avatar"
            :src="userStore.avatar"
            alt="头像"
            class="avatar-img"
            @error="onAvatarError"
          />
          <span v-else class="avatar">{{ avatarText }}</span>

          <span class="nickname">{{ nickname }}</span>
          <span class="arrow">▾</span>

          <div v-if="open" class="menu" @click.stop>
            <router-link to="/profile" class="menu-item" @click="open = false">
              个人中心
            </router-link>

            <router-link
              v-if="userStore.isAdmin"
              to="/admin"
              class="menu-item"
              @click="open = false"
            >
              管理后台
            </router-link>

            <button class="menu-item logout" @click="onLogout">退出登录</button>
          </div>
        </div>




        <div v-else class="auth-actions">
          <router-link to="/login" class="login-link">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </div>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getProfile } from '../api/user'

const router = useRouter()
const userStore = useUserStore()
const open = ref(false)
const profileRef = ref(null)

const nickname = computed(() => userStore.nickname || '游客')
const avatarText = computed(() => (nickname.value || '游').slice(0, 1))

// 登录后从后端拉取最新用户信息，同步头像、昵称、角色
async function syncProfile() {
  if (!userStore.isLogin) return

  try {
    const data = await getProfile()
    if (data) {
      userStore.updateProfile({
        nickname: data.nickname,
        avatar: data.avatar,
        phone: data.phone,
        role: data.role
      })
    }
  } catch (e) {
    // 拉取失败不影响页面正常使用
  }
}

function onAvatarError(e) {
  // 头像加载失败时隐藏图片，显示首字兜底
  e.target.style.display = 'none'
}

function closeMenu() {
  open.value = false
}

function onDocumentClick(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    closeMenu()
  }
}

function onLogout() {
  userStore.logout()
  closeMenu()
  router.push('/login')
}

onMounted(() => {
  syncProfile()
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eef2f7;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.header-inner {
  max-width: 1200px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.logo {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  -webkit-background-clip: text;
  color: transparent;
  white-space: nowrap;
}

.divider {
  width: 1px;
  height: 22px;
  background: #e5e7eb;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.avatar-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
}


.nav-link {
  padding: 8px 14px;
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #2563eb;
  background: #eff6ff;
}

.nav-link.router-link-active {
  color: #2563eb;
  font-weight: 600;
  background: #eff6ff;
}

.profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  color: #374151;
}

.profile:hover {
  background: #f3f4f6;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
.avatar-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}


.nickname {
  font-size: 14px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  font-size: 12px;
  color: #9ca3af;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-link {
  color: #4b5563;
  font-size: 14px;
  text-decoration: none;
}

.login-link:hover {
  color: #2563eb;
}

.register-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 140px;
  background: #fff;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);
  border: 1px solid #f0f2f5;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 9px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #2563eb;
}

.logout {
  color: #ef4444;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>
