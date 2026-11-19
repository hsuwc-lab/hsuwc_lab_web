// 同步主程式：npm run sync
import { mkdir, writeFile } from 'node:fs/promises'
import { SHEETS, DATA_DIR } from './config.js'
import { TABS } from './schema.js'
import { readSheets } from './google.js'
import { toRecords, missingFields } from './convert.js'
import { validate } from './validate.js'

async function main() {
  const data = {}
  const errors = []

  // 1. 讀試算表：每份試算表只發一次請求
  for (const [source, spreadsheetId] of Object.entries(SHEETS)) {
    const tabs = Object.entries(TABS).filter(([, tab]) => tab.from === source)
    const sheets = await readSheets(spreadsheetId, tabs.map(([name]) => name))

    // 2. 轉成物件陣列
    for (const [name, tab] of tabs) {
      const missing = missingFields(sheets[name], tab.fields)
      if (missing.length) errors.push(`${name}：試算表找不到欄位 ${missing.join('、')}（標題列被改名或打錯？）`)
      data[name] = toRecords(sheets[name], tab.fields)
    }
  }

  // 3. 檢查
  const result = validate(data)
  errors.push(...result.errors)
  result.warnings.forEach((w) => console.warn(`⚠️  ${w}`))

  if (errors.length) {
    errors.forEach((e) => console.error(`❌ ${e}`))
    console.error(`\n有 ${errors.length} 個錯誤，沒有寫入任何檔案。網站會繼續顯示上一次同步的內容。`)
    process.exit(1)
  }

  // 4. 拿掉不公開的列，寫入 JSON
  await mkdir(DATA_DIR, { recursive: true })
  for (const [name, tab] of Object.entries(TABS)) {
    const records = tab.keep ? data[name].filter(tab.keep) : data[name]
    await writeJson(`${DATA_DIR}/${name}.json`, records)
    console.log(`✅ ${name}.json：${records.length} 筆`)
  }
  await writeJson(`${DATA_DIR}/meta.json`, { updated_at: new Date().toISOString() })
  console.log('\n同步完成。')
}

// 每個檔案用同一種格式寫：縮排 2 格、結尾換行，git diff 才好讀
function writeJson(path, value) {
  return writeFile(path, JSON.stringify(value, null, 2) + '\n')
}

main().catch((err) => {
  console.error('❌ 同步失敗：', err.message)
  process.exit(1)
})