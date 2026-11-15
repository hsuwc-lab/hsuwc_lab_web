<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../components/PageHeader.vue'
import { getNews, pick } from '../utils/content.js'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const CATEGORIES = ['News', 'Event', 'Award', 'Publication']
const all = getNews()

// 下拉選單選項：只列出有資料的
const categories = CATEGORIES.filter((category) => all.some((item) => item.category === category))
const years = [...new Set(all.map((item) => item.date.slice(0, 4)))]   // '2025-04-15' → '2025'

const currentCategory = computed(() => route.query.category || '')
const currentYear = computed(() => route.query.year || '')

const items = computed(() =>
  all
    .filter((item) =>
      (!currentCategory.value || item.category === currentCategory.value) &&
      (!currentYear.value || item.date.startsWith(currentYear.value)),
    )
    .map((item) => ({
      id: item.id,
      date: item.date.replaceAll('-', '.'),
      category: item.category,
      title: pick(item, 'title', locale.value),
      summary: pick(item, 'summary', locale.value),
      link: item.link,
    })),
)

function setFilter(key, value) {
  router.replace({ query: { ...route.query, [key]: value || undefined } })
}
</script>

<template>
  <PageHeader :title="t('nav.news')" eyebrow="Latest News" />

  <div class="container content">
    <div class="filters">
      <label>
        {{ t('filters.category') }}
        <select :value="currentCategory" @change="setFilter('category', $event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="category in categories" :key="category" :value="category">{{ t(`categories.${category}`) }}</option>
        </select>
      </label>
      <label>
        {{ t('filters.year') }}
        <select :value="currentYear" @change="setFilter('year', $event.target.value)">
          <option value="">{{ t('filters.all') }}</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </label>
      <span class="filters-count">{{ t('filters.count', { n: items.length }) }}</span>
    </div>

    <ul v-if="items.length" class="news-list">
      <li v-for="item in items" :key="item.id" class="news-row">
        <span class="news-date">{{ item.date }}</span>
        <span class="tag" :class="`tag-${item.category.toLowerCase()}`">{{ t(`categories.${item.category}`) }}</span>
        <div class="news-body">
          <h2 class="news-title">
            <a v-if="item.link" :href="item.link" target="_blank" rel="noopener">{{ item.title }} ↗</a>
            <template v-else>{{ item.title }}</template>
          </h2>
          <p v-if="item.summary" class="news-summary">{{ item.summary }}</p>
        </div>
      </li>
    </ul>

    <p v-else class="empty">
      {{ t('filters.empty') }}
      <RouterLink :to="{ name: 'news' }">{{ t('filters.clear') }}</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.news-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--color-rule); }
.news-row {
  display: grid;
  grid-template-columns: 110px 110px minmax(0, 1fr);
  gap: 20px;
  align-items: baseline;
  padding: 20px 4px;
  border-bottom: 1px solid var(--color-rule);
}
.news-date { font-size: 0.9rem; font-variant-numeric: tabular-nums; color: var(--color-text-muted); }
.news-title { font-family: inherit; font-size: 1.05rem; font-weight: 400; line-height: 1.5; }
.news-title a { color: var(--color-text); text-decoration: none; }
.news-title a:hover { color: var(--color-blue); text-decoration: underline; }
.news-summary { margin: 4px 0 0; font-size: 0.9rem; color: var(--color-text-muted); }

@media (max-width: 720px) {
  .news-row { grid-template-columns: auto minmax(0, 1fr); gap: 6px 14px; }
  .news-body { grid-column: 1 / -1; }
}
</style>