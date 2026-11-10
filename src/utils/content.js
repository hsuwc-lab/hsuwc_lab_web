import settings from '../data/settings.json'

// 取出某列資料在指定語言的欄位；該語言空白時改用另一種語言
// 例：pick(row, 'title', 'en') 會先找 title_en，沒有就找 title_zh
export function pick(row, field, lang) {
  if (!row) return ''
  const other = lang === 'zh' ? 'en' : 'zh'
  return row[`${field}_${lang}`] || row[`${field}_${other}`] || ''
}

// 取出 settings 中某個 key 的值
export function getSetting(key, lang) {
  const row = settings.find((item) => item.key === key)
  return pick(row, 'value', lang)
}