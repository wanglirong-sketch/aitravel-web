<template>
  <div class="home">
    <section class="hero" aria-label="旅行推荐轮播">
      <div class="hero-carousel">
        <div
          v-for="(slide, index) in slides"
          :key="slide.id || slide.title"
          class="hero-slide"
          :class="{ active: currentSlide === index }"
          :style="{ background: slide.bg }"
        >
          <img
            v-if="slide.imageUrl"
            :src="resolveBannerImage(slide.imageUrl)"
            class="slide-bg"
            alt=""
            @error="onBannerImgError"
          />
          <div class="slide-pattern" :style="slide.pattern"></div>
          <div class="slide-copy">
            <span class="slide-kicker">{{ slide.kicker }}</span>
            <h1>{{ slide.title }}</h1>
            <p>{{ slide.desc }}</p>
          </div>
        </div>

        <button
          class="carousel-arrow prev"
          type="button"
          aria-label="上一张"
          @click="prevSlide"
        >
          ‹
        </button>
        <button
          class="carousel-arrow next"
          type="button"
          aria-label="下一张"
          @click="nextSlide"
        >
          ›
        </button>

        <div class="carousel-dots">
          <button
            v-for="(slide, index) in slides"
            :key="slide.id || slide.title"
            type="button"
            :class="{ active: currentSlide === index }"
            :aria-label="`切换到第 ${index + 1} 张`"
            @click="goSlide(index)"
          ></button>
        </div>
      </div>

      <div class="hero-panel">
        <div class="search-box">
          <input
            v-model="keyword"
            placeholder="搜索景点、美食、特色或城市"
            @keyup.enter="goSearch"
          />
          <button class="search-btn" @click="goSearch()">搜索</button>
        </div>

        <div class="quick-cities">
          <span class="quick-label">热门城市</span>
          <button
            v-for="city in hotCities"
            :key="city"
            type="button"
            class="city-chip"
            @click="goSearch(city)"
          >
            {{ city }}
          </button>
        </div>
      </div>
    </section>

    <section class="categories" aria-label="分类入口">
      <router-link
        v-for="item in categories"
        :key="item.path"
        :to="item.path"
        class="category-card"
        :style="{ '--card-color': item.color, '--card-soft': item.soft }"
      >
        <span class="category-icon" v-html="item.icon"></span>
        <span class="category-text">
          <strong>{{ item.name }}</strong>
          <small>{{ item.desc }}</small>
        </span>
        <span class="category-arrow">→</span>
      </router-link>
    </section>

    <section class="section recommend-section">
      <div class="section-head">
        <div>
          <span class="section-kicker">TRENDING</span>
          <h2>为你推荐</h2>
          <p>精选城市景点与玩法，点开卡片可查看详情和地图位置</p>
        </div>
        <router-link to="/discover/scenic" class="section-more">
          查看全部
        </router-link>
      </div>

      <div v-if="loading" class="empty">加载中…</div>
      <div v-else-if="!list.length" class="empty">暂无推荐点位，稍后再来看看</div>

      <div v-else class="grid">
        <PoiCard
          v-for="p in list"
          :key="p.id || `${p.lng}_${p.lat}`"
          :poi="p"
          @select="openDetail"
        />
      </div>
    </section>

    <section class="feature-strip">
    <div v-for="feature in features" :key="feature.title" class="feature-card">
      <span class="feature-icon" v-html="feature.icon"></span>
      <div>
        <strong>{{ feature.title }}</strong>
        <p>{{ feature.desc }}</p>
      </div>
    </div>
  </section>


    <PoiDetailModal :poi="selected" @close="closeDetail" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import PoiCard from '../components/PoiCard.vue'
import PoiDetailModal from '../components/PoiDetailModal.vue'
import { getOnlinePois } from '../api/poi'
import { listPublicBanners } from '../api/banner'

const router = useRouter()
const keyword = ref('')
const list = ref([])
const loading = ref(false)
const selected = ref(null)
const currentSlide = ref(0)
let timer = null

const fallbackBanners = [
  {
    kicker: '城市漫游',
    title: '把下一段旅程交给灵感',
    desc: '从山水景点到地道美食，按你的兴趣发现周边好去处。',
    bg: 'linear-gradient(120deg, #1D4ED8 0%, #3B82F6 48%, #93C5FD 100%)',
    pattern: { '--circle-opacity': '0.16' }
  },
  {
    kicker: '本地美食',
    title: '藏在街巷里的烟火气',
    desc: '筛选热门餐厅、特色小吃和休闲去处，出行前先做好功课。',
    bg: 'linear-gradient(120deg, #0F766E 0%, #14B8A6 52%, #A7F3D0 100%)',
    pattern: { '--circle-opacity': '0.14' }
  },
  {
    kicker: 'AI 行程规划',
    title: '几天假期，也能玩得更有条理',
    desc: '输入目的地和偏好，生成可保存、可继续调整的行程安排。',
    bg: 'linear-gradient(120deg, #4338CA 0%, #6366F1 52%, #C7D2FE 100%)',
    pattern: { '--circle-opacity': '0.15' }
  }
]

