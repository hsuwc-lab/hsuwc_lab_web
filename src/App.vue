<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 過場名稱：只有從 Intro 進入首頁時播放（樣式見 styles/transitions.css）
// 其他換頁用 none，沒有對應的樣式，會立即切換
const router = useRouter()
const transitionName = ref('none')

router.beforeEach((to, from) => {
  transitionName.value = from.name === 'intro' && to.name === 'home' ? 'intro-to-home' : 'none'
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="transitionName" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
