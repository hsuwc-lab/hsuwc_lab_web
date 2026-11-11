# 人機共生與智慧服務研究室網站 — 專案說明

這份文件記錄本專案的目標、架構與所有已確定的設計決策。開始任何工作前請先讀完；與本文件衝突的做法請先詢問。

- 視覺參考稿：`docs/reference/`（用瀏覽器直接開啟）
  - `light-home.html`：首頁與全站風格的主要參考
  - `light-inner-pages.html`：**只參考**內頁的淺藍標題帶與白色內容區（該檔的導覽列與 Footer 是舊版，不採用；導覽列與 Footer 以本文件為準）
  - `intro-options.html`：**只採用 A 版（淺色）**
- 參考稿與本文件不同之處，一律以本文件為準（見各節的「與參考稿不同之處」）

## 工作方式

- 這個專案由我（開發者）邊學邊實作。**除非我明確要求你直接完成，否則先說明做法、步驟與理由，讓我自己動手**
- 依「開發順序」一個部分一個部分進行，每部分完成後先確認再進下一步
- 不確定的設計決策先問，不要自行改變本文件的架構或規格
- 回覆與程式註解使用**台灣正體中文**（「專案」「網路」「應用程式」，不用「項目」「網絡」「應用程序」）
- 資料欄位以 **Google 試算表的「欄位規格」分頁為準**；試算表有變動時，本文件與 README 必須同步更新

## 專案目標

為實驗室建立一個**可維護 5～10 年**的官網：

1. **內容更新零程式**：教授介紹、論文、成員、消息、計畫、專欄都由 Google 試算表、Google 文件與雲端硬碟維護，學弟妹不需要會 Git 或 Node
2. **沒有後端、沒有資料庫服務**：不依賴可能取消的免費額度
3. **好交接**：repo 屬於實驗室的 GitHub Organization（hsuwc-lab），不屬於個人
4. **中英文雙語**

## 架構（已確定，不要改成有後端或資料庫的版本）

```
Google 試算表 / Google 文件 / 雲端硬碟（內容來源，管理者只碰這裡）
        │  GitHub Actions：每天排程＋可手動 Run workflow
        ▼
scripts/sync：讀試算表 → JSON；下載照片 → 壓縮；Google 文件 → HTML
        ▼
寫入 repo（src/data/*.json、public/images/**）→ Vite build → GitHub Pages
        ▼
Vue 前端只讀 repo 內已存好的 JSON 與圖片（執行期不呼叫任何 Google API）
```

- **目前先做前端**：同步腳本在開發順序第 7 部分才做，在此之前 `src/data/` 放手寫的假資料，**欄位名稱與格式必須和試算表一致**
- 網站執行期不即時讀 Google；Google 出問題時網站仍顯示最後一次同步的內容
- 同步完成後 `src/data/` 由腳本產生，不手動編輯
- 同步腳本只新增／更新照片，不因雲端少了檔案就刪除 repo 內的照片
- 同步腳本只輸出試算表中明確定義的欄位，避免誤放的個資被公開
- **程式碼裡不寫死任何內容**（包含實驗室名稱、教授介紹）；只有介面文字（選單、按鈕、區塊標題）放在 `src/locales/`

## 技術選擇

- **JavaScript**（不用 TypeScript，方便學弟妹接手）
- **Vue 3 + Vite + Vue Router + vue-i18n**
- CSS 自行撰寫，以 CSS 變數管理設計 token；**不使用 Bootstrap 或其他 UI 框架**
- 部署：**GitHub Pages**，由 GitHub Actions 建置部署（不用手動部署腳本）
- Router 使用 history 模式，並為 GitHub Pages 產生 `404.html` SPA fallback，讓重新整理與直接連結內頁不會 404
- 套件版本鎖定（`package-lock.json`）、Actions 內固定 Node LTS 版本、依賴越少越好

## 專案目錄

