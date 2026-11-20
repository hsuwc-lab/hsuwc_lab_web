# 人機共生與智慧服務研究室網站 — 專案說明

這份文件給接手維護的人和他們的 AI 助理（例如 Claude Code）閱讀，記錄本專案的目標、架構與已確定的設計決策。開始任何工作前請先讀完；與本文件衝突的做法，請先詢問目前的維護者。

- 網站：https://hsuwc-lab.github.io/hsuwc_lab_web/
- 給內容管理者：`README.md`（我只是要更新內容）
- 給開發者：`docs/DEVELOPER.md`（我要改版面：架構、本機開發、換金鑰與帳號）
- 試算表範本：`docs/templates/`（每個分頁一份 CSV）
- 視覺參考稿：`docs/reference/`（用瀏覽器直接開啟）
  - `light-home.html`：首頁與全站風格的主要參考
  - `light-inner-pages.html`：**只參考**內頁的淺藍標題帶與白色內容區（該檔的導覽列與 Footer 是舊版，不採用）
  - `intro-options.html`：**只採用 A 版（淺色）**
- 參考稿與本文件不同時，一律以本文件為準

## 給 AI 助理的工作方式

- 回覆與程式註解使用**台灣正體中文**（「專案」「網路」「應用程式」「程式碼」「預設」，不用「項目」「網絡」「應用程序」「代碼」「默認」）
- 動手修改前，先簡短說明要改哪些檔案、為什麼；架構或規格層級的改動（新增依賴、改資料欄位、改部署流程）必須先取得維護者同意
- 不確定的設計決策先問，不要自行改變本文件的架構或規格
- 規格有變動時，**三處同步**：本文件、`README.md`／`docs/DEVELOPER.md`、Google 試算表的「說明」「欄位規格」分頁（以及 `docs/templates/` 的 CSV）
- 程式碼註解寫「為什麼」，不只是「做什麼」；接手的人可能是剛學 Vue 的學生
- 開始改程式前先 `git pull`：GitHub Actions 的機器人每天會 commit 同步資料，不 pull 容易 push 被拒

## 專案目標

為實驗室建立一個**可維護 5～10 年**的官網：

1. **內容更新零程式**：教授介紹、論文、成員、消息、計畫、專欄都由 Google 試算表、Google 表單、Google 文件與雲端硬碟維護，管理者不需要會 Git 或 Node
2. **沒有後端、沒有資料庫服務**：不依賴可能取消的免費額度
3. **好交接**：repo 屬於實驗室的 GitHub Organization（`hsuwc-lab`），不屬於個人
4. **中英文雙語**

## 架構（已確定，不要改成有後端或資料庫的版本）

```
Google 試算表／Google 表單／Google 文件／雲端硬碟（內容來源，管理者只碰這裡）
        │  GitHub Actions：每天台灣時間凌晨 3:17 自動執行＋可手動 Run workflow
        ▼
scripts/sync：試算表 → src/data/*.json；照片 → 壓縮後存 public/images/；Google 文件 → HTML
        │  機器人（github-actions[bot]）commit 回 repo
        ▼
Vite build → GitHub Pages
        ▼
Vue 前端只讀 repo 內已存好的 JSON 與圖片（執行期不呼叫任何 Google API）
```

不能打破的規則：

- **網站執行期不即時讀 Google**；Google 出問題時網站仍顯示最後一次同步的內容
- **`src/data/` 由同步腳本產生，不要手動編輯**，下次同步就會被覆蓋
- 同步腳本只輸出 `scripts/sync/schema.js` 列出的欄位（白名單），避免誤放的個資被公開；試算表多出來的欄（備註、`edit_url`）一律不輸出
- 同步腳本只新增照片，不因雲端少了檔案就刪除 repo 內的照片（讓管理者能把舊原圖移出雲端）
- **程式碼裡不寫死任何內容**（包含實驗室名稱、教授介紹）；只有介面文字（選單、按鈕、區塊標題）放在 `src/locales/`

## 技術選擇

