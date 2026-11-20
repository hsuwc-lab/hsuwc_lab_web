// 同步主程式：npm run sync
import { mkdir, writeFile } from 'node:fs/promises'
import { SHEETS, FOLDERS, PHOTO_SIZES, DATA_DIR, IMAGES_DIR } from './config.js'
import { TABS } from './schema.js'
import { readSheets } from './google.js'
import { toRecords, missingFields } from './convert.js'
import { validate } from './validate.js'
import { syncPhotos } from './photos.js'
import { buildColumns } from './columns.js'

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

  // 3. 檢查：有錯誤就停，什麼都不寫
  const result = validate(data)
  errors.push(...result.errors)
  const warnings = [...result.warnings]
  if (errors.length) {
    warnings.forEach((w) => console.warn(`⚠️  ${w}`))
    errors.forEach((e) => console.error(`❌ ${e}`))
    console.error(`\n有 ${errors.length} 個錯誤，沒有寫入任何檔案。網站會繼續顯示上一次同步的內容。`)
    process.exit(1)
  }

  // 4. 拿掉不公開的列（show 未勾的成員、草稿專欄）
  const output = {}
  for (const [name, tab] of Object.entries(TABS)) {
    output[name] = tab.keep ? data[name].filter(tab.keep) : data[name]
  }

  // 5. 照片：下載壓縮，並把 photo 換成網站用的檔名（處理不了的清空 → 預設頭像）
  const members = await syncPhotos(output.members.map((m) => m.photo), {
    folderId: FOLDERS.memberPhotos,
    outDir: `${IMAGES_DIR}/members`,
    ...PHOTO_SIZES.member,
  })
  output.members.forEach((m) => {
    m.photo = members.result[m.photo] ?? ''
  })

  const photoRow = output.professor.find((row) => row.section === '基本資料' && row.key === 'photo')
  const professor = await syncPhotos([photoRow?.text_zh], {
    folderId: FOLDERS.professorPhotos,
    outDir: `${IMAGES_DIR}/professor`,
    ...PHOTO_SIZES.professor,
  })
  if (photoRow) photoRow.text_zh = professor.result[photoRow.text_zh] ?? ''

  // 6. 專欄：文件轉成 content_zh／content_en
  const columns = await buildColumns(output.columns, `${IMAGES_DIR}/columns`)
  output.columns = columns.columns

  // 7. 印出全部警告，寫入 JSON
  warnings.push(...members.warnings, ...professor.warnings, ...columns.warnings)
  warnings.forEach((w) => console.warn(`⚠️  ${w}`))

  await mkdir(DATA_DIR, { recursive: true })
  for (const [name, records] of Object.entries(output)) {
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