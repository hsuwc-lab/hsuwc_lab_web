# 開發者指南：我要改版面

只要更新內容請看 [README](../README.md)。設計決策與規格在 [CLAUDE.md](../CLAUDE.md)。

## 架構

```
Google 試算表／雲端硬碟（內容來源）
        │  GitHub Actions：每天凌晨 3:17（台灣）＋手動 Run workflow
        ▼
scripts/sync：試算表 → src/data/*.json；照片 → public/images/；Google 文件 → HTML
        │  機器人 commit 回 repo
        ▼
Vite build → GitHub Pages
```

不能打破的規則：

- **網站執行時不能叫 Google**。前端只讀 repo 裡的 JSON 與圖片
- **`src/data/` 不要手改**，下次同步就會被蓋掉
- 同步只輸出 `scripts/sync/schema.js` 列出的欄位（避免個資外洩）
- 同步不刪照片；介面文字放 `src/locales/`，內容不寫死在程式裡

## 目錄

```
src/components/  可重複使用的元件
src/layouts/     IntroLayout（全螢幕）、MainLayout（導覽列＋Footer）
src/views/       各頁面
src/router/      路由（語言前綴、Intro 規則）
src/data/        同步產生的 JSON（不手改）
src/locales/     zh.json、en.json 介面文字
src/styles/      tokens.css（顏色、字體）、base.css
public/images/   同步下載的照片
scripts/sync/    同步腳本（config.js 放試算表與資料夾 id）
.github/workflows/deploy.yml  同步＋部署
docs/templates/  試算表範本 CSV
```

## 本機開發

需要 Node 22。

```bash
git clone https://github.com/hsuwc-lab/hsuwc_lab_web.git
cd hsuwc_lab_web
npm ci            # 依 package-lock.json 安裝，版本和大家一樣
npm run dev       # http://localhost:5173/hsuwc_lab_web/
```

只改版面不需要同步，repo 裡已經有最新的 JSON。

**每次開始改之前先 `git pull`**：機器人每天會 commit 新資料。

### 本機跑同步（選用）

1. 請管理者給你 Service Account 金鑰 JSON，放在 `secrets/service-account.json`（已在 `.gitignore`，**絕不 commit**）
2. 建 `.env`：`GOOGLE_APPLICATION_CREDENTIALS=secrets/service-account.json`
3. `npm run sync`

## 常見改動

### 加一個資料欄位

1. 試算表加欄（第一列寫欄位名稱）
2. `scripts/sync/schema.js` 對應分頁的 `fields` 加上名稱與型別（text／number／bool／date）
3. 頁面元件顯示它；有中英文就加 `_zh`、`_en`
4. 更新 `docs/templates/` 的 CSV 與試算表「說明」分頁

### 改顏色、字體

只改 `src/styles/tokens.css`，不要在元件裡寫色碼。

### 加介面文字

`src/locales/zh.json` 與 `en.json` 要**同時**加同一個 key。

## 帳號與金鑰

| 東西 | 在哪裡 |
| --- | --- |
| 內容 | 研究室共用 Google 帳號的「Lab website」資料夾 |
| Service Account | 同一個 Google 帳號的 Google Cloud 專案 |
| 金鑰 | GitHub repo → Settings → Secrets → `GOOGLE_SERVICE_ACCOUNT_KEY` |
| 表單與 Apps Script | 「網站資料－教授維護」→ 擴充功能 → Apps Script |

共用帳號密碼由上一屆當面交接，不寫在文件裡。

- **換金鑰**：Google Cloud → IAM → 服務帳戶 → 金鑰，刪舊建新 → GitHub Secret 按 Update 貼上新 JSON
- **搬帳號**：複製試算表與資料夾 → 分享給 Service Account（檢視者）→ 改 `scripts/sync/config.js` 的 id → Apps Script 重新授權並重設表單觸發器
- **重建試算表**：
1. 檔案 → 匯入 → 上傳 docs/templates/ 的 CSV →『插入新工作表』→ 分頁名稱改成和檔名一樣。匯入後要依『選項』分頁重新設定下拉選單、id 驗證公式與核取方塊（show、publish）。
2. 匯入 CSV 後要補回的設定：

先建「選項」分頁（下拉選單都從這裡讀），第一列是標題：
A 欄 professor_section：基本資料、簡介、學歷、經歷、研究專長、開設課程、學術服務、Office Hours、聯絡資訊
B 欄 member_status：current、alumni
C 欄 degree：phd、ms、exchange、undergrad
D 欄 project_status：ongoing、completed
E 欄 news_category：News、Event、Award、Publication
F 欄 icon：users、chip、heart、chart、book、cart

各分頁（選取整欄第 2 列以下 → 資料 → 資料驗證，勾「拒絕輸入」）：
research.icon：下拉選單（範圍）='選項'!$F$2:$F$7
members.id：自訂公式 =AND(REGEXMATCH(A2, "^m-\d{4}-[a-z]+-[a-z]+[0-9]?-(phd|ms|exchange|undergrad)$"), COUNTIF($A$2:$A$1000, A2) = 1)
members.status：下拉選單（範圍）='選項'!$B$2:$B$10
members.degree：下拉選單（範圍）='選項'!$C$2:$C$5
members.show：插入 → 核取方塊
projects.id：自訂公式 =AND(REGEXMATCH(A2, "^p-\d{6}-[a-z0-9]+$"), COUNTIF($A$2:$A$1000, A2) = 1)
projects.status：下拉選單（範圍）='選項'!$D$2:$D$1000
news.id：自訂公式 =AND(REGEXMATCH(A2, "^n-\d{8}-\d+$"), COUNTIF($A$2:$A$999, A2) = 1)
news.date：日期 → 有效日期
news.category：下拉選單（範圍）='選項'!$E$2:$E$1000
columns.date（教授試算表）：日期 → 有效日期
columns.publish（教授試算表）：插入 → 核取方塊

教授試算表的 publications、columns 第一列最後要保留 edit_url 欄

- **定時被停用**：60 天沒有活動會被停用，Actions → Enable workflow