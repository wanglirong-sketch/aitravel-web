<template>
  <div class="filter-bar">
    <div class="cities">
      <button
        v-for="c in cityOptions"
        :key="c"
        class="chip"
        :class="{ active: city === c }"
        @click="pickCity(c)"
      >
        {{ c }}
      </button>
    </div>

    <div class="search">
      <input
        v-model.trim="kw"
        type="text"
        :placeholder="placeholder"
        @keyup.enter="doSearch"
      />
      <button class="btn-primary" @click="doSearch">搜索</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  city: { type: String, default: '' },
  keyword: { type: String, default: '' },
  placeholder: { type: String, default: '搜索名称、标签或特色' }
})

const emit = defineEmits(['update:city', 'update:keyword', 'change'])

// 城市选项，按库里实际有的三个城市
const cityOptions = ['全部', '广州', '珠海', '桂林']

const kw = ref(props.keyword)

watch(() => props.keyword, (v) => { kw.value = v })

function pickCity(c) {
  const real = c === '全部' ? '' : c
  emit('update:city', real)
  emit('change')
}

function doSearch() {
  const searchKey = kw.value
  emit('update:keyword', searchKey)
  emit('change')

  // 搜索后清空搜索框
  kw.value = ''
  emit('update:keyword', '')
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.cities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 7px 16px;
  border-radius: 999px;
  background: #fff;
  color: var(--text-sub);
  font-size: 13px;
  box-shadow: var(--shadow-card);
  transition: all 0.2s;
}

.chip.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  font-weight: 500;
}

.search {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 380px;
  min-width: 240px;
}

.search input {
  flex: 1;
  padding: 9px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 13px;
  outline: none;
}

.search input:focus {
  border-color: var(--primary);
}

.search .btn-primary {
  padding: 9px 20px;
  font-size: 13px;
  border-radius: 999px;
}
</style>
