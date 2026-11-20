import { createApp } from 'vue'
import './styles/tokens.css'
import './styles/base.css'
import './styles/transitions.css'
import './utils/theme.js'  // 掛載前先套用深淺色，避免閃一下淺色
import App from './App.vue'
import router from './router/index.js'
import i18n from './locales/index.js'

createApp(App).use(router).use(i18n).mount('#app')