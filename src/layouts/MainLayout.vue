<script setup>
import NavBar from '../components/NavBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
</script>

<template>
  <div class="layout">
    <NavBar />
    <main class="layout-main">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
/* 內容很少時，Footer 也會貼在畫面底部 */
.layout { display: flex; flex-direction: column; min-height: 100vh; }
.layout-main { flex: 1; }
</style>