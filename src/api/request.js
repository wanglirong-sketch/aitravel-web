import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截：带上令牌
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：剥掉 Result 外壳，失败统一抛错
request.interceptors.response.use(
  (res) => {
    const body = res.data

    if (body && body.code === 0) {
      return body.data
    }

    if (body && body.code === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('nickname')
      window.location.href = '/login'
      return Promise.reject(new Error(body.message || '登录已过期'))
    }

    return Promise.reject(new Error((body && body.message) || '请求失败'))
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
