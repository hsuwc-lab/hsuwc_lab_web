import { createApp } from 'vue'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.vue'
import router from './router/index.js'
import i18n from './locales/index.js'

createApp(App).use(router).use(i18n).mount('#app')