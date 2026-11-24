<template>
  <section class="banner-panel">
    <!-- 面板标题和新增按钮 -->
    <div class="panel-head">
      <div>
        <h2>首页轮播图</h2>
        <p>上传封面、填写标题和副标题；排序数值越小，展示越靠前。</p>
      </div>
      <button class="primary-btn" type="button" @click="openForm()">新增轮播图</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="panel-empty">加载中…</div>

    <!-- 空数据状态 -->
    <div v-else-if="!list.length" class="panel-empty">暂无轮播图，可先新增一条。</div>

    <!-- 轮播图卡片列表 -->
    <div v-else class="banner-grid">
      <div v-for="item in list" :key="item.id" class="banner-card">
        <div class="cover">
          <img :src="resolveImage(item.imageUrl)" :alt="item.title" @error="onImgError" />
          <span class="status" :class="item.status === 1 ? 'on' : 'off'">
            {{ item.status === 1 ? '启用' : '停用' }}
          </span>
        </div>

        <div class="info">
          <strong>{{ item.title }}</strong>
          <p>{{ item.subtitle || '暂无副标题' }}</p>
          <small>排序：{{ item.sortNo ?? 0 }}</small>
        </div>

        <div class="actions">
          <button type="button" @click="openForm(item)">编辑</button>
          <button type="button" class="danger" @click="onDelete(item)">删除</button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="formVisible" class="modal-mask" @click.self="closeForm">
      <div class="modal">
        <div class="modal-head">
          <h3>{{ form.id ? '编辑轮播图' : '新增轮播图' }}</h3>
          <button type="button" class="close" @click="closeForm">×</button>
        </div>

        <div class="form">
          <label>封面图片</label>
          <div class="upload-row">
            <div class="preview">
              <img v-if="form.imageUrl" :src="resolveImage(form.imageUrl)" alt="封面预览" />
              <span v-else>未选择图片</span>
            </div>
            <label class="upload-btn">
              选择本地图片
              <input type="file" accept="image/*" @change="onFileChange" hidden />
            </label>
          </div>

          <label>标题</label>
          <input v-model="form.title" maxlength="100" placeholder="例如：把下一段旅程交给灵感" />

          <label>副标题</label>
          <textarea v-model="form.subtitle" maxlength="200" rows="3" placeholder="一句话说明轮播内容" />

          <label>跳转链接（可选）</label>
          <input v-model="form.linkUrl" placeholder="例如：/discover/scenic" />

          <div class="form-row">
            <div>
              <label>排序</label>
              <input v-model.number="form.sortNo" type="number" min="0" />
            </div>
            <div>
              <label>状态</label>
              <select v-model.number="form.status">
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select>
            </div>
          </div>

          <p v-if="error" class="error-text">{{ error }}</p>
        </div>

        <div class="modal-foot">
          <button type="button" class="plain-btn" @click="closeForm">取消</button>
          <button type="button" class="primary-btn" :disabled="saving" @click="onSave">
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage
} from '../api/banner'

// 轮播图列表
const list = ref([])

// 页面加载状态
const loading = ref(false)

// 保存按钮加载状态
const saving = ref(false)

// 弹窗是否显示
const formVisible = ref(false)

// 表单错误提示
const error = ref('')

// 表单默认值
const defaultForm = () => ({
  id: null,
  imageUrl: '',
  title: '',
  subtitle: '',
  linkUrl: '',
  sortNo: 0,
  status: 1
})

// 当前正在编辑的表单数据
const form = reactive(defaultForm())

/**
 * 重置表单
 */
function blankForm() {
  Object.assign(form, defaultForm())
}

/**
 * 打开新增或编辑弹窗
 */
function openForm(item) {
  blankForm()
  error.value = ''

  if (item) {
    Object.assign(form, {
      id: item.id,
      imageUrl: item.imageUrl || '',
      title: item.title || '',
      subtitle: item.subtitle || '',
      linkUrl: item.linkUrl || '',
      sortNo: item.sortNo ?? 0,
      status: item.status ?? 1
    })
  }

  formVisible.value = true
}


/**
 * 关闭弹窗
 */
function closeForm() {
  formVisible.value = false
}

/**
 * 处理图片地址。
 * 后端返回的是 /uploads/... 相对地址；
 * 如果以后换成完整外链，也可以直接显示。
 */
