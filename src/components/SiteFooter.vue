<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSetting } from '../utils/content.js'

const { t, locale } = useI18n()
const setting = (key) => getSetting(key, locale.value)

const links = ['home', 'professor', 'people', 'projects', 'news']
const year = new Date().getFullYear()   // 版權年份自動產生

const shortName = computed(() => setting('lab_short_name'))
const fullName = computed(() => setting('lab_name'))
</script>

<template>
  <footer class="footer">
    <div class="container footer-main">
      <RouterLink :to="{ name: 'intro' }" class="brand">
        <span class="brand-name">{{ shortName || fullName }}</span>
        <span v-if="shortName" class="brand-sub">{{ fullName }}</span>
      </RouterLink>

      <nav :aria-label="t('common.footerNav')">
        <ul class="footer-links">
          <li v-for="name in links" :key="name">
            <RouterLink :to="{ name }">{{ t(`nav.${name}`) }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="contact">
        <p v-if="setting('email')">
          {{ t('common.email') }}：<span class="selectable">{{ setting('email') }}</span>
        </p>
        <p v-if="setting('address')">
          {{ setting('address') }}
          <a v-if="setting('map_url')" :href="setting('map_url')" target="_blank" rel="noopener">
            {{ t('common.openMap') }}
          </a>
        </p>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© {{ year }} {{ setting('copyright') }}</span>
      <!-- 「最後更新日期」等第七部分同步腳本完成後再加 -->
    </div>
  </footer>
</template>

<style scoped>
.footer { color: var(--color-footer-text); background: var(--color-navy); }
.footer-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px 40px;
  align-items: start;
  padding-top: 40px;
  padding-bottom: 24px;
}
.brand { display: flex; flex-direction: column; line-height: 1.3; text-decoration: none; }
.brand-name { font-family: var(--font-display); font-size: 1.2rem; color: #fff; }
.brand-sub { font-size: 0.75rem; color: var(--color-footer-muted); }

.footer-links { display: flex; flex-wrap: wrap; gap: 6px 20px; margin: 0; padding: 0; list-style: none; font-size: 0.9rem; }
.footer-links a, .contact a { color: var(--color-footer-text); text-decoration: none; }
.footer-links a:hover, .contact a:hover { color: #fff; text-decoration: underline; }

.contact { font-size: 0.85rem; text-align: right; }
.contact a { margin-left: 6px; text-decoration: underline; }
.selectable { user-select: all; }   /* 點一下就能全選，方便複製 Email */

.footer-bottom {
  padding-top: 16px;
  padding-bottom: 28px;
  font-size: 0.8rem;
  color: var(--color-footer-muted);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

@media (max-width: 720px) {
  .footer-main { grid-template-columns: 1fr; }
  .contact { text-align: left; }
}
</style>