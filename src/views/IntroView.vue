<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSetting, getProfessorRow } from '../utils/content.js'
import { markIntroSeen } from '../utils/introSeen.js'

const { t, locale } = useI18n()

const homeLink = computed(() => ({ name: 'home', params: { lang: locale.value } }))

// 教授英文姓名；沒有英文名時不顯示（不以中文代替）
const professorName = getProfessorRow('name')?.text_en || ''

onMounted(markIntroSeen)
</script>

<template>
  <section class="intro">
    <div class="intro-inner">
      <p class="eyebrow">{{ getSetting('department', 'en') }}</p>
      <h1 class="lab-name">{{ getSetting('lab_name', 'en') }}</h1>
      <p class="lab-name-zh">{{ getSetting('lab_name', 'zh') }}</p>

      <hr class="rule" />

      <p v-if="professorName" class="professor">{{ t('common.profName', { name: professorName }) }}</p>

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

.lab-name { font-size: clamp(2.5rem, 7vw, 4.5rem); line-height: 1.1; }
.lab-name-zh { margin-top: 14px; font-size: clamp(1.1rem, 2.4vw, 1.4rem); letter-spacing: 0.12em; }

.rule { width: 64px; height: 2px; margin: 32px auto; background: var(--color-navy); border: 0; }

.professor {
  margin-bottom: 40px;
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 2.2vw, 1.3rem);
  letter-spacing: 0.02em;
  color: var(--color-blue);
}

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
</style>