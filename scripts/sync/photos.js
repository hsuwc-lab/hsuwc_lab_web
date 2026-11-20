// 照片：依檔名從雲端資料夾下載 → 裁切壓縮 → 存到 public/images/…
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { listFolder, downloadFile } from './google.js'

const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp'] // heic 等格式請維護者先轉檔

// names：試算表 photo 欄的檔名清單
// 回傳 { result: { 原檔名: 網站用的檔名或 '' }, warnings: […] }
export async function syncPhotos(names, { folderId, outDir, width, height }) {
  const result = {}
  const warnings = []
  const wanted = [...new Set(names.filter(Boolean))] // 去掉空白與重複
  if (!wanted.length) return { result, warnings }

  await mkdir(outDir, { recursive: true })
  const files = await listFolder(folderId) // 整個資料夾只列一次

  for (const name of wanted) {
    const output = toJpgName(name)

    // 1. 已經下載過：直接用（也代表雲端原圖被移走，網站照片還在）
    if (existsSync(`${outDir}/${output}`)) {
      result[name] = output
      continue
    }

    // 2. 雲端找不到或格式不支援：警告，空白
    const file = files.find((f) => f.name === name)
    if (!file) {
      warnings.push(`照片：雲端找不到「${name}」，先顯示預設頭像`)
      result[name] = ''
      continue
    }
    if (!SUPPORTED.includes(file.mimeType)) {
      warnings.push(`照片：「${name}」不是 jpg／png／webp（${file.mimeType}），請轉檔後再放`)
      result[name] = ''
      continue
    }

    // 3. 下載 → 轉正 → 裁切 → 壓縮 → 存檔
    try {
      const input = await downloadFile(file.id)
      const { width: w = 0, height: h = 0 } = await sharp(input).metadata()
      if (Math.min(w, h) < Math.min(width, height)) {
        warnings.push(`照片：「${name}」解析度偏低（${w}×${h}），網站上可能模糊`)
      }
      const jpg = await sharp(input)
        .rotate() // 依手機拍攝時的方向轉正
        .resize(width, height, { fit: 'cover', position: 'centre' }) // 從中央裁成指定比例
        .flatten({ background: '#ffffff' }) // png 的透明背景填白，否則轉 jpg 會變黑
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()
      await writeFile(`${outDir}/${output}`, jpg)
      result[name] = output
    } catch (err) {
      warnings.push(`照片：「${name}」處理失敗（${err.message}），先顯示預設頭像`)
      result[name] = ''
    }
  }
  return { result, warnings }
}

// 'abc.PNG' → 'abc.jpg'：網站上的照片一律是 jpg
function toJpgName(name) {
  return name.replace(/\.[^.]+$/, '') + '.jpg'
}