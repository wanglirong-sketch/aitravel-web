<template>
  <div class="poi-card card" @click="onSelect">
    <div class="cover">
      <img v-if="coverUrl" :src="coverUrl" :alt="poi.name" @error="onImgError" />
      <span v-else class="placeholder">{{ placeholderIcon }}</span>

      <!-- 渐变遮罩提升文字辨识度 -->
      <div class="cover-mask"></div>
      <span class="type-tag">{{ typeName }}</span>

      <!-- 收藏按钮 -->
      <button
        class="fav-btn"
        :class="{ active: isFav }"
        :disabled="favLoading"
        @click.stop="toggleFav"
        aria-label="收藏"
      >
        <svg class="heart" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>

    <div class="body">
      <div class="row">
        <h3 class="name">{{ poi.name }}</h3>
        <span v-if="showRating" class="rating">
          <span class="star">★</span> {{ ratingText }}
        </span>
      </div>
      <p class="intro">{{ descText }}</p>
      <div class="foot">
        <span class="price">{{ priceText }}</span>
        <span class="addr" :title="addressText">
          <span class="addr-icon">📍</span> {{ addressText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { addFavorite, deleteFavoriteByKey } from '../api/favorite'
import { buildFavoritePayload, getPoiKey } from '../api/poi'

const props = defineProps({
  poi: { type: Object, required: true },
  favorited: { type: Boolean, default: false },
  favoriteId: { type: [Number, String], default: null }
})

const emit = defineEmits(['select', 'fav-change'])

const isFav = ref(props.favorited)
const favLoading = ref(false)

watch(
  () => props.favorited,
  (val) => {
    isFav.value = val
  }
)

watch(
  () => props.poi,
  () => {
    isFav.value = props.favorited
  }
)

// 类型中文名：1景点 2美食 3项目 4购物
const TYPE_NAMES = { 1: '景点', 2: '美食', 3: '项目', 4: '购物' }
const typeName = computed(() => TYPE_NAMES[props.poi.type] || '点位')

// 评分：有值才显示，空值不显示 0.0
const showRating = computed(() => {
  const r = Number(props.poi.rating)
  return props.poi.rating != null && !isNaN(r) && r > 0
})
const ratingText = computed(() => Number(props.poi.rating).toFixed(1))

// 人均：空值或 0 显示 —，不再显示免费
const priceText = computed(() => {
  const p = Number(props.poi.price)
  if (!props.poi.price || isNaN(p) || p <= 0) return '—'
  return '¥' + p + '/人'
})

// 描述：优先特色标签，其次类型简介
const descText = computed(() => props.poi.tags || props.poi.intro || '暂无简介')

// 地址：行政区 + 详细地址
const addressText = computed(() => {
  const parts = [props.poi.tips, props.poi.address].filter(Boolean)
  return parts.length ? parts.join(' · ') : '地址暂无'
})

const coverUrl = computed(() => props.poi.cover || '')
const PLACEHOLDER_ICON = { 1: '🏞', 2: '🍜', 3: '🎢', 4: '🛍' }
const placeholderIcon = computed(() => PLACEHOLDER_ICON[props.poi.type] || '📍')

async function toggleFav() {
  if (favLoading.value) return

  const poiKey = getPoiKey(props.poi)
  if (!poiKey) {
    console.warn('当前点位缺少唯一标识，无法收藏', props.poi)
    return
  }

  favLoading.value = true
  const next = !isFav.value

  try {
    if (next) {
      const saved = await addFavorite(buildFavoritePayload(props.poi))
      isFav.value = true
      emit('fav-change', {
        favorited: true,
        poi: props.poi,
        favorite: saved || null
      })
    } else {
      await deleteFavoriteByKey({ poiKey })
      isFav.value = false
      emit('fav-change', {
        favorited: false,
        poi: props.poi,
        favorite: null
      })
    }
  } catch (e) {
    console.error('收藏操作失败', e)
    isFav.value = !next
  } finally {
    favLoading.value = false
  }
}

function onImgError(e) {
  e.target.style.display = 'none'
}

function onSelect() {
  emit('select', props.poi)
}
</script>

<style scoped>
/* 基础变量（延续松石绿与柔和灰，若无全局变量则使用此处兜底） */
:root {
  --text-main: #1e293b;
  --text-sub: #64748b;
  --border: #f1f5f9;
  --primary: #0d9488;
}

.poi-card {
  overflow: hidden;
  padding: 0;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(241, 245, 249, 0.8);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.poi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

/* 封面区 */
.cover {
  position: relative;
  height: 170px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.poi-card:hover .cover img {
  transform: scale(1.05);
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.25) 0%, transparent 60%);
  z-index: 1;
}

.placeholder {
  font-size: 46px;
  opacity: 0.6;
  z-index: 0;
}

/* 标签与收藏 */
.type-tag {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(13, 148, 136, 0.9);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.fav-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.fav-btn:hover {
  background: #fff;
  transform: scale(1.1);
  color: #ef4444;
}

.fav-btn.active {
  color: #ef4444;
  background: rgba(255, 255, 255, 0.95);
}

.fav-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.fav-btn .heart {
  width: 18px;
  height: 18px;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.fav-btn:active .heart {
  transform: scale(0.6);
}

/* 内容区 */
.body {
  padding: 16px;
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.rating {
  flex-shrink: 0;
  font-size: 13px;
  color: #f59e0b;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
}

.rating .star {
  font-size: 12px;
}

.intro {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.5;
  margin: 8px 0 14px;
  height: 39px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  flex-shrink: 0;
}

.addr {
  font-size: 12px;
  color: var(--text-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 2px;
}

.addr-icon {
  font-size: 11px;
  opacity: 0.8;
}

/* 响应式微调 */
@media (max-width: 480px) {
  .cover {
    height: 150px;
  }
  .name {
    font-size: 16px;
  }
  .intro {
    height: auto;
    -webkit-line-clamp: 1;
    margin-bottom: 10px;
  }
}
</style>