- **JavaScript**（不用 TypeScript，方便學弟妹接手）
- **Vue 3 + Vite + Vue Router + vue-i18n**
- CSS 自行撰寫，以 CSS 變數管理設計 token；**不使用 Bootstrap 或其他 UI 框架**
- 同步腳本：Node 22、google-auth-library（Service Account）、sharp（照片）、marked＋sanitize-html（專欄文件）
- 部署：**GitHub Pages**，由 GitHub Actions 建置部署（`.github/workflows/deploy.yml`，不用手動部署）
- Router 使用 history 模式，建置後複製 `index.html` 為 `404.html` 當 SPA fallback，讓重新整理與直接連結內頁不會 404
- 套件版本鎖定（`package-lock.json`，安裝用 `npm ci`）、Actions 內固定 Node 22、依賴越少越好

## 專案目錄

```
src/
├── components/   可重複使用的 UI 元件（NavBar、SiteFooter、PageHeader、ScrollRow、MemberCard、ThemeToggle…）
│   └── home/     首頁各區塊
├── layouts/      MainLayout（導覽列＋Footer）
├── views/        各路由頁面（IntroView 為全螢幕，不用 MainLayout）
├── router/       路由設定（語言前綴、Intro 規則）
├── data/         同步腳本產生的 JSON（不手動編輯）
├── locales/      zh.json、en.json 介面文字
├── assets/       預設頭像等程式附帶的靜態資源
├── styles/       tokens.css（設計變數，含深色模式）、base.css、transitions.css
└── utils/        資料整理函式（排序、篩選、語言、深淺色、Intro 記錄）
public/images/    同步下載的照片（members/、professor/、columns/）
scripts/sync/     同步腳本（config.js 放試算表與資料夾 id，schema.js 放欄位白名單）
.github/workflows/deploy.yml  同步＋建置＋部署
docs/             DEVELOPER.md、templates/（試算表範本 CSV）、reference/（視覺參考稿）
```

## 同步與部署

### 指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 本機開發（只改版面不需要同步，repo 已有最新 JSON） |
| `npm run sync` | 本機同步，讀 `.env` 的 `GOOGLE_APPLICATION_CREDENTIALS`（範例見 `.env.example`） |
| `npm run sync:ci` | Actions 用，不讀 `.env`，金鑰由 workflow 從 Secret 寫入 |
| `npm run build` | 建置 |

### deploy.yml 的行為

- `push` 到 main：只建置與部署，**不同步**
- `schedule`（cron `17 19 * * *`，UTC 19:17＝台灣 3:17）與 `workflow_dispatch`（手動 Run workflow）：同步 → 有變更才 commit → 建置 → 部署
- 金鑰：GitHub Secret `GOOGLE_SERVICE_ACCOUNT_KEY`，執行時寫到 `secrets/service-account.json`（已在 `.gitignore`）
- `concurrency.cancel-in-progress: false`：不中途取消同步
- 公開 repo 連續 60 天沒有活動，GitHub 會停用定時 workflow；到 Actions 按「Enable workflow」恢復

### 同步腳本的規則

- 檢查寫在 `scripts/sync/validate.js`
- **錯誤**（停止同步、不寫入任何檔案、exit 1）：id 空白或重複、數字欄不是數字、日期格式不對、members id 結尾和 `degree` 不一致、projects `member_ids` 有不存在的成員、professor「基本資料」少了 `name`／`title`／`photo` 列
- **警告**（印出但繼續）：`degree`／`icon` 不在選項裡、`area` 對不到 research（顯示為其他領域）、專欄作者不在 members、找不到照片（`photo` 輸出為空字串）
- 照片：同一個檔名只下載一次（已存在就跳過）；**換照片要換檔名**。成員 600×600、教授 800×1000，轉成 JPEG
- 專欄：Google 文件匯出 Markdown → HTML → sanitize-html 白名單過濾；文中圖片存 `public/images/columns/<hash>.jpg`，HTML 內寫 `{{BASE}}images/...`，由前端 `ColumnDetailView.vue` 換成 `import.meta.env.BASE_URL`
- `members` 只輸出 `show` 勾選者；`columns` 只輸出 `publish` 勾選者
- 每次同步寫入 `src/data/meta.json` 的 `updated_at`，Footer 顯示「最後更新」

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
| `/:lang/people` | 研究團隊：成員 |
| `/:lang/people/theses` | 研究團隊：學位論文 |
| `/:lang/projects`、`/:lang/projects/:id` | 研究計畫列表與詳情 |
| `/:lang/news` | 消息與獲獎 |