```
src/
├── components/   可重複使用的 UI 元件（NavBar、SiteFooter、PageHeader、NewsList、TeamScroller…）
├── layouts/      頁面版型（IntroLayout：無導覽列全螢幕；MainLayout：導覽列＋Footer）
├── views/        各路由頁面
├── router/       路由設定
├── data/         內容資料 JSON（目前手寫假資料，之後由同步腳本產生）
├── locales/      zh.json、en.json 介面文字
├── assets/       Logo、圖示、預設頭像等程式附帶的靜態資源
├── styles/       tokens.css（設計變數）、base.css（全域樣式）
└── utils/        資料整理函式（排序、篩選、語言切換）
public/images/    照片（教授、成員、專欄圖片）
public/og-image.png  分享預覽圖（待製作）
scripts/sync/     同步腳本（第 7 部分）
docs/reference/   視覺參考稿
```

## 網站結構與路由

網站分兩部分：**Intro Page**（獨立全螢幕品牌入口）與 **Main Website**。正式頁面網址都帶語言前綴；切換語言時只換前綴，停留在同一頁（含詳情頁）。

| 路由 | 頁面 |
| --- | --- |
| `/` | 進站判斷：第一次造訪 → `/intro`；之後 → `/zh/`（或依瀏覽器語言選 `/en/`） |
| `/intro` | Intro Page（任何時候都可進入） |
| `/:lang/` | 首頁 |
| `/:lang/professor` | 指導教授：介紹 |
| `/:lang/professor/column`、`/:lang/professor/column/:id` | 指導教授：專欄列表與單篇文章 |
| `/:lang/professor/publications` | 指導教授：研究著作 |
| `/:lang/people` | 研究團隊 |
| `/:lang/projects`、`/:lang/projects/:id` | 研究計畫列表與詳情 |
| `/:lang/news` | 消息與獲獎 |

導覽列主選單：首頁、指導教授（下拉：介紹、專欄、研究著作）、研究團隊、研究計畫、消息與獲獎。

### Intro Page

參考 `intro-options.html` 的 **A 版（淺色）**。

- 全螢幕、淺藍灰底（`--color-bg-soft`），內容置中，不使用 MainLayout
- 由上而下：系所小標籤（settings `department`）、實驗室英文全名（Georgia 大字）、中文全名、短分隔線、Research Areas 小標籤與三大研究領域（三欄，細線分隔）、Explore 按鈕 → 首頁
- 底部一行學校與系所（不設「略過 Skip」，進入首頁只靠 Explore 按鈕）
- **只在第一次造訪 `/` 時自動顯示**（以 localStorage 記錄；讀寫包 try/catch，失敗時當作已看過，不要卡住使用者）
- 從外部連結直接進入內頁時不經過 Intro
- **導覽列與 Footer 的 Logo 點擊都會回到 `/intro`**，讓使用者隨時能再看到 Intro

## 首頁規格

以 `light-home.html` 為視覺依據。區塊順序：

**導覽列 → Hero → 研究領域 → 教授與團隊 → 最新消息 → Footer**

### 1. 導覽列（全站共用）

- **深藍背景（`--color-navy`，同 Footer）、白色文字**，底部一條半透明白色細分隔線；捲動時固定在頂部
- 選單文字為 80% 不透明度的白色，目前所在頁面為純白＋白色底線；電腦版下拉選單維持白底深字
- 左：品牌區（Logo 尚未設計，先只放文字）。第一行為實驗室簡稱（settings `lab_short_name`，Georgia），第二行為目前語言的實驗室全名（小字、次要文字色）；簡稱空白時第一行改顯示全名
- 中：主選單，目前所在區段以純白粗體＋白色底線標示；「指導教授」有下拉選單
- 右：中文／EN 切換、搜尋圖示（第一版只保留外觀，標示「即將推出」）
- 960px 以下收合成選單按鈕

### 2. Hero

