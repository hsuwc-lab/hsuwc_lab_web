<script setup>
// 從外面傳進來的屬性：只有 title 必填，其他可以不給
defineProps({
  title: { type: String, required: true },       // 頁面標題
  eyebrow: { type: String, default: '' },        // 小型英文標籤
  lead: { type: String, default: '' },           // 標題下方一行說明
  crumbs: { type: Array, default: () => [] },    // 麵包屑：[{ label, to }]
  tabs: { type: Array, default: () => [] },      // 子選單：[{ label, to }]
})
</script>

<template>
  <header class="page-header">
    <div class="container">
      <nav v-if="crumbs.length" class="crumbs" aria-label="breadcrumb">
        <template v-for="(crumb, index) in crumbs" :key="index">
          <span v-if="index" class="crumb-sep" aria-hidden="true">›</span>
          <RouterLink :to="crumb.to">{{ crumb.label }}</RouterLink>
        </template>
      </nav>

      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="lead" class="page-lead">{{ lead }}</p>

      <nav v-if="tabs.length" class="tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.label"
          :to="tab.to"
          class="tab"
          exact-active-class="is-active"
        >{{ tab.label }}</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  padding-top: 48px;
  background: var(--color-bg-soft);
  border-bottom: 1px solid var(--color-rule);
}
/* 沒有子選單時，標題帶下方留白；有子選單時由子選單貼齊底線 */
.page-header .container { padding-bottom: 40px; }
.page-header .container:has(.tabs) { padding-bottom: 0; }

.crumbs { margin-bottom: 12px; font-size: 0.85rem; color: var(--color-text-muted); }
.crumbs a { color: var(--color-text-muted); text-decoration: none; }
.crumbs a:hover { color: var(--color-navy); text-decoration: underline; }
.crumb-sep { margin: 0 8px; }

.page-title { font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 400; }
.page-lead { max-width: 40em; margin-top: 12px; color: var(--color-text-muted); }

.tabs { display: flex; gap: 4px; margin-top: 32px; overflow-x: auto; }
.tab {
  padding: 10px 16px;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}
.tab:hover { color: var(--color-navy); }
.tab.is-active { color: var(--color-navy); font-weight: 600; border-bottom-color: var(--color-blue); }
</style>