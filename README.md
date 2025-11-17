# 清大線上投票系統 (Voting System)

國立清華大學學生會線上投票系統 - 使用 Next.js 14+ 與 MongoDB 重構版本

## 🚀 技術棧

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + OAuth 2.0 (CCXP)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Development Environment**: GitHub Codespaces支援

## 📋 功能特色

- ✅ 現代化的使用者介面
- ✅ 完整的投票流程管理
- ✅ 管理員後台系統
- ✅ 活動與候選人管理
- ✅ Mock OAuth 開發模式
- ✅ 資料視覺化 (開發中)
- ✅ 自動化測試 CI/CD
- ✅ Docker 容器化部署

## 🛠️ 安裝與設定

### 前置需求

- Node.js 20+
- MongoDB 7.0+
- Docker & Docker Compose (選用)

### 本地開發

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
cp .env.example .env.local
```

編輯 `.env.local`:
```env
MONGODB_URI=mongodb://root:password@127.0.0.1:27017/voting_sa
TOKEN_SECRET=your-secret-key
NODE_ENV=development
```

4. **啟動 MongoDB (使用 Docker)**
```bash
npm run docker:dev
```

5. **載入測試資料**
```bash
npm run seed
```

這會建立:
- 管理員帳號: `108000000`
- 測試用戶: `108000001`, `108000002`, `108000003`
- 範例投票活動與候選人

6. **啟動開發伺服器**
```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 使用 Mock OAuth 登入

在開發模式下，可以直接使用 Mock OAuth 登入:

```
http://localhost:3000/api/auth/mock-login?student_id=108000000
```

## 🐳 使用 Docker

### 開發環境

```bash
npm run docker:dev
npm run dev
```

### 生產環境

```bash
npm run docker:prod
```

或手動:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 測試

```bash
# 執行所有測試
npm test

# 監看模式
npm run test:watch

# 生成測試覆蓋率報告
npm run test:coverage

# TypeScript 型別檢查
npm run type-check

# ESLint 檢查
npm run lint
```

## 📦 建置

```bash
npm run build
```

建置完成後，可以使用以下指令啟動生產伺服器:

```bash
npm start
```

## 🔧 開發工具

### GitHub Codespaces

本專案已配置 GitHub Codespaces，可直接在雲端開發:

1. 點擊 GitHub 儲存庫頁面的 "Code" 按鈕
2. 選擇 "Create codespace on main"
3. 等待環境建立完成
4. 自動執行 `npm install` 和設定

### VS Code 建議擴充套件

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code

## 📚 API 文檔

### 認證 API

- `GET /api/auth/login` - OAuth 登入
- `GET /api/auth/mock-login?student_id=<學號>` - Mock 登入 (僅開發模式)
- `GET /api/auth/logout` - 登出

### 活動 API

- `GET /api/activities` - 獲取所有活動
- `GET /api/activities?available=true` - 獲取進行中的活動
- `GET /api/activities/[id]` - 獲取單一活動
- `POST /api/activities` - 建立活動 (管理員)
- `PUT /api/activities/[id]` - 更新活動 (管理員)
- `DELETE /api/activities/[id]` - 刪除活動 (管理員)

### 選項/候選人 API

- `GET /api/options?activity_id=<活動ID>` - 獲取活動的候選人
- `POST /api/options` - 新增候選人 (管理員)

### 投票 API

- `POST /api/votes` - 提交投票
- `GET /api/votes?activity_id=<活動ID>` - 獲取投票結果 (管理員)

### 使用者 API

- `GET /api/users` - 獲取所有使用者 (管理員)
- `POST /api/users` - 建立使用者 (管理員)

## 🗂️ 專案結構

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # 認證相關
│   │   ├── activities/    # 活動管理
│   │   ├── votes/         # 投票
│   │   ├── options/       # 候選人/選項
│   │   └── users/         # 使用者管理
│   ├── admin/             # 管理員頁面
│   ├── voting/            # 投票頁面
│   ├── layout.tsx         # 根佈局
│   ├── page.tsx           # 首頁
│   └── globals.css        # 全域樣式
├── components/            # React 元件
│   ├── admin/            # 管理員元件
│   ├── voting/           # 投票元件
│   └── ui/               # 通用 UI 元件
├── lib/                   # 工具庫
│   ├── db/               # 資料庫
│   │   ├── models/       # Mongoose Models
│   │   └── mongoose.ts   # MongoDB 連線
│   └── auth/             # 認證工具
│       ├── jwt.ts        # JWT 工具
│       └── middleware.ts # 認證中介層
├── scripts/              # 工具腳本
│   └── seed.ts          # 資料庫種子資料
├── public/              # 靜態資源
├── .github/
│   └── workflows/       # GitHub Actions
└── docker-compose.*.yml # Docker 設定
```

## 🔐 安全性

- JWT Token 用於身份驗證
- Cookie 設定 HttpOnly 和 Secure
- API 路由使用中介層保護
- 管理員權限檢查
- 環境變數加密敏感資訊

## 📝 授權

ISC

## 👥 貢獻

歡迎提交 Issue 和 Pull Request!

### 開發流程

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📞 聯絡資訊

國立清華大學學生會資訊部

## 🙏 致謝

感謝所有為本專案做出貢獻的開發者與使用者。

---

## 📅 版本歷史

### v2.0.0 (2025-11)
- 完整重構為 Next.js 14+ 架構
- 加入 TypeScript 型別安全
- 使用 Tailwind CSS v4
- Docker 容器化部署
- GitHub Actions CI/CD

### v1.x (Legacy)
- 原 Express.js + jQuery 架構
- 已完全移除並由新架構取代