- 淺藍灰底（`--color-bg-soft`），底部細分隔線；高度依內容，不佔滿整個螢幕
- 左欄：
  - 大標題：目前語言的實驗室全名（中文頁顯示中文名，英文頁顯示英文名；Georgia，細字重）
  - 副標：另一語言的全名（Georgia 斜體、輔助藍）
  - 介紹文字（settings `hero_intro`）
  - 兩個按鈕：「探索研究領域」（深藍實心，捲到研究領域）、「最新消息」（深藍外框，捲到最新消息）
- 右欄：左側細分隔線，三組實驗室資訊（小標籤＋內容）
  - 主持人：教授中英文姓名與職稱（professor 基本資料 `name`、`title`；姓名依「人名顯示規則」）
  - 研究方向：三個研究領域名稱
  - 地點：settings `address`，有 `map_url` 時加「在 Google 地圖開啟」連結
- 960px 以下改為單欄，右欄資訊移到下方並改用上方分隔線

### 3. 研究領域

- 小標籤 OUR FOCUS ＋標題「研究領域」＋一行介紹（settings `research_intro`）
- 三欄排列，上方一條深藍粗線，欄與欄之間以細線分隔（**不用卡片、不用毛玻璃**）
- 每欄：簡潔線條圖示（research `icon`，深藍細線、無填色）、領域名稱（Georgia）、一至兩行介紹、底部「相關計畫 →」
- 整欄可點擊，連到研究計畫頁並以該領域篩選（依 projects 的 `area`）
- 720px 以下改為單欄，以上方細線分隔

與參考稿不同：參考稿用 01／02／03 編號，**實作改用 research `icon` 的線條圖示**。

### 4. 教授與團隊

左右雙欄，中間細分隔線，呈現「教授帶領研究團隊」的關係；路由上指導教授與研究團隊仍是獨立頁面。

- 左欄「指導教授」：教授照片（直式 4:5、小圓角；沒有照片時顯示淺藍佔位）、中文姓名（Georgia）、英文姓名（有才顯示）、職稱、「View Profile」外框按鈕 → 教授介紹頁
- 右欄「研究團隊」：**現任博士生與碩士生圓形頭像橫向捲動**
  - 成員：members 中 `status = current`、`degree` 為 `phd` 或 `ms`、且 `show` 勾選者（交換生、專題生、校友不在首頁顯示）
  - 排序：博士生 → 碩士生；同身分依 `entry_year` 由早到晚（碩二排在碩一前）
  - 一次顯示四位，頭像尺寸固定不縮小；橫向捲動＋CSS scroll-snap，每次停在完整頭像上；720px 以下一次約顯示兩個半
  - 每格由上而下：圓形頭像（沒有照片時顯示 `src/assets/default-avatar.svg` 預設頭像）、中文姓名、英文姓名（沒有英文名時保留一行空白，讓學籍身分維持對齊）、學籍身分（依語言，例如 碩士生／M.S. Student）
  - **最後一格為「Join us? View Our Team!」**：虛線圓框＋「+」，連到 `/:lang/people#join`
  - 下方可拖曳的捲動條顯示目前位置；電腦版右上有左右箭頭按鈕，手機版用手指滑動
  - 成員少於四位、內容不超出容器時，不顯示捲動條與箭頭
  - 支援鍵盤左右鍵與 aria 標籤
- 首頁不列出歷屆成員
- 960px 以下改為上下排列

### 5. 最新消息

- 淺藍灰底區塊；小標籤 LATEST NEWS ＋標題「最新消息」，右上「View All」連結 → 消息與獲獎頁
- **只顯示最新三則，三則都是純文字橫向資訊列，佔滿區塊寬度**
- 每列：日期（等寬數字）、分類標籤、標題、右側箭頭；列與列之間細分隔線
- 分類：News、Event、Award、Publication，各用一組低飽和度的底色＋文字色（見色彩表）
- **完全不使用圖片**
- 720px 以下：日期與標籤一行、標題換到下一行

### 6. Footer（全站共用）

