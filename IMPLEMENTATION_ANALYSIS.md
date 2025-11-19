# 實作分析與建議

## 2. Mock OAuth Scope 載入問題

### 現狀分析
查看 `/app/api/mock/authorize/page.tsx` 後發現：
- **Scope 參數已正確從 URL 讀取**（第 15 行）
- **表單欄位已依 scope 條件顯示**（第 122, 136, 149, 164 行）
- **資料已依 scope 過濾後傳送**（第 43-54 行）

### 結論
✅ Mock OAuth 的 scope 功能**已正確實作**，會根據 URL 參數的 scope 動態顯示對應欄位。

### 測試方式
```
http://localhost:3000/api/mock/authorize?redirect_uri=...&scope=userid name
# 只會顯示學號和姓名欄位

http://localhost:3000/api/mock/authorize?redirect_uri=...&scope=userid
# 只會顯示學號欄位
```

---

## 3. 正式 OAuth 學號姓名顯示

### 現狀分析
查看 `/app/api/auth/callback/route.ts` 和 `/components/Header.tsx`：

**OAuth Callback 處理**：
- ✅ 從 OAuth 取得 `userInfo.Userid` 和 `userInfo.name`（第 22-23 行）
- ✅ 將學號和姓名存入 JWT token（第 27-31 行）
```typescript
const serviceToken = generateToken({
  _id: studentId,
  student_id: studentId,
  name: userName, // ← 姓名已存入 token
});
```

**前端顯示**：
- ✅ Header 組件已正確顯示用戶姓名（Header.tsx 第 91, 97 行）
- ✅ 下拉選單中顯示姓名和學號（第 97-100 行）

### 結論
✅ 正式 OAuth 的學號和姓名**已正確存儲和顯示**。

---

## 4. 精簡 Mock 部分

### 現有 Mock 端點

#### 必要端點（需保留）：
1. `/api/mock/auth/route.ts` - Mock OAuth 授權端點（重定向到授權頁面）
2. `/api/mock/token/route.ts` - Mock OAuth token 端點（交換 code 為 access_token）
3. `/api/mock/resource/route.ts` - Mock OAuth 資源端點（取得用戶資訊）
4. `/api/mock/authorize/page.tsx` - Mock OAuth 授權頁面（用戶輸入資訊）
5. `/api/mock/authorize/submit/route.ts` - 提交授權資訊

#### 可能多餘的端點：
1. `/api/mock/store/route.ts` - 需檢查用途

### 建議
查看 `store` 端點的功能後決定是否需要：
- 如果只是重複儲存邏輯，可以移除
- 如果有特殊用途，則保留

### Mock 流程
```
1. GET /api/mock/auth → 重定向到授權頁面
2. 用戶在 /api/mock/authorize 頁面輸入資訊
3. POST /api/mock/authorize/submit → 儲存授權資訊
4. 重定向回 callback 並帶上 code
5. POST /api/mock/token → 交換 code 為 access_token
6. POST /api/mock/resource → 用 access_token 取得用戶資訊
```

---

## 6. 管理後台驗證機制評估

### 現有方案

#### 1. Root Middleware (`/middleware.ts`)
- 檢查 `/admin` 路徑是否有 `service_token` cookie
- **限制**：只檢查 token 存在，不驗證內容或 admin 權限

#### 2. AdminGuard Component (`/components/auth/AdminGuard.tsx`)
- Client-side 驗證
- 呼叫 `/api/auth/check` 確認身份和 admin 權限
- **限制**：
  - Client-side 驗證可能被繞過
  - 每個頁面都要包裝 `<AdminGuard>`
  - 造成不必要的 API 呼叫

#### 3. API Route Protection (`/lib/middleware.ts`)
- 使用 `requireAuth` 和 `requireAdmin` 函數
- Server-side 驗證 JWT token 和 admin 權限
- **優點**：安全可靠

### 問題分析

1. **重複驗證**：同時使用 middleware 和 AdminGuard，造成重複檢查
2. **安全性不足**：Root middleware 只檢查 token 存在，不驗證權限
3. **效能問題**：每個 admin 頁面都要額外 API 呼叫驗證

### 建議方案：在 Middleware 層統一驗證

#### 優點
- ✅ Server-side 驗證，無法繞過
- ✅ 統一管理，不需要每個頁面包裝 AdminGuard
- ✅ 減少不必要的 API 呼叫
- ✅ 更好的安全性

#### 實作方向
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin routes require authentication and admin permission
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('service_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token and check admin permission
    const decoded = verifyToken(token);
    if (!decoded || !isAdmin(decoded.student_id)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}
```

#### 遷移步驟
1. 強化 middleware 的驗證邏輯（驗證 JWT 和 admin 權限）
2. 保留 AdminGuard 用於顯示 loading 狀態（但不做驗證）
3. 或完全移除 AdminGuard，在 middleware 處理所有驗證

---

## 7. 資料庫存儲 User Token 評估

### 現有方案
- JWT token 存在 httpOnly cookie
- Token 包含用戶資訊（student_id, name）
- Token 有效期 1 天
- **不存儲在資料庫**

### 優點
- ✅ 無需資料庫查詢，效能好
- ✅ Token 自包含所有必要資訊
- ✅ 符合 stateless 設計
- ✅ 符合「資料庫只存投票活動和投票紀錄」的原則

### 是否需要在資料庫存 Token？

#### 需要存的情況
1. **Token 撤銷**：如果需要立即撤銷某用戶的所有 session
2. **多設備管理**：追蹤用戶的所有登入設備
3. **審計追蹤**：記錄所有登入記錄

#### 不需要存的情況（目前方案）
1. **簡單投票系統**：不需要複雜的 session 管理
2. **Token 短期有效**：1 天後自動過期
3. **無敏感操作**：投票系統的操作相對簡單

### 建議
❌ **不需要在資料庫存儲 token**

#### 理由
1. ✅ 投票系統不需要即時撤銷 token 的功能
2. ✅ Token 1 天自動過期已足夠
3. ✅ 符合「資料庫只存投票活動和投票紀錄」的設計原則
4. ✅ 減少資料庫負擔
5. ✅ 保持系統簡潔

#### 替代方案（如果未來需要）
如果將來需要 token 撤銷功能，可以：
1. 在 Redis 存儲黑名單 token
2. 或在 token 中加入版本號，資料庫只存版本號
3. 不影響現有的 stateless 設計

---

## 總結

### 已完成 ✅
1. Admin 頁面已完整實作
2. Footer 組件已建立
3. Mock OAuth scope 功能正常
4. 正式 OAuth 學號姓名顯示正常

### 建議改善 ⚡
1. **Mock 部分精簡**：檢查 `/api/mock/store` 是否需要
2. **Middleware 驗證**：建議將 admin 驗證邏輯移到 middleware
3. **Token 存儲**：建議維持現狀，不在資料庫存 token

### 優先級
1. 🔴 高：改善 middleware 驗證機制（安全性）
2. 🟡 中：精簡 mock 端點（程式碼清潔）
3. 🟢 低：其他已正常運作的功能
