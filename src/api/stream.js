// EventSource 不能带自定义请求头，令牌走 URL 参数（后端 JwtAuthFilter 已支持）
export function planStreamUrl(query) {
  const token = localStorage.getItem('accessToken') || ''
  const q = encodeURIComponent(query)
  return '/api/ai/plan/stream?query=' + q + '&token=' + encodeURIComponent(token)
}