- 深藍背景、淺色文字，簡潔正式
- 品牌區（同導覽列，點擊回 `/intro`）、主要頁面連結、Email（以文字顯示）、地址與「在 Google 地圖開啟」
- 最底部一行：Copyright（settings `copyright`，年份自動產生）與「最後更新：YYYY-MM-DD」
- **只放有實際連結的圖示**，沒有真實帳號的社群圖示一律不放

### 首頁與參考稿不同之處（以這裡為準）

- 導覽列改為深藍底白字（參考稿是白色導覽列）
- 區塊順序改為「研究領域 → 教授與團隊 → 最新消息」（參考稿是研究領域 → 消息 → 教授與團隊）
- 名稱「HCI Lab」等皆為佔位，實際取自 settings
- 研究領域使用線條圖示，不用編號
- 團隊成員數量依實際資料，最後一格連到 `#join`

## 內頁規格

### 共用版型

參考 `light-inner-pages.html` 的標題帶與內容區。

- **淺藍標題帶**（`--color-bg-soft`，底部細分隔線）：麵包屑（第二層頁面才有）、小標籤、頁面標題、可選的一行說明
- **白色內容區**：深色文字、淺灰分隔線
- 導覽列與 Footer 同首頁（深藍導覽列、深藍 Footer）

### 指導教授：介紹

照片、姓名與職稱、簡介、學歷、經歷、研究專長、開設課程、學術服務、Office Hours、聯絡資訊（含實驗室地址與地圖連結）。學歷與經歷顯示期間（professor `period`）。

### 指導教授：專欄

- 列表：發布日期、標題、摘要，可依系列與標籤篩選；只顯示 `publish` 勾選的文章
- 單篇文章頁：標題、作者（`author_ids` 空白代表教授）、日期、系列、內文（中英文版）、原文連結、分享按鈕（複製連結、LINE、Facebook）、同系列其他文章
- 某語言沒有版本時顯示另一語言的版本

### 指導教授：研究著作

- 依年份分組，可依年份與類型篩選
- 每筆：標題、作者、期刊或會議與卷期頁、類型標籤、作者角色、收錄等級
- 「閱讀論文」按鈕：有 `doi` 時連到 `https://doi.org/<doi>`，否則用 `url`，都沒有就不顯示
- 論文標題、作者、期刊名保留原文，不翻譯

**專欄與研究著作是兩個分開的列表與頁面，不可混在一起。**

### 研究團隊

- **現任成員**：依學籍身分分組（博士生、碩士生、交換生、專題生，順序同首頁），每人顯示照片、中英文姓名、學籍身分（不顯示個人研究興趣）
- **歷屆畢業生**：只列 `degree` 為 `phd` 或 `ms` 的校友（交換生、專題生離開後不列入）；依畢業級別（`class_of`）由新到舊分組，身分顯示為「113 級校友」／「Alumni, Class of 2025」；中英文姓名與碩博士論文題目，有 `thesis_url` 時連到臺灣博碩士論文知識加值系統
- **想加入實驗室？**：頁面最下方，見「全站功能」

### 研究計畫

- 分「執行中」與「已結案」兩組（依 `status`）
- 每個計畫：名稱、執行期間、主持人、補助單位、計畫編號（有填才顯示）、摘要
- 詳情頁：另顯示詳細介紹、研究成果、參與成員（連到研究團隊）、相關論文（publications 的 `project_id`）
- 支援以研究領域篩選（從首頁研究領域進入時帶入）
- **不使用計畫圖片**

### 消息與獲獎

完整消息，依日期新到舊排列，可依分類與年份篩選，有摘要時顯示。不使用圖片。

### 搜尋

導覽列保留搜尋圖示。第一版只做外觀；之後以前端搜尋（例如 MiniSearch）搜尋論文、專欄、消息、成員、計畫，不需要後端。

### 暫時不做（之後再加）

招生資訊頁（admissions）、實驗室生活相簿（gallery）。架構上預留即可。

## 全站功能

### 加入實驗室（Join us）

