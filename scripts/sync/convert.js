export function toRecords(rows, fields) {
  const [headers = [], ...body] = rows
  return body
    .filter((row) => !isBlankRow(row))
    .map((row) => {
      const record = {}
      for (const [name, type] of Object.entries(fields)) {
        const col = headers.indexOf(name)
        record[name] = convert(col === -1 ? '' : row[col], type)
      }
      return record
    })
}

// schema 裡有、試算表標題列却找不到的欄位（通常是標題被改名或打錯）
export function missingFields(rows, fields) {
  const headers = rows[0] ?? []
  return Object.keys(fields).filter((name) => !headers.includes(name))
}

// 整列都沒有內容：空字串、沒有值，或未勾的核取方塊（false）
function isBlankRow(row) {
  return row.every((cell) => cell === '' || cell == null || cell === false)
}

function convert(value, type) {
  const blank = value === '' || value == null
  if (type === 'number') return blank ? null : Number(value)
  if (type === 'bool') return value === true || String(value).toUpperCase() === 'TRUE'
  if (type === 'date') return blank ? '' : toDate(value)
  return blank ? '' : String(value).trim()
}

// 試算表的日期 → 'YYYY-MM-DD'
// 試算表內部用「1899-12-30 起算的天數」存日期；手打成文字的（例如 2026/8/5）也處理
function toDate(value) {
  if (typeof value === 'number') {
    const DAYS_1899_TO_1970 = 25569
    const ms = Math.round((value - DAYS_1899_TO_1970) * 24 * 60 * 60 * 1000)
    return new Date(ms).toISOString().slice(0, 10)
  }
  const match = String(value).trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (!match) return String(value).trim() // 看不懂的格式原樣保留，交給 validate.js 報錯
  const [, y, m, d] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}