# 清大投票系統邏輯說明文件

## 系統概述

本投票系統是為清華大學學生會設計的線上投票系統，採用完全匿名的投票機制，確保投票的私密性與安全性。

## 核心設計原則

### 1. 匿名投票機制

系統採用 UUID 技術實現完全匿名投票：

- **不追蹤投票內容與投票者的關聯**：投票記錄只包含 UUID token，無法追溯到特定學生
- **只記錄是否投票**：在投票活動的 `users` 欄位中，只記錄已投票的學號列表
- **投票憑證**：投票完成後產生唯一 UUID 作為投票憑證，供驗票使用

### 2. 資料存儲策略

#### 不存儲的資訊
- **無使用者資料庫**：系統不建立任何使用者資料表
- **不存敏感個資**：除了學號外，不存儲任何個人資訊
- **OAuth 資料用完即丟**：OAuth 返回的 UUID、姓名等資料僅用於驗證，不存入資料庫

#### 存儲的資訊
1. **管理員列表** (`config/admins.json`)
   - 僅包含學號列表
   - 用於標記哪些學號具有管理員權限
   - 不存入資料庫，僅存為檔案

2. **投票人名單** (`data/voterList.csv`)
   - 包含所有有投票資格的學生學號
   - 用於驗證投票資格
   - 不存入資料庫，僅存為檔案

3. **投票活動** (Activity Collection)
   ```typescript
   {
     name: string;              // 活動名稱
     type: string;              // 活動類型
     rule: 'choose_all' | 'choose_one';  // 投票方式
     users: string[];           // 已投票的學號列表（只記錄是否投票）
     options: ObjectId[];       // 投票選項 ID
     open_from: Date;          // 開始時間
     open_to: Date;            // 結束時間
   }
   ```

4. **投票記錄** (Vote Collection)
   ```typescript
   {
     activity_id: ObjectId;     // 活動 ID
     rule: 'choose_all' | 'choose_one';
     choose_all?: Array<{       // 多選評分
       option_id: ObjectId;
       remark: '我要投給他' | '我不投給他' | '我沒有意見';
     }>;
     choose_one?: ObjectId;     // 單選
     token: string;             // UUID - 投票憑證
     created_at: Date;
   }
   ```
   **重點**：投票記錄與學號完全分離，無法追溯

## 認證與授權流程

### OAuth 認證流程

1. **登入請求**：使用者點擊登入按鈕
2. **OAuth 授權**：重定向到 CCXP OAuth 授權頁面
3. **取得授權碼**：使用者授權後返回 callback，帶著授權碼
4. **交換 Token**：後端用授權碼交換 Access Token
5. **取得使用者資訊**：用 Access Token 取得使用者資訊
6. **產生 JWT**：系統產生自己的 JWT，**只包含學號和姓名**
7. **設置 Cookie**：將 JWT 存入 `service_token` cookie

### OAuth 返回的資料處理

OAuth 返回的 scope 包含：`uuid`, `inschool`, `userid`, `name`

**使用方式**：
- `userid` (學號)：用於驗證投票資格和管理員權限，存入 JWT
- `name`：僅用於顯示，存入 JWT
- `uuid`：**不使用**，OAuth 的 UUID 與系統投票 UUID 無關
- `inschool`：用於驗證是否為在學學生

**不存入資料庫的資料**：所有 OAuth 返回的資料都不存入資料庫

### 管理員權限驗證

1. **管理員列表**：存儲在 `config/admins.json`
   ```json
   {
     "admins": [
       "108060001",
       "110000114"
     ]
   }
   ```

2. **權限檢查流程**：
   - 從 JWT 取得學號
   - 讀取 `admins.json` 檢查是否在列表中
   - 返回 `isAdmin` 布林值

3. **重要修正**：
   - ✅ 使用 `lib/adminConfig.ts` 中的 `isAdmin()` 函數（異步）
   - ❌ 不使用 `lib/auth.ts` 中的 `isAdmin()` 函數（同步，已廢棄）

## 投票流程

### 1. 資格驗證

投票前需通過以下檢查：

```typescript
// 檢查學生是否在投票人名單中
const voterList = await loadVoterList();
if (!isStudentEligible(user.student_id, voterList)) {
  return error('Student is not eligible to vote');
}

// 檢查活動時間
if (now < activity.open_from || now > activity.open_to) {
  return error('Voting time window invalid');
}

// 檢查是否已投票
if (activity.users.includes(user.student_id)) {
  return error('User has already voted');
}
```

### 2. 投票處理

```typescript
// 1. 產生唯一 UUID token
const token = uuidv4();

// 2. 建立投票記錄（不含學號）
const vote = await Vote.create({
  activity_id,
  rule,
  choose_all: [...],  // 或 choose_one
  token,              // 投票憑證
  created_at: new Date(),
});

// 3. 記錄已投票（只記錄學號）
await Activity.updateOne(
  { _id: activity_id },
  { $addToSet: { users: user.student_id } }
);

// 4. 返回投票憑證給使用者
return { success: true, token };
```

### 3. 投票匿名性保障

- 投票記錄 (Vote) 中**不包含**任何可識別投票者的資訊
- 活動記錄 (Activity) 只記錄**是否投票**，不記錄投票內容
- UUID token 是隨機產生的，無法透過 token 推導出投票者
- 即使資料庫被完全洩露，也無法追溯任何投票內容到特定學生

## 統計與開票

### 統計邏輯

