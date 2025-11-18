# 清大學生會投票系統 v2.0

現代化的線上投票系統，採用 Next.js 15、TypeScript、MongoDB 和 Tailwind CSS 構建。

## 主要特色

- ✅ **完全匿名投票**：使用 UUID 技術保護投票者隱私
- 🔐 **OAuth 認證**：支援清大 OAuth 系統（並提供開發模式模擬）
- 👤 **Admin 管理**：基於 JSON 檔案的管理員權限管理
- 📱 **響應式設計**：支援桌面、平板、手機等各種裝置
- 🎨 **現代化介面**：使用 Tailwind CSS 打造美觀的使用者介面
- 🔧 **組件化架構**：可重用的 React 組件，易於維護和擴展

## 快速開始

### 環境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 6.0

### 安裝步驟

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設定環境變數**
   ```bash
   cp .env.example .env
   ```
   編輯 `.env` 檔案，設定 MongoDB 連線資訊和其他必要參數。

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

4. **建置生產版本**
   ```bash
   npm run build
   npm start
   ```

## 開發模式 OAuth 模擬

本系統提供了方便的 OAuth 模擬功能，讓開發者無需真實的清大 OAuth 即可測試完整流程。

### 使用方式

1. 確保 `.env` 檔案中已啟用 Mock OAuth：
   ```env
   OAUTH_AUTHORIZE=http://localhost:3000/api/mock/auth
   OAUTH_TOKEN_URL=http://localhost:3000/api/mock/token
   OAUTH_RESOURCE_URL=http://localhost:3000/api/mock/resource
   OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback
   ```

2. 訪問登入頁面 `/login`，您將看到一個表單，可以輸入：
   - **學號 (userid)**：學生學號
   - **姓名 (name)**：學生姓名
   - **在校狀態 (inschool)**：true 或 false
   - **UUID**：自動生成的唯一識別碼

3. 提交後系統會模擬完整的 OAuth 流程並登入。

## 管理員設定

管理員權限透過 JSON 檔案管理，無需修改資料庫。

### 新增管理員

編輯 `config/admins.json` 檔案：

```json
{
  "admins": [
    "110000114",
    "110000115",
    "110000116"
  ]
}
```

只需將學號加入 `admins` 陣列即可賦予管理員權限。系統會在使用者登入時自動檢查並更新權限。

### 移除管理員

從 `config/admins.json` 的 `admins` 陣列中移除對應學號即可。

## 專案結構

```
Voting-New/
├── app/                    # Next.js App Router 頁面
│   ├── api/               # API 路由
│   │   ├── auth/          # 認證相關 API
│   │   ├── mock/          # Mock OAuth API
│   │   ├── activities/    # 投票活動 API
│   │   ├── options/       # 候選人 API
│   │   └── votes/         # 投票 API
│   ├── admin/             # 管理後台頁面
│   ├── vote/              # 投票頁面
│   └── login/             # 登入頁面
├── components/            # 可重用的 React 組件
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorAlert.tsx
│   └── LoadingSpinner.tsx
├── lib/                   # 工具函數與模型
│   ├── auth.ts            # 認證相關函數
│   ├── oauth.ts           # OAuth 處理
│   ├── adminConfig.ts     # 管理員配置讀取
│   ├── db.ts              # 資料庫連線
│   └── models/            # Mongoose 模型
├── config/                # 配置檔案
│   └── admins.json        # 管理員列表
├── types/                 # TypeScript 類型定義
└── .env                   # 環境變數（不納入版本控制）
```

## API 文件

### 認證 API

- `GET /api/auth/login` - 發起 OAuth 登入流程
- `GET /api/auth/callback` - OAuth 回調處理
- `GET /api/auth/logout` - 登出

### Mock OAuth API（開發模式）

- `GET /api/mock/auth` - 模擬 OAuth 授權頁面
- `POST /api/mock/token` - 模擬獲取 access token
- `POST /api/mock/resource` - 模擬獲取使用者資訊
- `POST /api/mock/session` - 儲存 mock session
- `GET /api/mock/session` - 讀取 mock session

### 投票活動 API

- `GET /api/activities` - 取得所有活動
- `GET /api/activities/[id]` - 取得特定活動
- `POST /api/activities` - 新增活動（需管理員權限）
- `PUT /api/activities/[id]` - 更新活動（需管理員權限）
- `DELETE /api/activities/[id]` - 刪除活動（需管理員權限）

### 候選人 API

- `GET /api/options` - 取得候選人列表
- `POST /api/options` - 新增候選人（需管理員權限）
- `PUT /api/options/[id]` - 更新候選人（需管理員權限）
- `DELETE /api/options/[id]` - 刪除候選人（需管理員權限）

### 投票 API

- `POST /api/votes` - 提交投票（需認證）
- `GET /api/stats` - 取得統計資料（需管理員權限）

## 技術棧

- **前端框架**：Next.js 15 (App Router)
- **UI 框架**：React 19
- **樣式**：Tailwind CSS 4
- **語言**：TypeScript 5
- **資料庫**：MongoDB 6
- **ORM**：Mongoose 8
- **認證**：JWT + OAuth
- **部署**：Docker 支援

## 開發指令

```bash
# 開發模式
npm run dev

# 建置
npm run build

# 啟動生產伺服器
npm start

# Lint
npm run lint

# 類型檢查
npm run type-check

# 測試
npm test
```

## 生產環境部署

1. 設定環境變數，使用真實的清大 OAuth URL：
   ```env
   OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
   OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
   OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
   OAUTH_CALLBACK_URL=https://voting.nthusa.tw/api/auth/callback
   ```

2. 建置並啟動：
   ```bash
   npm run build
   npm start
   ```

## Docker 部署

```bash
# 開發環境
docker-compose -f docker-compose.dev.yml up

# 生產環境
docker-compose up -d
```

## 安全性

- ✅ JWT Token 認證
- ✅ OAuth 2.0 整合
- ✅ 投票匿名性保護
- ✅ HTTPS 加密傳輸（生產環境）
- ✅ XSS 防護
- ✅ CSRF 防護
- ✅ SQL Injection 防護（使用 Mongoose ORM）

## 授權

本專案採用 MIT 授權條款。

## 貢獻

歡迎提交 Issue 或 Pull Request！

## 聯絡方式

- 專案維護：清華大學學生會資訊部
- 問題回報：[GitHub Issues](https://github.com/l7wei/Voting-New/issues)

---

© 2024 清華大學學生會資訊部
National Tsing Hua University Student Association
