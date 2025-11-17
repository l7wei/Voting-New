# 投票系統使用流程

## 概述

本系統是一個匿名投票系統，使用 UUID 來確保投票的隱私性。系統會記錄誰投過票（防止重複投票），但不會將投票結果與投票人連結。

## 系統架構

### 隱私保護機制

1. **投票記錄分離**：投票時產生隨機 UUID (vote_token)
2. **匿名投票**：所有對同一活動的投票使用同一個 vote_token
3. **防重複投票**：系統記錄 student_id 已投票，但無法反向查詢投票內容
4. **投票人資格管理**：通過 CSV 清單控制可投票人員

### 資料結構

```typescript
// 投票記錄（Vote）
{
  student_id: string,      // 投票人學號（僅用於防重複投票）
  activity_id: ObjectId,   // 活動 ID
  option_id: ObjectId,     // 選項 ID（候選人）
  vote_token: string,      // UUID - 同一人同一活動的所有選項使用相同 token
  agree: string,          // 投票選項：'我要投給他', '我不投給他', '我沒有意見'
  created_at: Date
}
```

**重要**：查詢投票結果時，只能看到：
- 每個 option_id 收到多少票
- 每個 vote_token 的完整投票記錄（但不知道 token 對應誰）
- 無法查詢特定 student_id 投給誰

---

## 完整設置流程

### 階段 1：環境準備

#### 1.1 安裝依賴
```bash
npm install
```

#### 1.2 設定環境變數
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```env
MONGODB_URI=mongodb://root:password@127.0.0.1:27017/voting_sa
TOKEN_SECRET=your-secret-key-here
NODE_ENV=development
```

#### 1.3 啟動 MongoDB
```bash
npm run docker:dev
```

---

### 階段 2：準備投票人清單

#### 2.1 準備 CSV 檔案

建立 `voterList.csv`，格式如下：
```csv
student_id
108000001
108000002
108000003
109000001
109000002
```

**注意事項**：
- 第一行是標題（`student_id`）
- 每行一個學號
- 只能包含英數字元
- 沒有額外的欄位或空格

#### 2.2 上傳投票人清單

**方法 A：直接替換檔案**
```bash
cp your-voterList.csv data/voterList.csv
```

**方法 B：通過 API 上傳（需管理員權限）**
```bash
curl -X POST http://localhost:3000/api/admin/voters \
  -H "Cookie: service_token=<your-admin-token>" \
  -F "file=@voterList.csv"
```

**方法 C：通過管理後台上傳**
1. 登入管理後台
2. 進入「投票人管理」頁面
3. 上傳 CSV 檔案

---

### 階段 3：建立管理員帳號

#### 3.1 使用 Seed 腳本（開發環境）
```bash
npm run seed
```

這會建立：
- 管理員帳號：`108000000`
- 測試用戶：`108000001`, `108000002`, `108000003`
- 範例投票活動

#### 3.2 手動建立管理員（生產環境）

**方法 A：MongoDB 直接插入**
```javascript
db.users.insertOne({
  student_id: "your-admin-id",
  remark: "admin",
  created_at: new Date(),
  updated_at: new Date()
})
```

**方法 B：使用 API（需要先有一個管理員）**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Cookie: service_token=<admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "new-admin-id",
    "remark": "admin"
  }'
```

---

### 階段 4：啟動服務

```bash
npm run dev
```

服務將在 http://localhost:3000 啟動

---

### 階段 5：管理員登入後台

#### 5.1 開發環境（Mock OAuth）
```
http://localhost:3000/api/auth/mock-login?student_id=108000000
```

#### 5.2 生產環境（CCXP OAuth）
```
http://localhost:3000/
```
點擊「使用 CCXP OAuth 登入」

#### 5.3 訪問管理後台
登入後訪問：
```
http://localhost:3000/admin
```

---

### 階段 6：建立投票活動

#### 6.1 通過管理後台（推薦）
1. 進入管理後台
2. 點擊「活動管理」標籤
3. 點擊「新增活動」
4. 填寫活動資訊：
   - 活動名稱
   - 活動類型（candidate）
   - 投票規則（choose_all 或 choose_one）
   - 開始時間
   - 結束時間

#### 6.2 通過 API
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Cookie: service_token=<admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "第 30 屆學生會正副會長選舉",
    "type": "candidate",
    "rule": "choose_all",
    "open_from": "2025-01-01T00:00:00Z",
    "open_to": "2025-01-07T23:59:59Z"
  }'
```

---

### 階段 7：新增候選人/選項

#### 7.1 通過 API
```bash
curl -X POST http://localhost:3000/api/options \
  -H "Cookie: service_token=<admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_id": "<activity-id>",
    "type": "candidate",
    "candidate": {
      "name": "王小明",
      "department": "資訊工程學系 21 級",
      "college": "電機資訊學院",
      "avatar_url": "https://example.com/avatar.jpg",
      "personal_experiences": [
        "學生會幹部經驗",
        "系學會會長"
      ],
      "political_opinions": [
        "改善校園設施",
        "提升學生權益"
      ]
    },
    "vice1": {
      "name": "李小華",
      ...
    }
  }'
```

