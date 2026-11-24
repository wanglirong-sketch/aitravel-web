import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || '',
    phone: localStorage.getItem('phone') || '',
    avatar: localStorage.getItem('avatar') || '',
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    role: localStorage.getItem('role') || ''
  }),

  getters: {
    isLogin: (state) => !!state.accessToken,
    isAdmin: (state) => state.role === 'ADMIN'
  },

  actions: {
    setAuth(data) {
      this.accessToken = data.accessToken || ''
      this.refreshToken = data.refreshToken || ''
      this.userId = data.userId || ''
      this.phone = data.phone || ''
      this.role = data.role || ''
      this.nickname = data.nickname || ''
      this.avatar = data.avatar || ''

      localStorage.setItem('accessToken', this.accessToken)
      localStorage.setItem('refreshToken', this.refreshToken)
      localStorage.setItem('userId', String(this.userId))
      localStorage.setItem('phone', this.phone)
      localStorage.setItem('nickname', this.nickname)
      localStorage.setItem('avatar', this.avatar)
      localStorage.setItem('role', this.role)
    },

    async login(form) {
      const data = await loginApi(form)
      this.setAuth(data)
      return data
    },

    async register(form) {
      const data = await registerApi(form)

      // 注册接口如果直接返回 token，就保存登录态
      if (data && data.accessToken) {
        this.setAuth(data)
        return data
      }

      // 后端注册只返回 ok：这里不再自动二次登录，避免登录接口缺验证码报错
      // 注册页成功后跳转 /login，让用户手动登录
      return data
    },

    updateProfile(data) {
      if (data.nickname !== undefined) {
        this.nickname = data.nickname
        localStorage.setItem('nickname', this.nickname)
      }
      if (data.phone !== undefined) {
        this.phone = data.phone
        localStorage.setItem('phone', this.phone)
      }
      if (data.avatar !== undefined) {
        this.avatar = data.avatar
        localStorage.setItem('avatar', this.avatar)
      }
      if (data.role !== undefined) {
        this.role = data.role
        localStorage.setItem('role', this.role)
      }
    },

    logout() {
      this.accessToken = ''
      this.refreshToken = ''
      this.userId = ''
      this.nickname = ''
      this.phone = ''
      this.avatar = ''
      this.role = ''

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('nickname')
      localStorage.removeItem('phone')
      localStorage.removeItem('avatar')
      localStorage.removeItem('role')
    }
  }
})
