<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import research from '../data/research.json'
import { getSetting, pick } from '../utils/content.js'
import { markIntroSeen } from '../utils/introSeen.js'

const { t, locale } = useI18n()

const homeLink = computed(() => ({ name: 'home', params: { lang: locale.value } }))

// 研究領域依 order 排序
const areas = computed(() =>
  [...research]
    .sort((a, b) => a.order - b.order)
    .map((area) => ({ id: area.id, title: pick(area, 'title', locale.value) })),
)

onMounted(markIntroSeen)
</script>

<template>
  <section class="intro">
    <RouterLink :to="homeLink" class="skip">{{ t('intro.skip') }} →</RouterLink>

    <div class="intro-inner">
      <p class="eyebrow">{{ getSetting('department', 'en') }}</p>
      <h1 class="lab-name">{{ getSetting('lab_name', 'en') }}</h1>
      <p class="lab-name-zh">{{ getSetting('lab_name', 'zh') }}</p>

      <hr class="rule" />

      <p class="areas-label">{{ t('intro.researchAreas') }}</p>
      <ul class="areas">
        <li v-for="area in areas" :key="area.id">{{ area.title }}</li>
      </ul>

      <RouterLink :to="homeLink" class="explore">{{ t('intro.explore') }} →</RouterLink>
    </div>

    <p class="foot">{{ getSetting('department', 'zh') }}</p>
  </section>
</template>

<style scoped>
.intro {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 72px 16px 56px;
  text-align: center;
  background: var(--color-bg-soft);
}
.intro-inner { width: 100%; max-width: 760px; }

.skip {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-decoration: none;
}
.skip:hover { color: var(--color-navy); text-decoration: underline; }

.lab-name { font-size: clamp(2.5rem, 7vw, 4.5rem); line-height: 1.1; }
.lab-name-zh { margin-top: 14px; font-size: clamp(1.1rem, 2.4vw, 1.4rem); letter-spacing: 0.12em; }

.rule { width: 64px; height: 2px; margin: 32px auto; background: var(--color-navy); border: 0; }

.areas-label {
  margin-bottom: 14px;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.areas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 680px;
  margin: 0 auto 40px;
  padding: 0;
  list-style: none;
}
.areas li { padding: 6px 16px; line-height: 1.45; }
.areas li + li { border-left: 1px solid var(--color-rule); }

.explore {
  display: inline-block;
  padding: 12px 32px;
  color: #fff;
  text-decoration: none;
  letter-spacing: 0.04em;
  background: var(--color-navy);
  border-radius: var(--radius);
}
.explore:hover { color: #fff; background: var(--color-blue); }

.foot { position: absolute; bottom: 20px; left: 0; right: 0; font-size: 0.8rem; color: var(--color-text-muted); }

/* 電腦版：英文大標題維持一行，字級跟著視窗寬度縮放 */
@media (min-width: 961px) {
  .intro-inner { max-width: 1200px; }
  .lab-name { white-space: nowrap; font-size: clamp(2.25rem, 3.2vw, 3.5rem); }
}

@media (max-width: 640px) {
  .areas { grid-template-columns: 1fr; max-width: 320px; }
  .areas li { padding: 10px 0; }
  .areas li + li { border-left: 0; border-top: 1px solid var(--color-rule); }
}
</style>