導覽列主選單：首頁、指導教授（下拉：介紹、專欄、研究著作）、研究團隊（下拉：成員、學位論文）、研究計畫、消息與獲獎。

### Intro Page

參考 `intro-options.html` 的 **A 版（淺色）**。

- 全螢幕、淺藍灰底（`--color-bg-soft`），內容置中，不使用 MainLayout
- 由上而下：系所小標籤（settings `department`）、實驗室英文全名（Georgia 大字）、中文全名、短分隔線、教授英文姓名「Prof. {professor `name` 的 `text_en`}」（Georgia 斜體、輔助藍；`text_en` 空白時不顯示）、Explore 按鈕 → 首頁
- 底部一行學校與系所（不設「略過 Skip」，進入首頁只靠 Explore 按鈕）
- **只在第一次造訪 `/` 時自動顯示**（以 localStorage 記錄；讀寫包 try/catch，失敗時當作已看過，不要卡住使用者）
- 從外部連結直接進入內頁時不經過 Intro
- **導覽列與 Footer 的品牌區點擊都會回到 `/intro`**，讓使用者隨時能再看到 Intro

## 首頁規格

以 `light-home.html` 為視覺依據。區塊順序：

**導覽列 → Hero → 研究領域 → 教授與團隊 → 最新消息 → Footer**

### 1. 導覽列（全站共用）

- **深藍背景（`--color-navy`，同 Footer）、白色文字**，底部一條半透明白色細分隔線；捲動時固定在頂部
- 選單文字為 80% 不透明度的白色，目前所在頁面為純白＋白色底線；電腦版下拉選單維持白底深字
- 左：品牌區（Logo 尚未設計，目前只放文字）。第一行為實驗室簡稱（settings `lab_short_name`，Georgia），第二行為目前語言的實驗室全名（小字）；簡稱空白時第一行改顯示全名
- 中：主選單，目前所在區段以純白粗體＋白色底線標示；「指導教授」「研究團隊」有下拉選單
- 右：中文／EN 切換、深淺色切換（ThemeToggle）、搜尋圖示（目前只保留外觀，標示「即將推出」）
- 960px 以下收合成選單按鈕

### 2. Hero

- 淺藍灰底（`--color-bg-soft`），底部細分隔線；高度依內容，不佔滿整個螢幕
- 左欄：
  - 大標題：目前語言的實驗室全名（Georgia，細字重）。英文名較長，720px 以上依左欄寬度縮小字級、盡量排成一行；手機版自然換行
  - 副標：另一語言的全名（Georgia 斜體、輔助藍）
  - 兩個按鈕：「探索研究領域」（深藍實心，捲到研究領域）、「最新消息」（深藍外框，捲到最新消息）
- 右欄：左側細分隔線，寬度固定在 260～340px，兩組實驗室資訊（小標籤＋內容），上下排列
  - 主持人：兩行，不隨語言切換。第一行「中文姓名 中文職稱」（Georgia）；第二行「Prof. 英文姓名」（Georgia 斜體，`name` 的 `text_en` 空白時不顯示）。取自 professor 基本資料 `name`、`title`
  - 地點：settings `address`，有 `map_url` 時加「在 Google 地圖開啟」連結
- 960px 以下改為單欄，右欄資訊移到下方並改用上方分隔線，主持人與地點左右並排；720px 以下改回上下排列

### 3. 研究領域

- 小標籤 OUR FOCUS ＋標題「研究領域」＋一行介紹（settings `research_intro`）
- 電腦版：領域有幾個就排幾欄，上方一條深藍粗線，欄與欄之間以細線分隔（**不用卡片、不用毛玻璃**）
- 每欄：簡潔線條圖示（research `icon`，深藍細線、無填色）、領域名稱（Georgia）、一至兩行介紹、底部「相關計畫 →」
- 整欄可點擊，連到研究計畫頁並以該領域篩選（依 projects 的 `area`）
- 960px 以下，或領域超過五個時，改為列表：每列左邊圖示、右邊名稱與介紹，以上方細線分隔