- 研究團隊頁最下方設「想加入實驗室？」區塊，元素 id 為 `join`
- 文字取自 settings `join_text`（中英文），下方顯示聯絡 Email（settings `email`）
- 首頁「Join us? View Our Team!」連到 `/:lang/people#join`，進頁後自動捲到該區塊
- `join_text` 空白時不顯示這個區塊

### 子選單與麵包屑

- 指導教授的三個子頁面（介紹、專欄、研究著作）：淺藍標題帶底部顯示分頁切換，目前頁面以底線標示
- 第二層頁面（教授子頁面、計畫詳情、專欄文章）在標題上方顯示麵包屑，例如「指導教授 › 研究著作」
- 第一層頁面（研究團隊、研究計畫、消息與獲獎）不顯示麵包屑

### 內容更新日期

- 同步腳本每次執行時寫入 `src/data/meta.json` 的 `updated_at`（台北時間）
- Footer 顯示「最後更新：2026-11-08」／「Last updated: 2026-11-08」
- 同步腳本完成前沒有這個檔案，此時不顯示

### 分頁標題與分享預覽

- 每頁瀏覽器分頁標題：「頁面名稱｜實驗室簡稱」；首頁只顯示實驗室全名；依目前語言切換
- 切換語言時同步更新 `<html lang>`（`zh-Hant`／`en`）
- `index.html` 設定 Open Graph 標籤（og:title、og:description、og:image），供 LINE、Facebook 分享預覽
- 預覽圖 `public/og-image.png`，1200×630，內容為實驗室名稱的簡單文字圖（**待 Logo 與簡稱確定後製作**）
- 限制：網站是單頁應用，社群平台不執行 JavaScript，所有頁面分享時顯示同一組預覽，這是可接受的

### 實驗室位置

- Footer、Hero 右欄、教授介紹頁的聯絡資訊都顯示地址（settings `address`）
- 有 `map_url` 時加「在 Google 地圖開啟」連結，以新分頁開啟，**不內嵌地圖**
- `map_url` 空白時只顯示地址

## 雙語

- 支援 `zh`（繁體中文）與 `en`；介面文字用 vue-i18n（`src/locales/zh.json`、`en.json`）
- 內容資料使用 `_zh`／`_en` 欄位；**某語言欄位空白時顯示另一語言的內容**，不要出現空白區塊（人名例外，見下方「人名顯示規則」）
- 論文標題、作者、期刊名保留原文
- 試算表中的代碼值（例如 `phd`、`journal`、`Award`）在畫面上一律透過 i18n 轉成顯示文字

### 人名顯示規則

- 教授與成員的姓名**固定同時顯示中英文，不隨語言切換**：中文姓名在上、英文姓名在下
- 沒有英文姓名（`name_en` 空白）時只顯示中文，不以中文代替英文
- 學籍身分、職稱等其他文字仍依目前語言顯示
- 學籍身分顯示文字：

| 代碼 | 中文 | 英文 |
| --- | --- | --- |
| `phd` | 博士生 | Ph.D. Student |
| `ms` | 碩士生 | M.S. Student |
| `exchange` | 交換生 | Exchange Student |
| `undergrad` | 專題生 | Undergraduate Researcher |
| 校友（`status = alumni`） | 113 級校友 | Alumni, Class of 2025 |

- 校友年度：`class_of` 填民國學年；中文直接顯示「{class_of} 級校友」，英文換算為西元畢業年（`class_of + 1912`，例如 113 學年度於 2025 年畢業）

## 視覺設計規範

風格：**Light Editorial Academic**——白底、深藍文字、以細線與留白區分層次，學術、穩重、乾淨。

### 色彩（寫在 `src/styles/tokens.css`）

