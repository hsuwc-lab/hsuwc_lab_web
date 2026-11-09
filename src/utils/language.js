export const LANGUAGES = ['zh', 'en']

// 依瀏覽器語言決定預設語言：中文系統用 zh，其他用 en
export function preferredLanguage() {
  const browser = (navigator.language || '').toLowerCase()
  return browser.startsWith('zh') ? 'zh' : 'en'
}