### 4. 教授與團隊

左右雙欄，中間細分隔線，呈現「教授帶領研究團隊」的關係；路由上指導教授與研究團隊仍是獨立頁面。

- 左欄「指導教授」：教授照片（直式 4:5、小圓角；沒有照片時顯示淺藍佔位）、中文姓名（Georgia）、英文姓名（有才顯示）、職稱、「View Profile」外框按鈕 → 教授介紹頁
- 右欄「研究團隊」：**現任博士生與碩士生圓形頭像橫向捲動**
  - 成員：members 中 `status = current`、`degree` 為 `phd` 或 `ms`、且 `show` 勾選者（交換生、專題生、校友不在首頁顯示）
  - 排序：博士生 → 碩士生；同身分依 `entry_year` 由早到晚
  - 一次顯示四位，頭像尺寸固定不縮小；橫向捲動＋CSS scroll-snap；720px 以下一次約顯示兩個半
  - 每格由上而下：圓形頭像（沒有照片時顯示 `src/assets/default-avatar.svg`）、中文姓名、英文姓名（沒有時保留一行空白以維持對齊）、學籍身分（依語言）
  - **最後一格為「Join us? View Our Team!」**：虛線圓框＋「+」，連到 `/:lang/people#join`
  - 下方可拖曳的捲動條顯示目前位置；電腦版右上有左右箭頭按鈕，手機版用手指滑動
  - 內容不超出容器時，不顯示捲動條與箭頭
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
- 最底部一行：Copyright（settings `copyright`，年份自動產生）與「最後更新：YYYY-MM-DD」（`meta.json`）
- **只放有實際連結的圖示**，沒有真實帳號的社群圖示一律不放

### 首頁與參考稿不同之處（以這裡為準）

- 導覽列為深藍底白字（參考稿是白色導覽列）
- 區塊順序為「研究領域 → 教授與團隊 → 最新消息」
- 參考稿中的名稱（如「HCI Lab」）皆為佔位，實際取自 settings
- 研究領域使用線條圖示，不用 01／02／03 編號
- 團隊成員數量依實際資料，最後一格連到 `#join`

## 內頁規格

### 共用版型

參考 `light-inner-pages.html` 的標題帶與內容區。

- **淺藍標題帶**（`--color-bg-soft`，底部細分隔線）：麵包屑（計畫詳情、專欄文章才有）、小標籤、頁面標題、可選的一行說明
- **白色內容區**：深色文字、淺灰分隔線
- 導覽列與 Footer 同首頁

### 指導教授：介紹

照片、姓名與職稱、簡介、學歷、經歷、研究專長、開設課程、學術服務、Office Hours、聯絡資訊（含實驗室地址與地圖連結）。學歷與經歷顯示期間（professor `period`）。

### 指導教授：專欄

- 列表：發布日期、標題、摘要，可依系列與標籤篩選；只顯示 `publish` 勾選的文章
- 單篇文章頁：標題、作者（`author_ids` 空白代表教授）、日期、系列、內文（中英文版）、原文連結、分享按鈕（複製連結、LINE、Facebook）、同系列其他文章
- 某語言沒有版本時顯示另一語言的版本
- 文章標題由頁面顯示，**Google 文件內不要再打一次標題**，否則會重複

### 指導教授：研究著作

- 依年份分組，可依年份與類型篩選
- 每筆：標題、作者、期刊或會議與卷期頁、類型標籤、作者角色、收錄等級
- 「閱讀論文」按鈕：有 `doi` 時連到 `https://doi.org/<doi>`，否則用 `url`，都沒有就不顯示
- 論文標題、作者、期刊名保留原文，不翻譯

**專欄與研究著作是兩個分開的列表與頁面，不可混在一起。**

### 研究團隊：成員