| 變數 | 色碼 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#FFFFFF` | 頁面背景、下拉選單 |
| `--color-bg-soft` | `#F4F7FA` | Intro、Hero、內頁標題帶、最新消息區塊 |
| `--color-navy` | `#1E3550` | 標題、主要按鈕、導覽列與 Footer 背景 |
| `--color-blue` | `#2D6497` | 連結、小標籤、底線、副標 |
| `--color-blue-soft` | `#E7EFF7` | hover 底色、頭像與照片佔位底色 |
| `--color-text` | `#1C2530` | 主要文字 |
| `--color-text-muted` | `#566474` | 次要文字、日期 |
| `--color-rule` | `#DCE3EB` | 分隔線、邊框 |

消息分類標籤（低飽和度，底色／文字色）：

| 分類 | 底色 | 文字色 |
| --- | --- | --- |
| News | `#E7EFF7` | `#2D5A86` |
| Event | `#E8F2EC` | `#2F6B4A` |
| Award | `#F6EEDF` | `#7A5A1E` |
| Publication | `#EEEBF5` | `#4F4680` |

Footer 文字使用淺色（例如 `#C9D5E2`、`#A9BACB`），需維持足夠對比。

### 字體（寫在 `src/styles/tokens.css`）

全站只用系統內建字體，**不載入任何外部字體或中文網頁字體**（各平台都有內建、不依賴外部服務、中文字型檔動輒數 MB）。

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
             "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
--font-display: Georgia, "Times New Roman",
                "PingFang TC", "Microsoft JhengHei", serif;
