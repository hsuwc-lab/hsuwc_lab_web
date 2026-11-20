// 專欄：Google 文件 → Markdown → HTML（文中圖片存到本機、清除不安全的標籤）
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import sharp from 'sharp'
import { exportDocMarkdown } from './google.js'

// 白名單：只留文章結構需要的標籤與屬性，script、iframe、style、onxxx 事件一律拿掉
const SANITIZE = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'em', 'del', 'a', 'ul', 'ol', 'li',
    'blockquote', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code',
  ],
  allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener' }) }, // 連結開新分頁
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src, // 沒有圖的 <img> 整個拿掉
}

// rows：已上架的專欄列（還帶著 doc_zh、doc_en）
// 回傳 { columns: [{ …, content_zh, content_en }], warnings: […] }
export async function buildColumns(rows, imagesDir) {
  const columns = []
  const warnings = []
  await mkdir(imagesDir, { recursive: true })
  for (const row of rows) {
    const { doc_zh, doc_en, ...rest } = row // 文件連結只在這裡用，不輸出
    const content_zh = await docToHtml(doc_zh, row.id, imagesDir, warnings)
    const content_en = await docToHtml(doc_en, row.id, imagesDir, warnings)
    columns.push({ ...rest, content_zh, content_en })
  }
  return { columns, warnings }
}

// 一個文件連結 → 清理好的 HTML；失敗時警告並回傳 ''（前端會顯示另一種語言）
async function docToHtml(link, columnId, imagesDir, warnings) {
  if (!link) return ''
  const docId = String(link).match(/\/d\/([\w-]+)/)?.[1]
  if (!docId) {
    warnings.push(`專欄 ${columnId}：看不懂的文件連結 ${link}`)
    return ''
  }
  try {
    const markdown = await exportDocMarkdown(docId)
    const html = await marked.parse(markdown)
    const withLocalImages = await saveImages(html, imagesDir, columnId, warnings)
    return sanitizeHtml(withLocalImages, SANITIZE)
  } catch (err) {
    warnings.push(`專欄 ${columnId}：讀不到文件（${err.message}）。文件要在實驗室帳號的「Lab website」資料夾裡`)
    return ''
  }
}

// 把 <img src="…"> 的圖片存到本機，src 換成 {{BASE}}images/columns/<檔名>
async function saveImages(html, imagesDir, columnId, warnings) {
  const srcs = [...new Set([...html.matchAll(/<img[^>]*?\ssrc="([^"]+)"/g)].map((m) => m[1]))]
  let result = html
  for (const src of srcs) {
    try {
      const jpg = await sharp(await readImage(src))
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true }) // 比 1200 寬才縮小，小圖不放大
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()
      const name = createHash('sha1').update(jpg).digest('hex').slice(0, 12) + '.jpg' // 同一張圖永遠同一個檔名
      await writeFile(`${imagesDir}/${name}`, jpg)
      result = result.replaceAll(`src="${src}"`, `src="{{BASE}}images/columns/${name}"`)
    } catch (err) {
      warnings.push(`專欄 ${columnId}：文中有一張圖片處理失敗（${err.message}），已略過`)
      result = result.replaceAll(`src="${src}"`, 'src=""') // 交給 sanitize 整個拿掉
    }
  }
  return result
}

// 圖片可能是 data:…;base64,…（內嵌文字）或一般網址
async function readImage(src) {
  const url = src.replaceAll('&amp;', '&') // HTML 裡的 & 會被寫成 &amp;，要還原才能用
  if (url.startsWith('data:')) return Buffer.from(url.split(',')[1], 'base64')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}