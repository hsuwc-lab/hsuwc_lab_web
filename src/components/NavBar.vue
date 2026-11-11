<!-- 導覽列元件 -->

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getSetting } from '../utils/content.js'

const route = useRoute()
const { t, locale } = useI18n()
const setting = (key) => getSetting(key, locale.value)

// 品牌區：有簡稱時顯示「簡稱＋全名」，沒有簡稱只顯示全名
const shortName = computed(() => setting('lab_short_name'))
const fullName = computed(() => setting('lab_name'))

// 主選單：name 對應路由名稱，label 對應介面文字代號
const items = [
  { name: 'home', label: 'nav.home' },
  {
    name: 'professor',
    label: 'nav.professor',
    children: [
      { name: 'professor', label: 'nav.profile' },
      { name: 'column', label: 'nav.column' },
      { name: 'publications', label: 'nav.publications' },
    ],
  },
  { name: 'people', label: 'nav.people' },
  { name: 'projects', label: 'nav.projects' },
  { name: 'news', label: 'nav.news' },
]

// 目前頁面屬於哪個主選單：子頁面、詳情頁都歸到上層
const SECTION_OF = {
  home: 'home',
  professor: 'professor',
  column: 'professor',
  'column-detail': 'professor',
  publications: 'professor',
  people: 'people',
  projects: 'projects',
  'project-detail': 'projects',
  news: 'news',
}
const currentSection = computed(() => SECTION_OF[route.name])

// 語言切換：停在同一頁，只換網址裡的語言
const languageLink = (lang) => ({
  name: route.name,
  params: { ...route.params, lang },
  query: route.query,
  hash: route.hash,
})

// 手機版選單開關；換頁後自動收起
const menuOpen = ref(false)
watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="nav">
    <div class="container nav-inner">
      <RouterLink :to="{ name: 'intro' }" class="brand">
        <span class="brand-name">{{ shortName || fullName }}</span>
        <span v-if="shortName" class="brand-sub">{{ fullName }}</span>
      </RouterLink>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-controls="site-menu"
        :aria-label="t('common.menu')"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? '✕' : '☰' }}
      </button>

      <div id="site-menu" class="menu" :class="{ 'is-open': menuOpen }">
        <nav :aria-label="t('common.mainNav')">
          <ul class="menu-list">
            <li
              v-for="item in items"
              :key="item.name"
              class="menu-item"
              :class="{ 'has-sub': item.children }"
            >
              <RouterLink
                :to="{ name: item.name }"
                class="menu-link"
                :class="{ 'is-active': currentSection === item.name }"
                :aria-current="currentSection === item.name ? 'page' : undefined"
              >
                {{ t(item.label) }}
              </RouterLink>
              <ul v-if="item.children" class="submenu">
                <li v-for="child in item.children" :key="child.name">
                  <RouterLink :to="{ name: child.name }" class="submenu-link">
                    {{ t(child.label) }}
                  </RouterLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <div class="tools" role="group" :aria-label="t('common.language')">
          <RouterLink
            :to="languageLink('zh')"
            class="lang"
            :class="{ 'is-current': locale === 'zh' }"
            lang="zh-Hant"
          >中文</RouterLink>
          <span aria-hidden="true">|</span>
          <RouterLink
            :to="languageLink('en')"
            class="lang"
            :class="{ 'is-current': locale === 'en' }"
            lang="en"
          >EN</RouterLink>
          <button
            type="button"
            class="search"
            :aria-label="t('common.searchSoon')"
            :title="t('common.searchSoon')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;   /* 捲動時固定在頂端 */
  top: 0;
  z-index: 50;        /* 疊在其他內容上面 */
  background: var(--color-navy);  /* 和 Footer 同色 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.nav-inner { display: flex; align-items: center; gap: 24px; min-height: var(--nav-height); }

/* 品牌區固定寬度，切換語言時選單才不會被推動；放不下時折成兩行 */
.brand { display: flex; flex: 0 0 260px; flex-direction: column; min-width: 0; line-height: 1.25; text-decoration: none; }
.brand-name { font-family: var(--font-display); font-size: 1.2rem; color: #fff; }
.brand-sub { font-size: 0.72rem; color: rgba(255, 255, 255, 0.7); }

.menu { display: flex; flex: 1; align-items: center; gap: 24px; }
.menu-list { display: flex; gap: 4px; margin: 0 auto; padding: 0; list-style: none; }
.menu-item { position: relative; }
.menu-link {
  display: block;
  width: 6rem;          /* 每個選單固定寬度，中英文切換時位置不變 */
  padding: 8px 0;
  text-align: center;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);  /* 比純白淡一點，讓目前頁面的純白更明顯 */
  text-decoration: none;
  border-bottom: 2px solid transparent;
}
.menu-link:hover { color: #fff; }
.menu-link.is-active { color: #fff; font-weight: 600; border-bottom-color: #fff; }

/* 下拉選單：平常隱藏，滑鼠移入或鍵盤聚焦時顯示 */
.submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  margin: 0;
  padding: 6px 0;
  list-style: none;
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius);
}
.has-sub:hover .submenu,
.has-sub:focus-within .submenu { display: block; }
.submenu-link { display: block; padding: 6px 16px; font-size: 0.9rem; color: var(--color-text); text-decoration: none; }
.submenu-link:hover { background: var(--color-blue-soft); }

.tools { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: rgba(255, 255, 255, 0.4); }
.lang { color: rgba(255, 255, 255, 0.75); text-decoration: none; }
.lang.is-current { color: #fff; font-weight: 600; }
.search {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-left: 8px;
  color: #fff;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
}

.menu-toggle { display: none; }

/* 960px 以下：收合成選單按鈕 */
@media (max-width: 960px) {
  .menu-toggle {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    margin-left: auto;
    font-size: 1.2rem;
    color: #fff;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: var(--radius);
  }
  .menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 16px 16px;
    background: var(--color-navy);
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
  .menu.is-open { display: flex; }
  .menu-list { flex-direction: column; margin: 0; }
  .menu-link { width: auto; padding: 8px 12px; text-align: left; }
  .submenu { display: block; position: static; padding: 0 0 0 16px; border: 0; }
  /* 手機版子選單直接放在深藍底上 */
  .submenu { background: none; }
  .submenu-link { color: rgba(255, 255, 255, 0.8); }
  .submenu-link:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
  .tools { padding: 8px 12px; }
}
</style>