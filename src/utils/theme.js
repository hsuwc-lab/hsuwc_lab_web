// 深淺色模式：記錄在 localStorage；沒記錄時跟隨系統設定。讀寫失敗時維持淺色，不影響使用
import { ref } from 'vue'

const KEY = 'theme'

function initialTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const theme = ref(initialTheme())

function apply(value) {
  document.documentElement.dataset.theme = value
}
apply(theme.value)

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  apply(theme.value)
  try {
    localStorage.setItem(KEY, theme.value)
  } catch {
    // 無法儲存就算了，只是下次不會記得
  }
}
