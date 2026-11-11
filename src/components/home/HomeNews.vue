<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLatestNews, pick } from '../../utils/content.js'

const { t, locale } = useI18n()

const items = computed(() =>
  getLatestNews(3).map((item) => ({
    id: item.id,
    date: item.date.replaceAll('-', '.'),            // 2025-04-15 → 2025.04.15
    category: item.category,
    title: pick(item, 'title', locale.value),
  })),
)
</script>

<template>
  <section id="news" class="section section-soft">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">Latest News</p>
          <h2 class="section-title">{{ t('home.latestNews') }}</h2>
        </div>
        <RouterLink :to="{ name: 'news' }" class="link-more">{{ t('home.viewAll') }} →</RouterLink>
      </div>

      <ul class="news-list">
        <li v-for="item in items" :key="item.id">
          <RouterLink :to="{ name: 'news' }" class="news-row">
            <span class="news-date">{{ item.date }}</span>
            <span class="tag" :class="`tag-${item.category.toLowerCase()}`">
              {{ t(`categories.${item.category}`) }}
            </span>
            <span class="news-title">{{ item.title }}</span>
            <span class="news-arrow" aria-hidden="true">→</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.news-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--color-rule); }
.news-list li { border-bottom: 1px solid var(--color-rule); }
.news-row {
  display: grid;
  grid-template-columns: calc(110px * var(--home-scale)) calc(110px * var(--home-scale)) minmax(0, 1fr) auto;
  gap: 20px;
  align-items: baseline;
  padding: calc(20px * var(--home-scale)) 4px;
  color: inherit;
  text-decoration: none;
}
.news-row:hover .news-title { color: var(--color-blue); }
.news-date { font-size: calc(0.9rem * var(--home-scale)); font-variant-numeric: tabular-nums; color: var(--color-text-muted); }
.news-title { font-size: calc(1.05rem * var(--home-scale)); }
.news-arrow { color: var(--color-text-muted); }

/* 分類標籤：顏色取自 tokens.css */
.tag { justify-self: start; padding: 2px 10px; font-size: calc(0.75rem * var(--home-scale)); font-weight: 600; border-radius: 3px; }
.tag-news { color: var(--tag-news-text); background: var(--tag-news-bg); }
.tag-event { color: var(--tag-event-text); background: var(--tag-event-bg); }
.tag-award { color: var(--tag-award-text); background: var(--tag-award-bg); }
.tag-publication { color: var(--tag-publication-text); background: var(--tag-publication-bg); }

/* 720px 以下：日期與標籤一行，標題換到下一行 */
@media (max-width: 720px) {
  .news-row { grid-template-columns: auto minmax(0, 1fr); gap: 6px 14px; }
  .news-title { grid-column: 1 / -1; }
  .news-arrow { display: none; }
}
</style>