```

- `--font-sans`：內文、選單、按鈕、表單
- `--font-display`：大標題、區塊標題、實驗室名稱、人名。英文顯示為 Georgia（macOS 與 Windows 皆內建），中文自動退回蘋方／微軟正黑體
- 大標題使用細字重（400 以下）；小型英文標籤全大寫、字距加寬、輔助藍色

### 元件樣式

- 主要按鈕：深藍實心、白字、圓角 4px；hover 變輔助藍
- 次要按鈕：深藍外框、透明底；hover 淺藍底
- 文字連結（View All 等）：輔助藍＋底線
- 圓角一律小（4px）；頭像為圓形

### 禁止事項

- **不使用**：幾何裝飾圖形、網絡線條、光暈、漸層色塊、毛玻璃（backdrop-filter）、陰影堆疊
- **不使用**：圖庫照片、技能百分比條、空泛文案、假連結、送不出去的表單
- 避免過度圓潤的 SaaS 模板風格

### 版面

- 內容最大寬度約 1120px，左右至少 16px 邊距
- 斷點：960px（導覽列收合、雙欄改單欄）、720px（三欄改單欄、消息列改兩行）
- 區塊之間以留白與細線分隔，不用大面積色塊

### 圖片使用原則

- 圖片只用於：教授照片、現任成員照片、專欄文中圖片
- 消息、研究計畫、研究領域不使用圖片
- 沒有照片時顯示淺色佔位；任何區塊在圖片不足時都要保持完整
- 所有照片放在 `public/images/`，之後由同步流程管理

## 資料欄位

以 Google 試算表的「欄位規格」分頁為準，以下為前端目前會用到的分頁與欄位。`src/data/` 的假資料必須使用相同欄位名稱。

| 分頁（JSON 檔） | 欄位 |
| --- | --- |
| settings | `key`、`value_zh`、`value_en`、`note`（一列一個設定，見下表） |
| professor | `section`、`key`、`order`、`period`、`text_zh`、`text_en` |
| research | `id`、`order`、`title_zh`、`title_en`、`desc_zh`、`desc_en`、`icon` |
| members | `id`、`name_zh`、`name_en`、`status`、`degree`、`entry_year`、`class_of`、`photo`、`thesis_title_zh`、`thesis_title_en`、`thesis_url`、`show` |
| projects | `id`、`status`、`title_zh`、`title_en`、`start`、`end`、`pi_zh`、`pi_en`、`funder_zh`、`funder_en`、`project_no`、`area`、`summary_zh`、`summary_en`、`description_zh`、`description_en`、`outcomes_zh`、`outcomes_en`、`member_ids` |
| publications | `id`、`year`、`type`、`title`、`authors`、`venue`、`details`、`doi`、`url`、`author_role`、`index`、`area`、`project_id`、`tags` |
| news | `id`、`date`、`category`、`title_zh`、`title_en`、`summary_zh`、`summary_en`、`link` |
| columns | `id`、`date`、`series_zh`、`series_en`、`title_zh`、`title_en`、`summary_zh`、`summary_en`、`doc_zh`、`doc_en`、`author_ids`、`tags`、`original_url`、`publish` |
| meta（自動產生） | `updated_at` |

### settings 的 key

| key | 用途 |
| --- | --- |
| `lab_name` | 實驗室全名（中：人機共生與智慧服務研究室／英：Human-AI Symbiosis & Smart Services Lab） |
| `lab_short_name` | 導覽列、Footer、分頁標題用的簡稱（待確認） |
| `department` | 系所名稱，Intro 頂端小標籤與底部一行 |
| `subtitle` | 副標題（目前頁面未使用） |
| `hero_intro` | Intro 與 Hero 的介紹文字 |
| `research_intro` | 首頁研究領域的一行介紹 |
| `email` | 聯絡信箱 |
| `address` | 實驗室地址 |
| `map_url` | Google 地圖連結 |
| `join_text` | 研究團隊頁「想加入實驗室？」的說明 |
| `copyright` | Footer 版權文字（年份自動產生） |

### 代碼值

| 欄位 | 可用值 |
| --- | --- |
| professor `section` | 基本資料、簡介、學歷、經歷、研究專長、開設課程、學術服務、Office Hours、聯絡資訊 |
| professor `key`（基本資料） | `name`、`title`、`photo`、`short_bio` |
| research `icon` | `users`、`chip`、`heart`、`chart`、`book` |
| members `status` | `current`、`alumni` |
| members `degree` | `phd`（博士生）、`ms`（碩士生）、`exchange`（交換生）、`undergrad`（專題生） |
| projects `status` | `ongoing`、`completed` |
| publications `type` | `journal`、`conference`、`book`、`chapter` |
| publications `author_role` | `first`、`corresponding`、`first_corresponding`、`co_author` |
| news `category` | `News`、`Event`、`Award`、`Publication` |

### 填寫格式

- 日期：`2025-04-15`；年月：`2025-08`
- 多個值：半形逗號分隔、不加空格（例如 `hci,healthcare`）
- 勾選欄位：試算表中為核取方塊（TRUE／FALSE），JSON 中為布林值 `true`／`false`
- 資料關聯：`projects.member_ids → members.id`、`publications.project_id → projects.id`、`projects.area`／`publications.area → research.id`、`columns.author_ids → members.id`
- id 上架後不可修改（網址與資料關聯都靠它）

## 帳號與環境

- GitHub：`hsuwc-lab/hsuwc_lab_web`
- Google：開發期使用個人帳號的測試資料；正式上線搬到實驗室共用帳號，屆時只需更新同步設定（試算表 ID、資料夾 ID、金鑰）
- Google 存取使用 Service Account，金鑰放在 GitHub Secrets，**絕不 commit 到 repo**

## 開發順序

1. 搬移舊 repo、建立新 repo（完成）
2. 撰寫規格文件：本文件、README、視覺參考稿（完成）
3. 建立專案骨架：Vite＋Vue、Vue Router（語言前綴與 Intro 規則）、vue-i18n、`tokens.css`、`base.css`
4. 共用版型：MainLayout（導覽列、Footer）、IntroLayout、PageHeader（標題帶、麵包屑、子選單）
5. 首頁各區塊（使用假資料）
6. 內頁：指導教授（介紹、專欄、研究著作）、研究團隊、研究計畫、消息與獲獎
7. 試算表定案與同步腳本
8. GitHub Actions 自動同步與部署（含 `404.html` fallback）
9. 文件與交接：README（「我只是要更新內容」與「我要改版面」）、試算表說明分頁