- **現任成員**：依學籍身分分組（博士生、碩士生、交換生、專題生），每人顯示照片、中英文姓名、學籍身分
- **歷屆畢業生**：只列 `degree` 為 `phd` 或 `ms` 的校友；依 `class_of` 由新到舊分組，身分顯示為「115 級校友」／「Alumni, Class of 2026」；**每屆一列**，每位校友一張直式小卡片：圓形頭像、中英文姓名、學位（**不顯示論文題目**，題目統一放在學位論文頁）；一屆人數放不下時可左右拖拉（共用元件 `ScrollRow`）
- 每屆標題右側有「學位論文 →」文字連結（輔助藍，同 View All），連到 `/:lang/people/theses#class-{class_of}`；只有該屆至少有一篇學位論文（條件見下一節）時才顯示
- **想加入實驗室？**：頁面最下方，見「全站功能」

### 研究團隊：學位論文

- 資料沿用 members，不另設欄位。只列 `status = alumni`、`degree` 為 `phd` 或 `ms`、且 `thesis_title_zh` 或 `thesis_title_en` 至少一個有值的成員
- 篩選與分組規則寫在 `src/utils/content.js` 的 `hasThesis`／`getThesisGroups`，成員頁（決定要不要顯示連結）與論文頁共用，不要各寫一份
- 依 `class_of` 由新到舊分組，分組標題同成員頁（「115 級校友」／「Alumni, Class of 2026」），標題元素 id 為 `class-{class_of}`（例如 `class-115`）
- 同一屆內：博士在前、碩士在後；同學位依 `name_en`（沒有就用 `name_zh`）排序
- 每篇論文一列（純文字橫向資訊列，列與列之間細分隔線，不用圖片，風格同消息與獲獎）：
  - 學位標籤（博士／碩士、Ph.D.／M.S.）
  - 論文題目：中英文都有就兩行都顯示（中文在上），保留原文、不隨語言切換；只有一種就只顯示那一種
  - 作者：中文姓名＋英文姓名（純文字，不連回成員頁）
  - 有 `thesis_url` 時，右側顯示「臺灣博碩士論文 ↗」連結（新分頁開啟）
  - 720px 以下改為上下堆疊
- 篩選列上方一行統計，例如「已畢業博士 2 位、碩士 18 位」，依上述條件自動計算
- 篩選：學位（全部／博士／碩士）與級別；網址帶著 hash（例如 `#class-115`）進入時，篩選一律回到「全部」並捲到該分組（`router/index.js` 的 `beforeEnter`）
- 沒有任何論文時，顯示「目前尚無學位論文」

### 研究計畫

- 分「執行中」與「已結案」兩組（依 `status`）
- 每個計畫：名稱、執行期間、主持人、補助單位、計畫編號（有填才顯示）、摘要
- 詳情頁：另顯示詳細介紹、研究成果、參與成員（連到研究團隊）。研究著作與研究計畫完全分開，詳情頁不列相關論文
- 支援以研究領域篩選；一個計畫可屬於多個領域（`area` 半形逗號分隔），每個領域都篩得到
- `area` 空白或對不到 research 的計畫歸為「其他領域」（網址 `?area=other`，只在有這類計畫時出現）；research 的 id 不可取名 `other`
- 結束年月 `end` 空白時顯示「迄今」
- **不使用計畫圖片**

### 消息與獲獎

完整消息，依日期新到舊排列，可依分類與年份篩選，有摘要時顯示。不使用圖片。

### 搜尋

導覽列保留搜尋圖示，目前只有外觀。之後可用前端搜尋（例如 MiniSearch）搜尋論文、專欄、消息、成員、計畫，不需要後端。

### 尚未實作（之後可加）

- 招生資訊頁（admissions）、實驗室生活相簿（gallery）
- Logo（品牌區目前只有文字）；`public/og-image.png` 分享預覽圖（1200×630，待 Logo 與簡稱確定後製作）
- 搜尋功能
- members 選填欄位 `thesis_keywords`（之後學位論文語意搜尋用，尚未決定是否加入）

## 全站功能

### 加入實驗室（Join us）