function resolveImage(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return url
}

/**
 * 图片加载失败时隐藏碎图
 */
function onImgError(e) {
  e.target.style.display = 'none'
}

/**
 * 选择本地图片后上传到后端
 */
async function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return

  error.value = ''

  try {
    const data = await uploadBannerImage(file)
    form.imageUrl = data.imageUrl
  } catch (err) {
    error.value = err.message || '图片上传失败'
  }
}


// 表单验证
function validate() {
  if (!form.imageUrl) return '请先选择封面图片'
  if (!form.title.trim()) return '标题不能为空'
  if (form.subtitle && form.subtitle.length > 200) return '副标题不能超过 200 个字'
  return ''
}


/**
 * 保存表单：新增或编辑
 */
async function onSave() {
  const msg = validate()
  if (msg) {
    error.value = msg
    return
  }

  saving.value = true
  error.value = ''

  const payload = {
    imageUrl: form.imageUrl,
    title: form.title.trim(),
    subtitle: form.subtitle?.trim() || '',
    linkUrl: form.linkUrl?.trim() || '',
    sortNo: Number(form.sortNo) || 0,
    status: Number(form.status)
  }

  try {
    if (form.id) {
      await updateBanner(form.id, payload)
    } else {
      await createBanner(payload)
    }

    closeForm()
    await loadList()
  } catch (err) {
    error.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}


/**
 * 删除轮播图
 */
async function onDelete(item) {
  if (!window.confirm(`确定删除轮播图「${item.title}」吗？`)) return

  try {
    await deleteBanner(item.id)
    await loadList()
  } catch (err) {
    window.alert(err.message || '删除失败')
  }
}

/**
 * 加载后台轮播图列表
 */
async function loadList() {
  loading.value = true
  try {
    list.value = await listBanners() || []
  } catch (err) {
    list.value = []
    console.error('轮播图列表加载失败：', err)
  } finally {
    loading.value = false
  }
}

// 页面打开时加载列表
onMounted(loadList)
</script>

<style scoped>
.banner-panel {
  background: #fff;
  border: 1px solid #EEF2F7;
  border-radius: 18px;
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1F2937;
}

.panel-head p {
  margin: 0;
  color: #6B7280;
  font-size: 13px;
}

.panel-empty {
  padding: 48px 0;
  text-align: center;
  color: #9CA3AF;
}

.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.banner-card {
  border: 1px solid #EEF2F7;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.cover {
  position: relative;
  height: 150px;
  background: #F1F5F9;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.9);
}

.status.on {
  color: #16A34A;
}

.status.off {
  color: #EF4444;
}

.info {
  padding: 14px 16px;
}

.info strong {
  display: block;
  margin-bottom: 6px;
  color: #1F2937;
}

.info p {
  margin: 0 0 8px;
  color: #6B7280;
  font-size: 13px;
  line-height: 1.5;
}

.info small {
  color: #9CA3AF;
}

.actions {
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
}

.actions button {
  border: 1px solid #E5E7EB;
  background: #fff;
  border-radius: 8px;
  padding: 7px 12px;
  color: #374151;
  cursor: pointer;
}

.actions button.danger {
  color: #EF4444;
  border-color: #FECACA;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 460px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #EEF2F7;
}

.modal-head h3 {
  margin: 0;
  font-size: 17px;
}

.close {
  border: none;
  background: #F3F4F6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form label {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.form input,
.form textarea,
.form select {
  width: 100%;
  margin-top: 6px;
  padding: 11px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  background: #F8FAFC;
}

.form input:focus,
.form textarea:focus,
.form select:focus {
  border-color: #2563EB;
  background: #fff;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.preview {
  width: 110px;
  height: 76px;
  border-radius: 12px;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 12px;
  overflow: hidden;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  display: inline-flex;
  padding: 10px 14px;
  border-radius: 10px;
  background: #EFF6FF;
  color: #2563EB;
  cursor: pointer;
  font-size: 13px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.error-text {
  margin: 0;
  color: #EF4444;
  font-size: 13px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px 20px;
}

.primary-btn,
.plain-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}

.primary-btn {
  background: #2563EB;
  color: #fff;
  font-weight: 600;
}

.primary-btn:disabled {
  opacity: 0.6;
}

.plain-btn {
  background: #F3F4F6;
  color: #374151;
}
</style>
