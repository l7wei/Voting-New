# Mock OAuth 系統說明

## 概述

本系統新增了模擬 OAuth 登入介面，方便開發與測試。管理員權限透過學號驗證，管理員名單儲存在 `config/admins.json` 中。

## 功能特色

### 1. 模擬 OAuth 登入介面
- 位於 `/login` 路由
- 可輸入以下資訊：
  - 學號 (Student ID)
  - 姓名 (Name)
  - 在校狀態 (In School Status)
  - UUID (選填，自動產生)
- 提供快速測試帳號按鈕

### 2. 管理員設定系統
- 管理員學號清單儲存在 `config/admins.json`
- 可隨時編輯該檔案來新增或移除管理員
- 系統會在登入時自動檢查並設定管理員權限

### 3. UI 改善
- 完全響應式設計 (RWD)
- 組件化架構：
  - `components/Common.tsx` - 通用元件
  - `components/Header.tsx` - 頁首元件
  - `components/ActivityStatus.tsx` - 活動狀態元件
- 改善的介面設計，支援手機、平板、桌面裝置

## 使用方式

### 啟動開發環境

1. 安裝依賴：
```bash
npm install
```

2. 複製環境變數檔案：
```bash
cp .env.example .env
```

3. 確認 `.env` 中的 Mock OAuth 設定已啟用（預設已啟用）：
```env
OAUTH_AUTHORIZE=http://localhost:3000/api/mock/auth
OAUTH_TOKEN_URL=http://localhost:3000/api/mock/token
OAUTH_RESOURCE_URL=http://localhost:3000/api/mock/resource
OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

4. 啟動開發伺服器：
```bash
npm run dev
```

### 管理員設定

編輯 `config/admins.json` 來管理管理員名單：

```json
{
  "admins": [
    "110000114",
    "108062001"
  ]
}
```

### 測試流程

1. 訪問首頁 `http://localhost:3000`
2. 點選「前往投票」或「後台管理」
3. 系統會導向模擬 OAuth 登入頁面
4. 輸入測試學號或使用快速測試按鈕
5. 登入後系統會自動判斷權限並導向對應頁面

#### 預設測試帳號
- **管理員**: 110000114 (可存取後台)
- **一般學生**: 110000001 (僅可投票)

## API 端點

### Mock OAuth 端點

1. **GET** `/api/mock/auth`
   - 模擬 OAuth 授權頁面
   - 重導向到 `/login` 登入介面

2. **POST** `/api/mock/token`
   - 模擬 OAuth token 交換
   - 回傳 mock access token

3. **POST** `/api/mock/resource`
   - 模擬使用者資訊端點
   - 使用 cookie 中的 mockOAuthData
   - 回傳使用者資訊 (userid, name, inschool, uuid)

### 認證流程

```
使用者點選登入
    ↓
GET /api/auth/login
    ↓
重導向到 /login (Mock OAuth 登入頁面)
    ↓
使用者輸入資訊並提交
    ↓
設定 cookie: mockOAuthData
    ↓
重導向到 /api/auth/callback?code=xxx
    ↓
交換 token 並取得使用者資訊
    ↓
檢查管理員權限 (從 config/admins.json)
    ↓
建立或更新使用者記錄
    ↓
設定 service_token cookie
    ↓
重導向到 /vote 頁面
```

## 檔案結構

```
├── app/
│   ├── login/
│   │   └── page.tsx              # Mock OAuth 登入頁面
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts    # 登入入口
│   │   │   ├── callback/route.ts # OAuth callback (更新支援管理員驗證)
│   │   │   └── logout/route.ts   # 登出
│   │   └── mock/
│   │       ├── auth/route.ts     # Mock OAuth 授權端點
│   │       ├── token/route.ts    # Mock token 交換
│   │       └── resource/route.ts # Mock 使用者資訊
│   ├── admin/                    # 管理員後台 (已重構)
│   └── vote/                     # 投票頁面 (已重構)
├── components/
│   ├── Common.tsx                # 通用元件 (LoadingSpinner, ErrorMessage)
│   ├── Header.tsx                # 頁首元件
│   └── ActivityStatus.tsx        # 活動狀態元件
├── config/
│   └── admins.json               # 管理員學號清單
└── lib/
    └── adminConfig.ts            # 管理員設定工具函數
```

## 生產環境設定

在生產環境中，請修改 `.env` 使用真實的 OAuth 端點：

```env
OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
OAUTH_CALLBACK_URL=https://voting.nthusa.tw/api/auth/callback
```

## 注意事項

1. Mock OAuth 僅供開發測試使用
2. 生產環境請務必使用真實的 OAuth 服務
3. 管理員清單檔案 `config/admins.json` 請妥善保管
4. 登入 cookie 有效期限為 1 天
5. Mock OAuth 資料 cookie 有效期限為 5 分鐘

## 安全性

- 所有認證使用 JWT token
- Cookie 設定 httpOnly 防止 XSS 攻擊
- 生產環境 Cookie 設定 secure flag
- 管理員權限基於學號驗證
- 投票使用 UUID 確保匿名性