- 研究團隊頁最下方設「想加入實驗室？」區塊，元素 id 為 `join`
- 文字取自 settings `join_text`（中英文），下方顯示聯絡 Email（settings `email`）
- 首頁「Join us? View Our Team!」連到 `/:lang/people#join`，進頁後自動捲到該區塊
- `join_text` 空白時不顯示這個區塊

### 子選單與麵包屑

- 指導教授的三個子頁面（介紹、專欄、研究著作）、研究團隊的兩個子頁面（成員、學位論文）：淺藍標題帶底部顯示分頁切換，目前頁面以底線標示
- 第二層頁面（計畫詳情、專欄文章）在標題上方顯示麵包屑，例如專欄文章顯示「指導教授 › 專欄」
- 教授的三個子頁面（介紹、專欄、研究著作）與研究團隊的兩個子頁面（成員、學位論文）不顯示麵包屑，已有分頁切換可回到其他子頁；同一組子頁面的標題帶高度一致
- 第一層頁面（研究計畫、消息與獲獎）不顯示麵包屑

### 深淺色模式

- 導覽列的開關燈按鈕切換，在 `<html>` 加上 `data-theme="dark"`；深色變數寫在 `tokens.css` 的 `:root[data-theme="dark"]`
- 記錄在 localStorage；沒有記錄時跟隨系統設定；讀寫失敗時維持淺色
- 新增顏色時，淺色與深色兩組變數都要定義，元件內不要寫死色碼

### 分頁標題與分享預覽

- 每頁瀏覽器分頁標題：「頁面名稱｜實驗室簡稱」；首頁只顯示實驗室全名；依目前語言切換
- 切換語言時同步更新 `<html lang>`（`zh-Hant`／`en`）
- `index.html` 設定 Open Graph 標籤（og:title、og:description、og:image）
- 限制：網站是單頁應用，社群平台不執行 JavaScript，所有頁面分享時顯示同一組預覽，這是可接受的

### 實驗室位置

- Footer、Hero 右欄、教授介紹頁的聯絡資訊都顯示地址（settings `address`）
- 有 `map_url` 時加「在 Google 地圖開啟」連結，以新分頁開啟，**不內嵌地圖**

## 雙語

- 支援 `zh`（繁體中文）與 `en`；介面文字用 vue-i18n（`src/locales/zh.json`、`en.json`，新增 key 時兩個檔案都要加）
- 內容資料使用 `_zh`／`_en` 欄位；**某語言欄位空白時顯示另一語言的內容**，不要出現空白區塊（人名例外）
- 論文標題、作者、期刊名保留原文
- 試算表中的代碼值（例如 `phd`、`journal`、`Award`）在畫面上一律透過 i18n 轉成顯示文字

### 人名顯示規則

- 教授與成員的姓名**固定同時顯示中英文，不隨語言切換**：中文姓名在上、英文姓名在下
- 沒有英文姓名時只顯示中文，不以中文代替英文
- 學籍身分、職稱等其他文字仍依目前語言顯示

| 代碼 | 中文 | 英文 |
| --- | --- | --- |
| `phd` | 博士生 | Ph.D. Student |
| `ms` | 碩士生 | M.S. Student |
| `exchange` | 交換生 | Exchange Student |
| `undergrad` | 專題生 | Undergraduate Researcher |
| 校友（`status = alumni`） | 115 級校友 | Alumni, Class of 2026 |

- `class_of` 填**民國畢業年份**（2026 年畢業填 115）；中文顯示「{class_of} 級校友」，英文換算為西元（`class_of + 1911`）
- 同一個人有兩段學籍時（例如碩士畢業後讀博士班），每段各一列、使用不同 `id`：碩士那列 `status = alumni`，博士那列 `status = current`

## 視覺設計規範

風格：**Light Editorial Academic**——白底、深藍文字、以細線與留白區分層次，學術、穩重、乾淨。另有深色模式（見「全站功能」）。

### 色彩（淺色模式，寫在 `src/styles/tokens.css`）

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

Footer 文字使用淺色（例如 `#C9D5E2`、`#A9BACB`），需維持足夠對比。深色模式的色碼以 `tokens.css` 為準。

### 字體（寫在 `src/styles/tokens.css`）