const slides = ref(fallbackBanners.map((item, index) => ({ ...item, id: index + 1 })))

const bannerGradients = [
  'linear-gradient(120deg, #1D4ED8 0%, #3B82F6 48%, #93C5FD 100%)',
  'linear-gradient(120deg, #0F766E 0%, #14B8A6 52%, #A7F3D0 100%)',
  'linear-gradient(120deg, #4338CA 0%, #6366F1 52%, #C7D2FE 100%)'
]

const hotCities = ['广州', '珠海', '桂林', '深圳', '佛山']

const iconSvg = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`

const categories = [
  {
    path: '/discover/scenic',
    name: '景点',
    desc: '山水与地标',
    icon: iconSvg('M3 18l4.5-6 3.5 4 3.5-5L21 18M3 18h18M8.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'),
    color: '#2563EB',
    soft: '#EFF6FF'
  },
  {
    path: '/discover/food',
    name: '美食',
    desc: '地道风味',
    icon: iconSvg('M5 3v7a3 3 0 0 0 6 0V3M8 3v18M15 4c-1.5 1.5-2 4-2 6v10h4V10c0-2-.5-4.5-2-6z'),
    color: '#F97316',
    soft: '#FFF7ED'
  },
  {
    path: '/discover/play',
    name: '游玩项目',
    desc: '休闲体验',
    icon: iconSvg('M12 3l9 5-9 5-9-5 9-5zM3 13.5L12 18l9-4.5M3 17l9 4.5L21 17'),
    color: '#14B8A6',
    soft: '#F0FDFA'
  },
  {
    path: '/discover/shopping',
    name: '购物',
    desc: '商圈好物',
    icon: iconSvg('M6 7h12l1.5 13h-15L6 7zM9 7a3 3 0 0 1 6 0'),
    color: '#8B5CF6',
    soft: '#F5F3FF'
  }
]

const features = [
  { icon: iconSvg('M9 4l-6 8 6 8M15 4l6 8-6 8'), title: '在线点位推荐', desc: '接入城市 POI 数据，支持按城市和关键词筛选。' },
  { icon: iconSvg('M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z'), title: 'AI 生成攻略', desc: '根据目的地、天数和偏好生成行程思路。' },
  { icon: iconSvg('M5 7h14v13H5zM9 7V5a3 3 0 0 1 6 0v2M9 12h6'), title: '行程可保存', desc: '生成后的方案可放入我的行程，方便后续查看。' }
]

function resolveBannerImage(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return url.startsWith('/') ? url : `/${url}`
}

function onBannerImgError(e) {
  e.target.style.display = 'none'
}

function startCarousel() {
  stopCarousel()
  if (!slides.value.length) return

  timer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length
  }, 5000)
}

function stopCarousel() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function goSlide(index) {
  currentSlide.value = index
  startCarousel()
}

function nextSlide() {
  if (!slides.value.length) return
  goSlide((currentSlide.value + 1) % slides.value.length)
}

function prevSlide() {
  if (!slides.value.length) return
  goSlide((currentSlide.value - 1 + slides.value.length) % slides.value.length)
}

function buildFallbackSlides() {
  return fallbackBanners.map((item, index) => ({
    ...item,
    id: index + 1
  }))
}

async function loadBanners() {
  try {
    const data = await listPublicBanners()
    // console.log('公开轮播数据：', data)

    if (!Array.isArray(data) || !data.length) {
      slides.value = buildFallbackSlides()
      return
    }

    slides.value = data.map((item, index) => ({
      id: item.id,
      kicker: item.linkUrl ? '精选推荐' : '精选目的地',
      title: item.title || '未命名轮播',
      desc: item.subtitle || '',
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      bg: bannerGradients[index % bannerGradients.length],
      pattern: { '--circle-opacity': '0.15' }
    }))

    currentSlide.value = 0
  } catch (err) {
    console.error('轮播加载失败：', err)
    slides.value = buildFallbackSlides()
  }
}

async function loadRecommend() {
  loading.value = true
  try {
    const data = await getOnlinePois({ type: 1 })
    list.value = data || []
  } finally {
    loading.value = false
  }
}

function goSearch(city = '') {
  const query = typeof city === 'string' ? city : ''
  router.push({
    path: '/discover/scenic',
    query: { key: query || keyword.value.trim() }
  })
}


function openDetail(poi) {
  selected.value = poi
}

function closeDetail() {
  selected.value = null
}

onMounted(() => {
  loadBanners()
  loadRecommend()
  startCarousel()
})

onBeforeUnmount(stopCarousel)
</script>

<style scoped>
.home {
  min-height: 60vh;
  padding-bottom: 32px;
}

.hero {
  position: relative;
  margin-bottom: 28px;
}

.hero-carousel {
  position: relative;
  height: 360px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 18px 42px rgba(37, 99, 235, 0.18);
}

.hero-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 48px 56px;
  opacity: 0;
  transform: scale(1.03);
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.hero-slide.active {
  opacity: 1;
  transform: scale(1);
}

.slide-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 22%, rgba(255, 255, 255, var(--circle-opacity, 0.15)) 0 120px, transparent 121px),
    radial-gradient(circle at 68% 82%, rgba(255, 255, 255, 0.1) 0 180px, transparent 181px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.18), transparent 58%);
}

.slide-copy {
  position: relative;
  z-index: 1;
  max-width: 560px;
  color: #fff;
}

.slide-kicker {
  display: inline-flex;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  font-size: 12px;
  letter-spacing: 0.12em;
  margin-bottom: 18px;
}

.slide-copy h1 {
  margin: 0 0 14px;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.18;
  letter-spacing: -0.02em;
}

.slide-copy p {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.86);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background 0.2s ease, transform 0.2s ease;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.28);
}

.carousel-arrow.prev {
  left: 20px;
}

.carousel-arrow.next {
  right: 20px;
}

.carousel-dots {
  position: absolute;
  left: 56px;
  bottom: 24px;
  z-index: 2;
  display: flex;
  gap: 8px;
}

.carousel-dots button {
  width: 8px;
  height: 8px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;
}

.carousel-dots button.active {
  width: 24px;
  background: #fff;
}

.hero-panel {
  position: relative;
  z-index: 3;
  max-width: 720px;
  margin: -58px auto 0;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #EEF2F7;
  border-radius: 20px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  min-width: 0;
  padding: 13px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  background: #F8FAFC;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.search-box input:focus {
  border-color: #2563EB;
  background: #fff;
}

.search-btn {
  padding: 13px 26px;
  border: none;
  border-radius: 12px;
  background: #2563EB;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.3);
}

.quick-cities {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.quick-label {
  font-size: 13px;
  color: #6B7280;
  margin-right: 4px;
}

.city-chip {
  padding: 7px 14px;
  border: 1px solid #E5E7EB;
  border-radius: 999px;
  background: #fff;
  color: #4B5563;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.city-chip:hover {
  border-color: #2563EB;
  color: #2563EB;
  background: #EFF6FF;
}

.categories {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 28px 0;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border: 1px solid #EEF2F7;
  border-radius: 18px;
  text-decoration: none;
  color: #1F2937;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-color);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--card-soft);
  color: var(--card-color);
}

.category-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.category-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.category-text strong {
  font-size: 15px;
}

.category-text small {
  color: #6B7280;
  font-size: 12px;
}

.category-arrow {
  margin-left: auto;
  color: #9CA3AF;
  transition: transform 0.2s ease, color 0.2s ease;
}

.category-card:hover .category-arrow {
  color: var(--card-color);
  transform: translateX(3px);
}

.section {
  margin-top: 34px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-kicker {
  display: block;
  margin-bottom: 6px;
  color: #2563EB;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.section-head h2 {
  margin: 0;
  font-size: 24px;
  color: #111827;
}

.section-head p {
  margin: 6px 0 0;
  color: #6B7280;
  font-size: 14px;
}

.section-more {
  flex-shrink: 0;
  padding: 9px 16px;
  border-radius: 999px;
  background: #EFF6FF;
  color: #2563EB;
  font-size: 14px;
  text-decoration: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.empty {
  padding: 60px 0;
  text-align: center;
  color: #9CA3AF;
  background: #fff;
  border: 1px dashed #E5E7EB;
  border-radius: 18px;
}

.feature-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 30px;
}

.feature-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #FFFFFF, #F8FAFC);
  border: 1px solid #EEF2F7;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #EFF6FF;
  color: #2563EB;
}

.feature-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.feature-card strong {
  display: block;
  margin-bottom: 5px;
  color: #1F2937;
  font-size: 15px;
}

.feature-card p {
  margin: 0;
  color: #6B7280;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .categories {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-carousel {
    height: 300px;
  }

  .hero-slide {
    padding: 32px 24px;
  }

  .hero-panel {
    margin: -42px 16px 0;
    padding: 18px;
  }

  .search-box {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
  }

  .carousel-arrow {
    display: none;
  }

  .categories {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
