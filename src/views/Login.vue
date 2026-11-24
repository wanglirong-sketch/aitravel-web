<template>
  <div class="auth-page" :style="{ backgroundImage: `url(${authBg})` }">
    <div class="page-mask"></div>

    <div class="auth-card">
      <div class="brand">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 21s-7-5.2-7-10a7 7 0 1 1 14 0c0 4.8-7 10-7 10Z" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
        </span>
        <span class="brand-text">
          <strong>智游</strong>
          <small>ZHITRIP</small>
        </span>
      </div>

      <div class="auth-header">
        <h1>登录账号</h1>
        <p>使用手机号继续使用智游</p>
      </div>

      <div class="field">
        <label>手机号</label>
        <input
          v-model.trim="form.phone"
          type="text"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </div>

      <div class="field">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="onSubmit"
        />
      </div>

      <div class="field">
        <label>验证码</label>
        <div class="captcha-row">
          <input
            v-model.trim="form.captchaCode"
            type="text"
            placeholder="输入右图字符"
            maxlength="4"
            @keyup.enter="onSubmit"
          />
          <img
            v-if="captcha.image"
            :src="captcha.image"
            class="captcha-img"
            alt="验证码"
            title="点击刷新"
            @click="loadCaptcha"
          />
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="submit-btn" :disabled="loading" @click="onSubmit">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <p class="footer-text">
        还没有账号？<router-link to="/register" class="link">去注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getCaptcha } from '../api/auth'
import authBg from '../assets/images/auth-bg.jpg'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  phone: '',
  password: '',
  captchaId: '',
  captchaCode: ''
})

const loading = ref(false)
const error = ref('')

const captcha = ref({
  captchaId: '',
  image: ''
})

async function loadCaptcha() {
  try {
    const data = await getCaptcha()
    captcha.value = data
    form.captchaId = data.captchaId
    form.captchaCode = ''
  } catch (e) {
    error.value = e.message || '验证码加载失败'
  }
}

async function onSubmit() {
  error.value = ''

  if (!form.phone || form.phone.length !== 11) {
    error.value = '请输入 11 位手机号'
    return
  }

  if (!form.password || form.password.length < 6) {
    error.value = '密码至少 6 位'
    return
  }

  if (!form.captchaCode) {
    error.value = '请输入验证码'
    return
  }

  loading.value = true
  try {
    await userStore.login({
      phone: form.phone,
      password: form.password,
      captchaId: form.captchaId,
      captchaCode: form.captchaCode
    })
    router.push(route.query.redirect || '/home')
  } catch (e) {
    error.value = e.message || '登录失败'
    await loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCaptcha()
})
</script>


<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.page-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.18);
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 38px 34px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 20px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 26px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}

.brand-text strong {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 1px;
}

.brand-text small {
  margin-top: 3px;
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 1.8px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: #111827;
}

.auth-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  color: #374151;
}

.field input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.field input:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-row input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  cursor: pointer;
  object-fit: cover;
  background: #f8fafc;
}

.error {
  margin: 0 0 14px;
  color: #dc2626;
  font-size: 13px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer-text {
  margin: 22px 0 0;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
}

.link {
  color: #2563eb;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 24px;
  }
}
</style>
