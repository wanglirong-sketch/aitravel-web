import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/register',
    component: () => import('../views/Register.vue'),
    meta: { public: true, title: '注册' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue')
  },


  {
    path: '/',
    component: () => import('../layouts/BasicLayout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', component: () => import('../views/Home.vue'), meta: { title: '首页' } },
      { path: 'plan', component: () => import('../views/Plan.vue'), meta: { title: '智能规划' } },
      {
        path: 'discover',
        component: () => import('../views/Discover.vue'),
        redirect: '/discover/food',
        children: [
          {
            path: '/discover/scenic',
            alias: '/scenic',
            component: () => import('../views/Pois.vue'),
            meta: { type: 1, title: '景点' }
          },
          {
            path: '/discover/food',
            alias: '/food',
            component: () => import('../views/Pois.vue'),
            meta: { type: 2, title: '美食' }
          },
          {
            path: '/discover/play',
            alias: '/play',
            component: () => import('../views/Pois.vue'),
            meta: { type: 3, title: '游玩项目' }
          },
          {
            path: '/discover/shopping',
            alias: '/shopping',
            component: () => import('../views/Pois.vue'),
            meta: { type: 4, title: '购物' }
          },


        ]
      },
      { path: 'itineraries', component: () => import('../views/MyItineraries.vue'), meta: { title: '我的行程' } },
      { path: 'itinerary/:id', component: () => import('../views/ItineraryDetail.vue'), meta: { title: '行程详情' } },
      { path: 'profile', component: () => import('../views/Profile.vue'), meta: { title: '个人中心' } },
      { path: 'admin', component: () => import('../views/Admin.vue'), meta: { title: '管理后台' } },
      { path: 'debug', component: () => import('../views/Debug.vue'), meta: { title: '调试' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 登录守卫：没令牌访问非公开页面，跳到登录并记住原地址
router.beforeEach((to) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.public) {
    return true
  }
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
