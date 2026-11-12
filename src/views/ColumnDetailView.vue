<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import { getColumn, getColumns, getMember, getProfessorRow, pick, splitList } from '../utils/content.js'

const { t, locale } = useI18n()
const route = useRoute()

const crumbs = computed(() => [
  { label: t('nav.professor'), to: { name: 'professor' } },
  { label: t('nav.column'), to: { name: 'column' } },
])

// 依網址的 id 取文章；找不到時是 undefined
const column = computed(() => getColumn(route.params.id))

const title = computed(() => pick(column.value, 'title', locale.value))
const series = computed(() => pick(column.value, 'series', locale.value))
const date = computed(() => column.value?.date.replaceAll('-', '.') || '')
const tags = computed(() => splitList(column.value?.tags))

// 內文：目前語言沒有版本時改用另一種語言，並顯示提示
const otherLang = computed(() => (locale.value === 'zh' ? 'en' : 'zh'))
const usingOther = computed(() => !column.value?.[`content_${locale.value}`])
const contentLang = computed(() => (usingOther.value ? otherLang.value : locale.value))
const content = computed(() => column.value?.[`content_${contentLang.value}`] || '')

// 作者：author_ids 空白代表教授；有填就依 id 找成員（人名中英文一起顯示）
const authors = computed(() => {
  const ids = splitList(column.value?.author_ids)
  const rows = ids.length
    ? ids.map((id) => getMember(id)).filter(Boolean)
    : [getProfessorRow('name')].filter(Boolean)
  return rows.map((row) => [row.name_zh || row.text_zh, row.name_en || row.text_en].filter(Boolean).join(' '))
})

// 同系列的其他文章（最多 3 篇）
const related = computed(() => {
  if (!column.value) return []
  const key = column.value.series_zh || column.value.series_en
  if (!key) return []
  return getColumns()
    .filter((item) => item.id !== column.value.id && (item.series_zh || item.series_en) === key)
    .slice(0, 3)
    .map((item) => ({ id: item.id, title: pick(item, 'title', locale.value), date: item.date.replaceAll('-', '.') }))
})

// 分享：目前頁面的完整網址
// route.fullPath 不含網站的子路徑（GitHub Pages 的 /hsuwc_lab_web），要自己補上
const siteBase = import.meta.env.BASE_URL.replace(/\/$/, '')
const pageUrl = computed(() => window.location.origin + siteBase + route.fullPath)
const lineUrl = computed(() => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl.value)}`)
const facebookUrl = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}`)

const copied = ref(false)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(pageUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // 瀏覽器不允許複製（例如不是 https）時就不動作
  }
}
</script>

<template>
  <template v-if="column">
    <PageHeader :title="title" :eyebrow="series" :crumbs="crumbs" />

    <div class="container content article">
      <p class="article-meta">
        <span>{{ t('column.author') }}：{{ authors.join('、') }}</span>
        <span>{{ date }}</span>
      </p>

      <p v-if="usingOther" class="article-notice">{{ t('column.otherLanguage') }}</p>

      <!-- 內文是同步腳本產生的 HTML -->
      <div class="prose" :lang="contentLang === 'zh' ? 'zh-Hant' : 'en'" v-html="content"></div>

      <p v-if="tags.length" class="article-tags">
        <RouterLink v-for="tag in tags" :key="tag" :to="{ name: 'column', query: { tag } }" class="label">{{ tag }}</RouterLink>
      </p>

      <div class="article-actions">
        <a v-if="column.original_url" :href="column.original_url" target="_blank" rel="noopener" class="btn btn-ghost">
          {{ t('column.original') }} ↗
        </a>
        <div class="share">
          <span class="share-label">{{ t('column.share') }}</span>
          <button type="button" class="share-btn" @click="copyLink">{{ copied ? t('column.copied') : t('column.copyLink') }}</button>
          <a :href="lineUrl" target="_blank" rel="noopener" class="share-btn">LINE</a>
          <a :href="facebookUrl" target="_blank" rel="noopener" class="share-btn">Facebook</a>
        </div>
      </div>

      <section v-if="related.length" class="related">
        <h2 class="related-heading">{{ t('column.sameSeries') }}</h2>
        <ul>
          <li v-for="item in related" :key="item.id">
            <span class="related-date">{{ item.date }}</span>
            <RouterLink :to="{ name: 'column-detail', params: { id: item.id } }">{{ item.title }}</RouterLink>
          </li>
        </ul>
      </section>

      <RouterLink :to="{ name: 'column' }" class="back">← {{ t('column.back') }}</RouterLink>
    </div>
  </template>

  <!-- 網址的 id 不存在，或文章未上架 -->
  <template v-else>
    <PageHeader :title="t('column.notFound')" :crumbs="crumbs" />
    <div class="container content">
      <RouterLink :to="{ name: 'column' }">← {{ t('column.back') }}</RouterLink>
    </div>
  </template>
</template>

<style scoped>
.article { max-width: calc(720px + 32px); }   /* 內文限制寬度，每行不要太長才好讀 */
.article-meta { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 0 0 32px; font-size: 0.9rem; color: var(--color-text-muted); }
.article-notice { padding: 10px 14px; margin-bottom: 24px; font-size: 0.9rem; color: var(--tag-award-text); background: var(--tag-award-bg); border-radius: var(--radius); }

/* v-html 的內容不屬於這個元件的模板，scoped 樣式套不到，要用 :deep() */
.prose { font-size: 1.05rem; line-height: 1.9; }
.prose :deep(p) { margin: 0 0 1.2em; }
.prose :deep(h2) { margin: 2em 0 0.6em; font-size: 1.4rem; font-weight: 400; }
.prose :deep(h3) { margin: 1.6em 0 0.5em; font-size: 1.15rem; }
.prose :deep(ul), .prose :deep(ol) { margin: 0 0 1.2em; padding-left: 1.4em; }
.prose :deep(img) { max-width: 100%; height: auto; margin: 1em 0; border-radius: var(--radius); }
.prose :deep(blockquote) { margin: 1.5em 0; padding-left: 1em; color: var(--color-text-muted); border-left: 3px solid var(--color-rule); }

.article-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 32px 0 0; }
.article-tags .label { text-decoration: none; }

.article-actions { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--color-rule); }
.share { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.share-label { font-size: 0.85rem; color: var(--color-text-muted); }
.share-btn {
  padding: 4px 12px;
  font: inherit;
  font-size: 0.85rem;
  color: var(--color-navy);
  text-decoration: none;
  background: none;
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  cursor: pointer;
}
.share-btn:hover { background: var(--color-blue-soft); }

.related { margin-top: 48px; }
.related-heading { margin-bottom: 12px; font-family: inherit; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-blue); }
.related ul { margin: 0; padding: 0; list-style: none; }
.related li { display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--color-rule); }
.related-date { flex: none; font-size: 0.85rem; color: var(--color-text-muted); font-variant-numeric: tabular-nums; }

.back { display: inline-block; margin-top: 40px; }
</style>