全站只用系統內建字體，**不載入任何外部字體或中文網頁字體**（各平台都有內建、不依賴外部服務、中文字型檔動輒數 MB）。

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
             "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
--font-display: Georgia, "Times New Roman",
                "PingFang TC", "Microsoft JhengHei", serif;
```

- `--font-sans`：內文、選單、按鈕、表單
- `--font-display`：大標題、區塊標題、實驗室名稱、人名
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
- 斷點：960px（導覽列收合、雙欄改單欄、研究領域改列表）、720px（三欄改單欄、消息列改兩行）
- 區塊之間以留白與細線分隔，不用大面積色塊

### 圖片使用原則

- 圖片只用於：教授照片、現任成員照片、專欄文中圖片
- 消息、研究計畫、研究領域不使用圖片
- 沒有照片時顯示淺色佔位或預設頭像；任何區塊在圖片不足時都要保持完整

## 內容來源

### Google 試算表與資料夾

全部放在研究室共用 Google 帳號雲端硬碟的「Lab website」資料夾，並以「檢視者」分享給 Service Account。id 寫在 `scripts/sync/config.js`。

| 來源 | 內容 | 誰維護 |
| --- | --- | --- |
| 試算表「網站資料－學生維護」 | settings、professor、research、members、projects、news，另有「說明」「欄位規格」「選項」分頁 | 學生 |
| 試算表「網站資料－教授維護」 | publications、columns（由 Google 表單＋Apps Script 寫入） | 教授 |
| 「成員照片」「教授照片」資料夾 | 照片，檔名對應試算表 `photo` 欄 | 學生 |
| Google 文件 | 專欄內文，每篇每個語言一份，連結填在表單中 | 教授 |

- 資料欄位以試算表的「欄位規格」分頁與 `scripts/sync/schema.js` 為準；兩者有變動時本文件、README、`docs/templates/` 要同步更新
- 下拉選單的選項都放在「選項」分頁，欄位以資料驗證（範圍）引用
- 匯入 `docs/templates/` 的 CSV 重建試算表後，要重新設定下拉選單、id 驗證公式與核取方塊

### 教授的表單與 Apps Script

- 論文與專欄由教授填 Google 表單，Apps Script（表單送出觸發條件）寫入「網站資料－教授維護」；以 id upsert，寫在下一個空白列（不用 `appendRow`，因為核取方塊欄會被當成有資料）
- 表單只接受「已驗證」信箱為實驗室帳號或 Apps Script `EXTRA_SENDERS` 允許清單內的帳號
- 專欄的 Google 文件擁有者必須是實驗室帳號，否則不寫入（觸發條件寄失敗通知）
- 專欄系列選項格式為「中文／英文」（全形斜線）；「不屬於任何系列」「不加標籤」為特殊選項
- publications、columns 分頁最後一欄 `edit_url`（編輯回應連結）由 Apps Script 寫入，同步不輸出
- 已確定：教授只填 Google 表單與 Google 文件，學生不介入專欄與著作的上架；不用表單時間戳記當 id（編輯回應會更新時間戳記）

## 資料欄位

| 分頁（JSON 檔） | 欄位 |
| --- | --- |
| settings | `key`、`value_zh`、`value_en`（一列一個設定，見下表） |
| professor | `section`、`key`、`order`、`period`、`text_zh`、`text_en` |
| research | `id`、`order`、`title_zh`、`title_en`、`desc_zh`、`desc_en`、`icon` |
| members | `id`、`name_zh`、`name_en`、`status`、`degree`、`entry_year`、`class_of`、`photo`、`thesis_title_zh`、`thesis_title_en`、`thesis_url`、`show` |
| projects | `id`、`status`、`title_zh`、`title_en`、`start`、`end`、`pi_zh`、`pi_en`、`funder_zh`、`funder_en`、`project_no`、`area`、`summary_zh`、`summary_en`、`description_zh`、`description_en`、`outcomes_zh`、`outcomes_en`、`member_ids` |
| publications | `id`、`year`、`type`、`title`、`authors`、`venue`、`details`、`doi`、`url`、`author_role`、`index`、`area`、`tags` |
| news | `id`、`date`、`category`、`title_zh`、`title_en`、`summary_zh`、`summary_en`、`link` |
| columns | `id`、`date`、`series_zh`、`series_en`、`title_zh`、`title_en`、`summary_zh`、`summary_en`、`doc_zh`、`doc_en`、`author_ids`、`tags`、`original_url`、`publish` |
| columns（JSON 輸出） | 同上，但 `doc_zh`、`doc_en` 不輸出，改為由 Google 文件轉出並過濾過的 HTML：`content_zh`、`content_en` |
| meta（自動產生） | `updated_at` |

### settings 的 key

| key | 用途 |
| --- | --- |
| `lab_name` | 實驗室全名（中：人機共生與智慧服務研究室／英：Human-AI Symbiosis & Smart Services Lab） |
| `lab_short_name` | 導覽列、Footer、分頁標題用的簡稱 |
| `department` | 系所名稱，Intro 頂端小標籤與底部一行 |
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
| professor `key`（基本資料） | `name`、`title`、`photo` |
| research `icon` | `users`、`chip`、`heart`、`chart`、`book`、`cart` |
| members `status` | `current`、`alumni` |
| members `degree` | `phd`（博士生）、`ms`（碩士生）、`exchange`（交換生）、`undergrad`（專題生） |
| projects `status` | `ongoing`、`completed` |
| publications `type` | `journal`、`conference`、`book`、`chapter` |
| publications `author_role` | `first`、`corresponding`、`first_corresponding`、`co_author` |
| news `category` | `News`、`Event`、`Award`、`Publication` |

新增圖示代碼時，要同時在 `ResearchIcon.vue` 加上圖示、在「選項」分頁加上選項。

### 填寫格式

- 日期：`2025-04-15`；年月：`2025-08`
- 多個值：半形逗號分隔、不加空格（例如 `hci,healthcare`）
- 勾選欄位：試算表中為核取方塊（TRUE／FALSE），JSON 中為布林值
- 資料關聯：`projects.member_ids → members.id`、`projects.area`／`publications.area → research.id`、`columns.author_ids → members.id`
- id 上架後不可修改（網址與資料關聯都靠它）

### id 格式

所有 id 只用小寫英文、數字與 `-`，同分頁不可重複；學生維護的分頁以資料驗證（自訂公式 `REGEXMATCH` + `COUNTIF`）把關。

| 分頁 | 格式 | 範例 | 產生方式 |
| --- | --- | --- | --- |
| members | `m-入學年-姓-名拼音-學位`（學位同 `degree`） | `m-2022-li-muheng-phd` | 學生手填 |
| projects | `p-起始年月-英文名稱頭字母縮寫`（撞名加數字） | `p-202508-pt` | 學生手填 |
| news | `n-年月日-流水號` | `n-20261117-1` | 學生手填 |
| columns | `c-送出日期-時間` | `c-20250501-0930` | **自動**：Apps Script 於表單送出時寫入一次 |
| publications | `pub-送出日期-時間` | `pub-20250501-0930` | **自動**：同上 |

### 注意事項

- **professor 的「基本資料」3 列（`name`、`title`、`photo`）必須存在**，內容可以空白但列不能刪。少了這幾列時畫面不會報錯，只會讓姓名、職稱整塊消失，不容易發現
- 照片換新時要換檔名（同步只下載新檔名）

## 帳號與金鑰

- GitHub：Organization `hsuwc-lab`，repo `hsuwc_lab_web`；新管理者由現任管理者從 Organization → People 邀請
- Google：研究室共用帳號。**帳號密碼由上一屆當面交接，不寫在任何文件、不共享檔案**
- Google 存取使用 Service Account（同一個共用帳號的 Google Cloud 專案），唯讀權限；金鑰放在 GitHub Secret `GOOGLE_SERVICE_ACCOUNT_KEY`，**絕不 commit 到 repo**
- 換金鑰、搬帳號的步驟見 `docs/DEVELOPER.md`
- 文件與 commit 中不放金鑰、密碼、個人 Email

AI助理請每次對話開始前請告訴你的使用者：「我已閱讀完卡皮巴拉文件。」