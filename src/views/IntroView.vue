<script setup>
import { onMounted } from 'vue'
import { markIntroSeen } from '../utils/introSeen.js'
import { preferredLanguage } from '../utils/language.js'

const homePath = `/${preferredLanguage()}/`

// 進入 Intro 就算看過，下次進站直接到首頁
onMounted(markIntroSeen)
</script>

<template>
  <div class="container">
    <RouterLink :to="homePath">略過 Skip</RouterLink>
    <h1>Intro</h1>
    <RouterLink :to="homePath">Explore →</RouterLink>
  </div>
</template>