---

## 投票流程（使用者端）

### 1. 使用者登入
```
http://localhost:3000/
```

### 2. 選擇投票活動
系統會顯示目前開放的投票活動

### 3. 查看候選人資訊
顯示候選人的：
- 照片
- 系級
- 個人經歷
- 政見

### 4. 進行投票
對每個候選人選擇：
- 「我要投給他」（同意）
- 「我不投給他」（不同意）
- 「我沒有意見」（廢票）

### 5. 確認並送出
- 系統顯示投票總結
- 確認後送出
- 獲得 vote_token（憑證）

### 6. 投票完成
- 顯示投票成功訊息
- 顯示 vote_token（可用於查詢投票記錄）
- **注意**：無法修改或查看具體投給誰

---

## 投票結果查詢

### 管理員查詢（統計）

#### 方法 A：API 查詢
```bash
curl http://localhost:3000/api/votes?activity_id=<activity-id> \
  -H "Cookie: service_token=<admin-token>"
```

返回：
```json
{
  "success": true,
  "votes": [
    {
      "vote_token": "uuid-1",
      "option_id": "option-a",
      "agree": "我要投給他"
    },
    ...
  ]
}
```

#### 方法 B：管理後台查看
1. 進入管理後台
2. 點擊「投票結果」標籤
3. 選擇活動
4. 查看統計圖表

### 統計分析

可以統計：
- 每個候選人獲得的「同意」、「不同意」、「廢票」數
- 總投票人數
- 投票率

**無法查詢**：
- 特定學號投給誰
- vote_token 對應的學號

---

## API 端點總覽

### 認證相關
- `GET /api/auth/login` - OAuth 登入
- `GET /api/auth/mock-login?student_id=<id>` - Mock 登入（開發）
- `GET /api/auth/logout` - 登出

### 投票人管理（管理員）
- `GET /api/admin/voters` - 查看投票人清單統計
- `POST /api/admin/voters` - 上傳投票人 CSV
- `PUT /api/admin/voters` - 從備份還原

### 活動管理
- `GET /api/activities` - 獲取所有活動
- `GET /api/activities?available=true` - 獲取開放中的活動
- `POST /api/activities` - 建立活動（管理員）
- `GET /api/activities/[id]` - 獲取單一活動
- `PUT /api/activities/[id]` - 更新活動（管理員）
- `DELETE /api/activities/[id]` - 刪除活動（管理員）

### 選項/候選人管理
- `GET /api/options?activity_id=<id>` - 獲取活動的候選人
- `POST /api/options` - 新增候選人（管理員）

### 投票
- `POST /api/votes` - 提交投票
- `GET /api/votes?activity_id=<id>` - 查詢投票結果（管理員）

### 使用者管理（管理員）
- `GET /api/users` - 獲取所有使用者
- `POST /api/users` - 建立使用者

---

## 常見問題

### Q1: 投票是否真的匿名？
**A**: 是的。系統使用 UUID (vote_token) 來分隔身份和投票內容：
- 查詢投票結果時，只能看到 vote_token 的投票，但不知道 token 對應誰
- 查詢某人是否投過票，但無法查詢投給誰

### Q2: 如何防止重複投票？
**A**: 系統在 Vote 表中記錄 student_id + activity_id，每個組合只能存在一次。

### Q3: 如何更新投票人清單？
**A**: 
1. 上傳新的 CSV 檔案（系統會自動備份舊檔案）
2. 如果需要還原，可以使用「還原備份」功能

### Q4: 投票人清單何時生效？
**A**: 上傳後立即生效。建議在投票開始前上傳。

### Q5: 可以修改已投的票嗎？
**A**: 不可以。一旦提交，投票即確定且無法修改。

### Q6: 管理員可以看到誰投給誰嗎？
**A**: 不可以。管理員只能看到：
- 統計結果（每個選項的票數）
- 每個 vote_token 的完整投票（但不知道是誰）
- 誰投過票（但不知道投給誰）

---

## 安全注意事項

1. **環境變數**：確保 `.env` 檔案不要提交到 Git
2. **管理員權限**：謹慎分配管理員權限
3. **投票人清單**：定期備份，防止意外覆蓋
4. **資料庫備份**：定期備份 MongoDB 資料
5. **Token 安全**：TOKEN_SECRET 要使用強密碼

---

## 故障排除

### 問題：無法上傳投票人清單
**解決**：
1. 檢查 CSV 格式是否正確
2. 確保檔案只包含英數字元
3. 檢查管理員權限

### 問題：投票時顯示「不符合投票資格」
**解決**：
1. 檢查學號是否在投票人清單中
2. 確認投票人清單已正確上傳
3. 使用 `GET /api/admin/voters` 檢查清單內容

### 問題：無法登入管理後台
**解決**：
1. 確認帳號的 remark 欄位是 "admin"
2. 檢查 JWT token 是否有效
3. 清除 cookie 後重新登入

---

## 技術支援

如有問題，請查看：
1. README.md - 基本設定說明
2. REFACTORING_SUMMARY.md - 技術架構詳情
3. GitHub Issues - 回報問題

---

最後更新：2025-11-17
