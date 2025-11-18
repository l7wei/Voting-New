# 遷移指南 | Migration Guide

從舊版 Express.js 系統遷移到新版 Next.js 系統的完整指南。

## 📋 遷移前準備

### 1. 備份資料

**重要：** 在進行任何遷移之前，請先備份所有資料！

```bash
# 備份 MongoDB 資料庫
mongodump -h 127.0.0.1 -d voting_sa -o ./backup-$(date +%Y%m%d)

# 備份投票人名單
cp libs/voterList.csv ./backup-voterList-$(date +%Y%m%d).csv
```

### 2. 檢查現有資料

確認資料庫中的資料結構：

```javascript
// 連接到 MongoDB
use voting_sa

// 檢查集合
show collections

// 檢查資料
db.users.find().limit(5)
db.activities.find().limit(5)
db.votes.find().limit(5)
db.options.find().limit(5)
```

## 🔄 資料遷移

### 資料庫結構變更

新舊系統的資料庫結構基本相同，但有以下變更：

#### Users 集合
- ✅ 無變更，完全兼容

#### Activities 集合
- ✅ 無變更，完全兼容

#### Options 集合
- ✅ 無變更，完全兼容

#### Votes 集合
- ⚠️ `choose_all.option_id` 和 `choose_one` 類型已變更
  - 舊版：使用 `ObjectId` 類型
  - 新版：支持 `ObjectId` 和 `string` 類型
  - **不需要遷移**，兩者兼容

### 投票人名單遷移

```bash
# 複製投票人名單到新位置
cp libs/voterList.csv data/voterList.csv

# 如果有備份檔案
cp libs/voterList.csv.backup data/voterList.csv.backup
```

## 🔧 環境設定遷移

### 舊版 .env 格式

```env
MONGO_HOST=127.0.0.1
MONGO_PORT=27017
MONGO_USERNAME=root
MONGO_PASSWORD=password
MONGO_NAME=voting_sa
SERVER_PORT=8080
TOKEN_SECRET=mysecret
OAUTH_CLIENT_ID=nthusa
OAUTH_CLIENT_SECRET=secret
OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
OAUTH_CALLBACK_URL="https://voting.nthusa.tw/callback"
OAUTH_SCOPE="userid name inschool uuid"
```

### 新版 .env 格式

```env
# 資料庫（新增 MONGODB_URI）
MONGODB_URI=mongodb://root:password@127.0.0.1:27017/voting_sa
MONGO_HOST=127.0.0.1
MONGO_USERNAME=root
MONGO_PASSWORD=password
MONGO_NAME=voting_sa

# 伺服器（PORT 改為 3000）
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://voting.nthusa.tw

# 認證（TOKEN_SECRET 保持不變）
TOKEN_SECRET=mysecret

# OAuth（移除 OAUTH_LOGIN，修改 CALLBACK_URL）
OAUTH_CLIENT_ID=nthusa
OAUTH_CLIENT_SECRET=secret
OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
OAUTH_CALLBACK_URL=https://voting.nthusa.tw/api/auth/callback
OAUTH_SCOPE=userid name inschool uuid
```

### 重要變更

1. **PORT 變更**: 從 8080 改為 3000（Next.js 預設）
2. **新增 MONGODB_URI**: 完整的 MongoDB 連接字串
3. **OAUTH_CALLBACK_URL**: 路徑從 `/callback` 改為 `/api/auth/callback`
4. **移除 OAUTH_LOGIN**: 使用內建路由 `/api/auth/login`

## 🚀 部署步驟

### 使用 Docker（推薦）

1. **準備環境**

```bash
cd Voting-New
cp .env.example .env
# 編輯 .env，填入正確的配置
```

2. **複製投票人名單**

```bash
mkdir -p data
cp /path/to/old/libs/voterList.csv data/voterList.csv
```

3. **啟動服務**

```bash
# 構建並啟動
docker-compose up -d

# 檢查服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f app
```

### 傳統部署

1. **安裝依賴**

```bash
npm install
```

2. **構建應用**

```bash
npm run build
```

3. **啟動 MongoDB**

```bash
docker-compose -f docker-compose.dev.yml up -d
# 或使用現有的 MongoDB 服務
```

4. **啟動應用**