```typescript
// 1. 取得所有投票記錄（匿名）
const votes = await Vote.find({ activity_id });

// 2. 計算統計資料
const totalVotes = votes.length;
const totalEligibleVoters = activity.users.length;  // 已投票人數
const turnoutRate = (totalVotes / totalEligibleVoters) * 100;

// 3. 統計各選項得票
votes.forEach(vote => {
  if (vote.rule === 'choose_all') {
    vote.choose_all.forEach(choice => {
      optionStats[choice.option_id][choice.remark]++;
    });
  } else {
    optionStats[vote.choose_one].support++;
  }
});
```

**重要修正**：
- ✅ 投票率 = `(totalVotes / totalEligibleVoters) * 100`
- ❌ 之前的錯誤：`(totalEligibleVoters / totalEligibleVoters) * 100` (永遠是 100%)

### 驗票機制

使用者可以用投票憑證 (UUID token) 驗證投票是否被正確記錄：

```typescript
// 透過 UUID token 查詢投票記錄
const vote = await Vote.findOne({ token: userProvidedToken });

if (vote) {
  // 可以看到自己的投票內容
  // 但無法知道這是誰投的
  return vote;
}
```

## 投票方式

### 1. 多選評分 (choose_all)

- 對每個候選人表達意見
- 三種選項：
  - `我要投給他`（支持）
  - `我不投給他`（反對）
  - `我沒有意見`（中立）
- 統計時分別計算支持、反對、中立票數

### 2. 單選 (choose_one)

- 從多個候選人中選擇一個
- 只記錄被選擇的選項 ID
- 統計時計算各選項得票數

## 安全性設計

### 1. 資料隔離

- 投票記錄與投票者完全分離
- Activity.users 只記錄「誰投過票」
- Vote 只記錄「投票內容」和「UUID token」
- 兩者之間沒有任何連結

### 2. 防止重複投票

```typescript
// 檢查學號是否已在 activity.users 中
if (activity.users.includes(user.student_id)) {
  return error('Already voted');
}
```

### 3. 時間窗口控制

```typescript
if (now < activity.open_from) {
  return error('Voting not started');
}
if (now > activity.open_to) {
  return error('Voting ended');
}
```

### 4. 資格驗證

- 必須在投票人名單 (voterList.csv) 中
- 必須通過 OAuth 認證（確認在學）
- 必須在活動開放時間內

## API 端點說明

### 認證相關

- `GET /api/auth/login` - 開始 OAuth 登入流程
- `GET /api/auth/callback` - OAuth 回調處理
- `GET /api/auth/check` - 檢查登入狀態
- `GET /api/auth/logout` - 登出

### 投票相關

- `POST /api/votes` - 提交投票（需認證）
- `GET /api/votes` - 取得投票記錄（管理員）

### 活動管理

- `GET /api/activities` - 取得活動列表
- `GET /api/activities/:id` - 取得單一活動
- `POST /api/activities` - 建立活動（管理員）
- `PUT /api/activities/:id` - 更新活動（管理員）
- `DELETE /api/activities/:id` - 刪除活動（管理員）

### 統計

- `GET /api/stats?activity_id=xxx` - 取得活動統計（管理員）

## 資料流程圖

```
使用者登入
    ↓
OAuth 認證 → 取得學號、姓名
    ↓
產生 JWT (只含學號、姓名)
    ↓
存入 Cookie
    ↓
使用者選擇活動
    ↓
檢查投票資格 (voterList.csv)
    ↓
檢查是否已投票 (Activity.users)
    ↓
使用者投票
    ↓
產生 UUID token
    ↓
分別記錄：
├─ Activity.users ← 學號（已投票標記）
└─ Vote ← 投票內容 + UUID token（無學號）
    ↓
返回 UUID token 給使用者
```

## 隱私保護總結

1. **不建立使用者資料庫**：沒有 User collection
2. **OAuth 資料不落地**：只用於驗證，不存入資料庫
3. **投票與投票者分離**：Vote 記錄與學號完全分離
4. **只記錄是否投票**：Activity.users 只記錄已投票學號
5. **UUID 確保匿名**：用 UUID token 作為投票憑證，無法追溯
6. **管理員權限檔案管理**：存在 JSON 檔案，不存資料庫

## 系統限制與注意事項

1. **投票憑證保管**：使用者需自行保管 UUID token，遺失無法找回
2. **無法撤回投票**：投票送出後無法修改或撤回
3. **管理員更新**：需手動編輯 `config/admins.json`
4. **投票人名單更新**：需手動更新 `data/voterList.csv`
5. **資料庫備份**：投票記錄極度重要，必須定期備份

## 開發環境設定

### Mock OAuth

開發環境可使用 Mock OAuth：

```env
OAUTH_AUTHORIZE=http://localhost:3000/api/mock/auth
OAUTH_TOKEN_URL=http://localhost:3000/api/mock/token
OAUTH_RESOURCE_URL=http://localhost:3000/api/mock/resource
MOCK_STUDENT_ID=110000114
```

### 生產環境 OAuth

```env
OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
OAUTH_CALLBACK_URL=https://your-domain.com/api/auth/callback
```

## 總結

本系統透過精心設計的資料結構和流程，實現了完全匿名的投票機制。關鍵點在於：

1. **資料分離**：投票內容與投票者身份完全分離
2. **最小化存儲**：只存必要資訊，不存敏感個資
3. **UUID 匿名**：使用 UUID 作為唯一的投票憑證
4. **檔案管理**：管理員和投票人名單不存資料庫

這種設計確保了即使資料庫被完全洩露，也無法追溯任何投票記錄到特定學生，真正實現了投票的私密性和匿名性。
