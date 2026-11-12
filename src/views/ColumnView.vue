<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import { getColumns, pick, splitList } from '../utils/content.js'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const crumbs = computed(() => [{ label: t('nav.professor'), to: { name: 'professor' } }])
const tabs = computed(() => [
  { label: t('nav.profile'), to: { name: 'professor' } },
  { label: t('nav.column'), to: { name: 'column' } },
  { label: t('nav.publications'), to: { name: 'publications' } },
])

// 整理成畫面要用的樣子
const columns = computed(() =>
  getColumns().map((column) => ({
    id: column.id,
    date: column.date.replaceAll('-', '.'),
    title: pick(column, 'title', locale.value),
    summary: pick(column, 'summary', locale.value),
    series: pick(column, 'series', locale.value),          // 顯示用
    seriesKey: column.series_zh || column.series_en,       // 篩選用（不隨語言改變）
    tags: splitList(column.tags),
  })),
)

// 下拉選單的選項：從文章裡收集，重複的只留一個
const seriesOptions = computed(() => {
  const map = new Map()
  for (const column of columns.value) {
    if (column.seriesKey) map.set(column.seriesKey, column.series)
  }
  return [...map].map(([key, label]) => ({ key, label }))
})
const tagOptions = computed(() => [...new Set(columns.value.flatMap((column) => column.tags))])

// 目前的篩選條件：從網址讀
const currentSeries = computed(() => route.query.series || '')
const currentTag = computed(() => route.query.tag || '')

const filtered = computed(() =>
  columns.value.filter((column) =>
    (!currentSeries.value || column.seriesKey === currentSeries.value) &&
    (!currentTag.value || column.tags.includes(currentTag.value)),
  ),
)

// 改篩選條件：只改網址，畫面會自動跟著網址更新
function setFilter(key, value) {
  router.replace({ query: { ...route.query, [key]: value || undefined } })
}
</script>

<template>
  <PageHeader :title="t('nav.column')" eyebrow="Professor" :crumbs="crumbs" :tabs="tabs" />

  <div class="container content">
    <div class="filters">
      <label v-if="seriesOptions.length">
        {{ t('filters.series') }}
        <select :value="currentSeries" @change="setFilter('series', $event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="option in seriesOptions" :key="option.key" :value="option.key">{{ option.label }}</option>
        </select>
      </label>
      <label v-if="tagOptions.length">
        {{ t('filters.tag') }}
        <select :value="currentTag" @change="setFilter('tag', $event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="tag in tagOptions" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </label>
      <span class="filters-count">{{ t('filters.count', { n: filtered.length }) }}</span>
    </div>

    <ul v-if="filtered.length" class="column-list">
      <li v-for="column in filtered" :key="column.id" class="column-item">
        <p class="column-meta">
          <span>{{ column.date }}</span>
          <span v-if="column.series" class="column-series">{{ column.series }}</span>
        </p>
        <h2 class="column-title">
          <RouterLink :to="{ name: 'column-detail', params: { id: column.id } }">{{ column.title }}</RouterLink>
        </h2>
        <p v-if="column.summary" class="column-summary">{{ column.summary }}</p>
        <p v-if="column.tags.length" class="column-tags">
          <button
            v-for="tag in column.tags"
            :key="tag"
            type="button"
            class="label"
            @click="setFilter('tag', tag)"
          >{{ tag }}</button>
        </p>
      </li>
    </ul>

    <p v-else class="empty">
      {{ t('filters.empty') }}
      <RouterLink :to="{ name: 'column' }">{{ t('filters.clear') }}</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.column-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--color-rule); }
.column-item { padding: 28px 0; border-bottom: 1px solid var(--color-rule); }
.column-meta { display: flex; gap: 16px; margin: 0 0 6px; font-size: 0.85rem; color: var(--color-text-muted); }
.column-series { color: var(--color-blue); }
.column-title { font-size: 1.35rem; font-weight: 400; }
.column-title a { color: var(--color-navy); text-decoration: none; }
.column-title a:hover { color: var(--color-blue); text-decoration: underline; }
.column-summary { max-width: 46em; margin: 8px 0 0; color: var(--color-text-muted); }
.column-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; }
.column-tags .label { cursor: pointer; font-family: inherit; }
.column-tags .label:hover { color: var(--color-navy); border-color: var(--color-blue); }
</style>