```bash
npm start
```

## 🔗 URL 路徑變更

### 認證路徑

| 功能 | 舊版 | 新版 |
|------|------|------|
| 登入 | `/auth_url` | `/api/auth/login` |
| 回調 | `/callback` | `/api/auth/callback` |
| 登出 | `/auth/logout` | `/api/auth/logout` |

### API 路徑

| 功能 | 舊版 | 新版 |
|------|------|------|
| 建立投票 | `POST /votes/addVote` | `POST /api/votes` |
| 查詢投票 | `POST /votes/getVotes` | `GET /api/votes` |

### 前端路徑

| 頁面 | 舊版 | 新版 |
|------|------|------|
| 首頁 | `/index.html` | `/` |
| 投票頁面 | `/voting.html` | `/voting` (待實作) |
| 管理後台 | `/admin.html` | `/admin` (待實作) |

## 📝 Nginx 配置更新

如果使用 Nginx 反向代理，請更新配置：

```nginx
server {
    listen 80;
    server_name voting.nthusa.tw;

    location / {
        proxy_pass http://localhost:3000;  # 從 8080 改為 3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ✅ 驗證遷移

完成遷移後，請進行以下驗證：

### 1. 基本功能測試

```bash
# 健康檢查
curl http://localhost:3000/

# 測試 Mock OAuth（開發環境）
curl http://localhost:3000/api/mock/auth

# 測試認證（需要替換 token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/votes
```

### 2. 資料庫連接驗證

```bash
# 查看應用日誌，確認資料庫連接成功
docker-compose logs app | grep -i mongo
```

### 3. 投票功能驗證

- [ ] 管理員可以登入
- [ ] 可以查看現有活動
- [ ] 學生可以登入
- [ ] 投票功能正常
- [ ] 匿名性得到保證（檢查 votes 集合的 token 欄位）

## 🔙 回滾計劃

如果遷移失敗，可以快速回滾到舊版：

```bash
# 停止新版服務
docker-compose down

# 恢復舊版程式碼
git checkout main  # 或舊版的分支

# 恢復資料庫（如果有變更）
mongorestore -h 127.0.0.1 -d voting_sa --drop ./backup-YYYYMMDD/voting_sa

# 啟動舊版服務
npm install
npm start
```

## 🐛 常見問題

### 1. MongoDB 連接失敗

**症狀**: 應用無法連接到 MongoDB

**解決方案**:
- 檢查 MONGODB_URI 格式是否正確
- 確認 MongoDB 服務正在運行
- 檢查防火牆設置

### 2. OAuth 認證失敗

**症狀**: 登入後返回錯誤

**解決方案**:
- 確認 OAUTH_CALLBACK_URL 已更新為新路徑
- 在 OAuth 提供商後台更新回調 URL
- 檢查 OAUTH_CLIENT_ID 和 SECRET 是否正確

### 3. 投票人名單無法載入

**症狀**: 學生無法投票，提示不在名單中

**解決方案**:
- 確認 data/voterList.csv 文件存在
- 檢查 CSV 格式是否正確（第一行為標題，後續每行一個學號）
- 查看應用日誌中的錯誤訊息

### 4. 舊資料無法訪問

**症狀**: 無法查詢舊的投票記錄

**解決方案**:
- 確認資料庫名稱沒有改變
- 檢查集合名稱（新版使用單數形式：User, Activity, Option, Vote）
- 可能需要重命名集合：
  ```javascript
  use voting_sa
  db.users.renameCollection('User')
  db.activities.renameCollection('Activity')
  db.options.renameCollection('Option')
  db.votes.renameCollection('Vote')
  ```

## 📞 技術支援

如遇到問題，請：

1. 查看應用日誌：`docker-compose logs -f app`
2. 查看資料庫連接：`docker-compose logs mongodb`
3. 提交 Issue 到 GitHub 專案
4. 聯繫清華大學學生會資訊部

## 📚 其他資源

- [Next.js 文檔](https://nextjs.org/docs)
- [MongoDB 文檔](https://docs.mongodb.com/)
- [Docker 文檔](https://docs.docker.com/)
- [專案 README](./README_NEW.md)

---

**注意**: 遷移過程中請保持舊版系統可用，直到新版系統完全穩定運行。
