import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

const i18n = createI18n({
  legacy: false,          // 使用 Vue 3 的新寫法
  locale: 'zh',           // 預設語言（實際語言由網址決定）
  fallbackLocale: 'zh',   // 某個代號英文版沒寫時，顯示中文
  messages: { zh, en },
})

export default i18n