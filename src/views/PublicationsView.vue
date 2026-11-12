<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import { getPublications, paperLink, splitList } from '../utils/content.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const crumbs = computed(() => [{ label: t('nav.professor'), to: { name: 'professor' } }])
const tabs = computed(() => [
  { label: t('nav.profile'), to: { name: 'professor' } },
  { label: t('nav.column'), to: { name: 'column' } },
  { label: t('nav.publications'), to: { name: 'publications' } },
])

// 著作的文字不分語言，所以直接讀一次就好；只有標籤文字會隨語言變
const all = getPublications().map((item) => ({
  ...item,
  link: paperLink(item),
  indexes: splitList(item.index),
}))

// 下拉選單選項
const TYPES = ['journal', 'conference', 'book', 'chapter']
const years = [...new Set(all.map((item) => item.year))]          // 已經是新到舊
const types = TYPES.filter((type) => all.some((item) => item.type === type))   // 只列出有資料的類型

// 目前的篩選條件（網址裡都是字串，年份要轉成數字才能和資料比較）
const currentYear = computed(() => Number(route.query.year) || 0)
const currentType = computed(() => route.query.type || '')

const filtered = computed(() =>
  all.filter((item) =>
    (!currentYear.value || item.year === currentYear.value) &&
    (!currentType.value || item.type === currentType.value),
  ),
)

// 依年份分組：[{ year: 2025, items: [...] }, { year: 2024, items: [...] }]
const groups = computed(() => {
  const result = []
  for (const item of filtered.value) {
    const last = result[result.length - 1]
    if (last && last.year === item.year) {
      last.items.push(item)
    } else {
      result.push({ year: item.year, items: [item] })
    }
  }
  return result
})

function setFilter(key, value) {
  router.replace({ query: { ...route.query, [key]: value || undefined } })
}
</script>

<template>
  <PageHeader :title="t('nav.publications')" eyebrow="Professor" :crumbs="crumbs" :tabs="tabs" />

  <div class="container content">
    <div class="filters">
      <label>
        {{ t('filters.year') }}
        <select :value="currentYear || ''" @change="setFilter('year', $event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </label>
      <label>
        {{ t('filters.type') }}
        <select :value="currentType" @change="setFilter('type', $event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="type in types" :key="type" :value="type">{{ t(`publications.types.${type}`) }}</option>
        </select>
      </label>
      <span class="filters-count">{{ t('filters.count', { n: filtered.length }) }}</span>
    </div>

    <section v-for="group in groups" :key="group.year" class="year-group">
      <h2 class="year">{{ group.year }}</h2>
      <ol class="pub-list">
        <li v-for="item in group.items" :key="item.id" class="pub">
          <p class="pub-labels">
            <span class="label label-blue">{{ t(`publications.types.${item.type}`) }}</span>
            <span v-for="index in item.indexes" :key="index" class="label">{{ index }}</span>
            <span v-if="item.author_role && item.author_role !== 'co_author'" class="pub-role">
              {{ t(`publications.roles.${item.author_role}`) }}
            </span>
          </p>
          <h3 class="pub-title">{{ item.title }}</h3>
          <p class="pub-authors">{{ item.authors }}</p>
          <p class="pub-venue">
            <em>{{ item.venue }}</em><template v-if="item.details">, {{ item.details }}</template>
          </p>
          <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="pub-link">
            {{ t('publications.read') }} ↗
          </a>
        </li>
      </ol>
    </section>

    <p v-if="!filtered.length" class="empty">
      {{ t('filters.empty') }}
      <RouterLink :to="{ name: 'publications' }">{{ t('filters.clear') }}</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.year-group {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 32px;
  padding: 32px 0;
  border-top: 1px solid var(--color-rule);
}
.year { font-size: 2rem; font-weight: 400; color: var(--color-navy); font-variant-numeric: tabular-nums; }

.pub-list { margin: 0; padding: 0; list-style: none; }
.pub + .pub { margin-top: 28px; }
.pub-labels { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0 0 8px; }
.pub-role { margin-left: 4px; font-size: 0.8rem; color: var(--color-text-muted); }
.pub-title { font-family: inherit; font-size: 1.1rem; font-weight: 600; line-height: 1.5; }
.pub-authors { margin: 4px 0 0; color: var(--color-text); }
.pub-venue { margin: 2px 0 0; color: var(--color-text-muted); }
.pub-link { display: inline-block; margin-top: 8px; font-size: 0.9rem; }

/* 720px 以下：年份放在上方 */
@media (max-width: 720px) {
  .year-group { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .year { font-size: 1.5rem; }
}
</style>