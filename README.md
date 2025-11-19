# 清大學生會投票系統 v2.0 | NTHU Voting System

現代化的清華大學學生會線上投票系統，採用 Next.js + TypeScript + MongoDB 架構，確保投票匿名性與安全性。

A modern voting system for National Tsing Hua University Student Association built with Next.js, TypeScript, and MongoDB, ensuring vote anonymity and security.

## ✨ 核心特色 | Key Features

- 🔒 **完全匿名投票** - 使用 UUID 技術確保投票匿名性
- 🎯 **僅追蹤是否投票** - 系統只記錄學生是否投票，不記錄投票內容
- 🔐 **OAuth 安全認證** - 支援 CCXP OAuth 認證系統
- 📊 **靈活的投票方式** - 支援多選(choose_all)和單選(choose_one)
- 🎨 **現代化介面** - 使用 Tailwind CSS 打造響應式設計
- 🚀 **高效能** - Next.js 15 App Router 架構
- 🔄 **CI/CD 自動化** - GitHub Actions 自動測試與部署
- 🐳 **Docker 支援** - 一鍵部署到任何環境
- 🧪 **完整測試** - Jest 單元測試與整合測試

## 📋 技術棧 | Tech Stack

- **框架**: Next.js 15 (App Router)
- **語言**: TypeScript
- **資料庫**: MongoDB 6 + Mongoose 8
- **樣式**: Tailwind CSS
- **認證**: JWT + OAuth
- **測試**: Jest + React Testing Library
- **CI/CD**: GitHub Actions
- **容器化**: Docker + Docker Compose

## 🚀 快速開始 | Quick Start

### 先決條件 | Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm 9+

### 本地開發 | Local Development

1. **克隆專案**
```bash
git clone https://github.com/l7wei/Voting-New.git
cd Voting-New
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數**
```bash
cp .env.example .env
```

編輯 `.env` 文件，配置資料庫連接和其他設定。

4. **啟動 MongoDB** (使用 Docker)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **啟動開發伺服器**
```bash
npm run dev
```

訪問 http://localhost:3000 查看應用。

### 使用 Docker | Using Docker

完整的 Docker 部署：

```bash
# 構建並啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### GitHub Codespaces

本專案支援 GitHub Codespaces，點擊 "Code" → "Open with Codespaces" 即可在雲端開發環境中開始工作。

## 📚 API 文檔 | API Documentation

### 認證 | Authentication

#### 登入
```
GET /api/auth/login
```
重定向到 OAuth 認證頁面

#### OAuth 回調
```
GET /api/auth/callback?code={code}
```
處理 OAuth 回調並設置認證 cookie

#### 登出
```
GET /api/auth/logout
```
清除認證 cookie 並重定向到首頁

### 投票 | Voting

#### 建立投票
```
POST /api/votes
Authorization: Bearer {token}

Body:
{
  "activity_id": "活動ID",
  "rule": "choose_all", // 或 "choose_one"
  "choose_all": [
    {
      "option_id": "選項ID",
      "remark": "我要投給他" // 或 "我不投給他", "我沒有意見"
    }
  ]
}
```

#### 獲取投票記錄 (管理員)
```
GET /api/votes?activity_id={id}&limit=100&skip=0
Authorization: Bearer {token}
```

### 開發用 Mock OAuth

開發環境下，系統會自動使用 Mock OAuth：

```
GET /api/mock/auth
POST /api/mock/token
POST /api/mock/resource
```

## 🧪 測試 | Testing

```bash
# 執行所有測試
npm test

# 監聽模式
npm run test:watch

# 類型檢查
npm run type-check

# Lint 檢查
npm run lint
```

## 🔧 開發 | Development

### 專案結構

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # 認證相關
│   │   ├── mock/         # Mock OAuth
│   │   └── votes/        # 投票相關
│   ├── globals.css       # 全域樣式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首頁
├── lib/                   # 共用函式庫
│   ├── models/           # Mongoose 模型
│   ├── auth.ts           # 認證工具
│   ├── db.ts             # 資料庫連接
│   ├── middleware.ts     # API 中介軟體
│   ├── oauth.ts          # OAuth 處理
│   └── voterList.ts      # 投票人名單管理
├── types/                 # TypeScript 類型定義
├── __tests__/            # 測試檔案
├── data/                 # 資料檔案（投票人名單）
├── .devcontainer/        # Codespaces 設定
└── .github/              # GitHub Actions

```

### 資料模型 | Data Models

#### User (使用者)
```typescript
{
  student_id: string;      // 學號
  remark?: string;         // 備註（如 "admin"）
  created_at: Date;
  updated_at: Date;
}
```

#### Activity (投票活動)
```typescript
{
  name: string;                    // 活動名稱
  type: string;                    // 活動類型
  rule: 'choose_all' | 'choose_one';
  users: ObjectId[];               // 已投票的使用者
  options: ObjectId[];             // 投票選項
  open_from: Date;                 // 開始時間
  open_to: Date;                   // 結束時間
}
```

#### Vote (投票記錄)
```typescript
{
  activity_id: ObjectId;
  rule: 'choose_all' | 'choose_one';
  choose_all?: Array<{
    option_id: ObjectId;
    remark: '我要投給他' | '我不投給他' | '我沒有意見';
  }>;
  choose_one?: ObjectId;
  token: string;                   // UUID - 確保匿名性
  created_at: Date;
}
```

### 投票流程說明

1. **管理員設置**
   - 上傳學生清單 CSV (data/voterList.csv)
   - 在資料庫中設置管理員（remark: "admin"）

2. **建立投票活動**
   - 管理員登入後台
   - 建立投票活動（設定名稱、時間、規則）
   - 新增候選人/選項

3. **學生投票**
   - 學生通過 OAuth 登入
   - 選擇投票活動
   - 進行投票（系統會檢查資格和投票時間）
   - 投票時生成 UUID token 確保匿名性

4. **結果統計**
   - 系統僅記錄學生是否投票（activity.users）
   - 投票內容與 UUID token 關聯，無法追溯到個人

## 🔐 安全性 | Security

- ✅ 所有依賴項已更新到最新安全版本
- ✅ JWT token 認證
- ✅ UUID 確保投票匿名性
- ✅ 管理員權限檢查
- ✅ 投票資格驗證
- ✅ 時間窗口限制
- ✅ 防止重複投票

## 🚢 部署 | Deployment

### 環境變數

必須設定以下環境變數：

```env
# 資料庫
MONGO_HOST=127.0.0.1
MONGO_USERNAME=root
MONGO_PASSWORD=password
MONGO_NAME=voting_sa

# 認證
TOKEN_SECRET=your-secret-key

# OAuth (生產環境)
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
OAUTH_CALLBACK_URL=https://your-domain.com/api/auth/callback
```

### Docker 部署

```bash
# 構建生產映像
docker build -t voting-system .

# 使用 docker-compose 部署
docker-compose up -d
```

## 🤝 貢獻 | Contributing

歡迎提交 Pull Request 或開 Issue！

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📝 授權 | License

ISC License

## 👥 維護者 | Maintainers

- 清華大學學生會資訊部

## 🙏 致謝 | Acknowledgments

感謝所有為本專案做出貢獻的開發者和清華大學學生會。

---

**⚠️ 重要提醒**

此系統處理敏感的投票資料，請確保：
1. 妥善保管環境變數和 secrets
2. 定期更新依賴項
3. 遵循最佳安全實踐
4. 定期備份資料庫
5. 在生產環境使用 HTTPS

如有任何問題，請聯繫清華大學學生會資訊部。
