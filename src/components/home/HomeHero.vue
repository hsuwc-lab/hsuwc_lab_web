<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import research from '../../data/research.json'
import { getProfessor, getSetting, pick } from '../../utils/content.js'

const { t, locale } = useI18n()
const setting = (key) => getSetting(key, locale.value)

// 另一種語言：大標題用目前語言，副標用另一種
const otherLang = computed(() => (locale.value === 'zh' ? 'en' : 'zh'))

// 右欄的三組資訊
const piText = computed(() =>
  [getProfessor('name', locale.value), getProfessor('title', locale.value)].filter(Boolean).join(' '),
)
const focusText = computed(() =>
  [...research]
    .sort((a, b) => a.order - b.order)
    .map((area) => pick(area, 'title', locale.value))
    .join(' · '),
)
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-main">
        <h1 class="hero-title">{{ setting('lab_name') }}</h1>
        <p class="hero-sub">{{ getSetting('lab_name', otherLang) }}</p>
        <div class="hero-buttons">
          <RouterLink :to="{ hash: '#research' }" class="btn btn-primary">
            {{ t('home.exploreResearch') }} <span aria-hidden="true">→</span>
          </RouterLink>
          <RouterLink :to="{ hash: '#news' }" class="btn btn-ghost">
            {{ t('home.latestNews') }}
          </RouterLink>
        </div>
      </div>

      <dl class="facts">
        <div>
          <dt>{{ t('home.pi') }}</dt>
          <dd>{{ piText }}</dd>
        </div>
        <div>
          <dt>{{ t('home.focus') }}</dt>
          <dd>{{ focusText }}</dd>
        </div>
        <div v-if="setting('address')">
          <dt>{{ t('home.location') }}</dt>
          <dd>
            {{ setting('address') }}
            <a v-if="setting('map_url')" :href="setting('map_url')" target="_blank" rel="noopener" class="map-link">
              {{ t('common.openMap') }}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.hero { background: var(--color-bg-soft); border-bottom: 1px solid var(--color-rule); }
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
  gap: 56px;
  align-items: end;
  padding-top: 72px;
  padding-bottom: 64px;
}
.hero-title { font-size: calc(clamp(2rem, 4.2vw, 3.2rem) * var(--home-scale)); line-height: 1.15; text-wrap: balance; }
.hero-sub { margin: 10px 0 18px; font-family: var(--font-display); font-style: italic; font-size: calc(clamp(1.05rem, 2vw, 1.3rem) * var(--home-scale)); color: var(--color-blue); }
.hero-buttons { display: flex; flex-wrap: wrap; gap: 12px; }

/* 右欄：左側細分隔線 */
.facts { display: grid; gap: 18px; margin: 0; padding-left: 32px; border-left: 1px solid var(--color-rule); }
.facts dt { font-size: calc(0.85rem * var(--home-scale)); letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); }
.facts dd { margin: 4px 0 0; font-size: calc(1.1rem * var(--home-scale)); line-height: 1.5;}
.map-link { margin-left: 6px; font-size: calc(0.85rem * var(--home-scale)); }

/* 960px 以下：單欄，右欄移到下方 */
@media (max-width: 960px) {
  .hero-inner { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .facts { padding-left: 0; padding-top: 24px; border-left: 0; border-top: 1px solid var(--color-rule); }
}
</style>