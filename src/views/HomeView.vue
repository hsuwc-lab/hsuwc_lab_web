<script setup>
import HomeHero from '../components/home/HomeHero.vue'
import HomeResearch from '../components/home/HomeResearch.vue'
import HomeTeam from '../components/home/HomeTeam.vue'
import HomeNews from '../components/home/HomeNews.vue'
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => document.documentElement.classList.add('snap-page'))
onBeforeUnmount(() => document.documentElement.classList.remove('snap-page'))
</script>

<template>
  <HomeHero />
  <HomeResearch />
  <HomeTeam />
  <HomeNews />
</template>