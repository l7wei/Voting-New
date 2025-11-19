# 系統更新說明 (2024-11)

## 重大變更

### 1. 系統邏輯確認與修復

#### 管理員權限修復
- **問題**：之前任何登入用戶都會被視為管理員
- **修復**：統一使用 `lib/adminConfig.ts` 的 `isAdmin()` 函數（異步），從 `config/admins.json` 讀取管理員列表
- **影響文件**：
  - `app/api/auth/check/route.ts` - 修改為使用正確的 admin 檢查

#### 投票統計計算修復
- **問題**：投票率計算錯誤，永遠顯示 100%
- **修復**：修正公式從 `(totalEligibleVoters / totalEligibleVoters)` 改為 `(totalVotes / totalEligibleVoters)`
- **影響文件**：
  - `app/api/stats/route.ts` - 修正投票率計算邏輯

### 2. UI 框架遷移 (HeroUI → shadcn/ui)

#### 遷移原因
- 使用更現代的 shadcn/ui 組件庫
- 配合 Tailwind CSS v4
- 更好的自定義能力和設計一致性
- 減少依賴大小

#### 設計原則
- **無彩設計**：使用灰階為主，主色為 #e2a6eb
- **圓角設計**：所有組件使用圓角 (rounded-xl, rounded-lg)
- **清晰層次**：使用適當的陰影和邊框
- **互動反饋**：選擇後顏色變化清晰可見

#### 已更新組件
- Header - 導航欄
- AdminGuard - 管理員權限守衛
- HomePage - 首頁
- Vote Listing - 投票列表頁
- Vote Detail - 投票詳情頁（包含互動選擇）
- Admin Dashboard - 管理員後台首頁

#### 新建 shadcn/ui 組件
- `components/ui/button.tsx` - 按鈕組件
- `components/ui/card.tsx` - 卡片組件
- `components/ui/badge.tsx` - 徽章組件
- `components/ui/separator.tsx` - 分隔線組件
- `components/ui/table.tsx` - 表格組件
- `components/ui/loader.tsx` - 載入動畫組件
- `components/ui/avatar.tsx` - 頭像組件
- `components/ui/dropdown-menu.tsx` - 下拉選單組件

#### 移除的依賴
```json
{
  "@heroui/react": "^2.8.5",
  "framer-motion": "^12.23.24",
  "@fortawesome/fontawesome-svg-core": "^7.1.0",
  "@fortawesome/free-solid-svg-icons": "^7.1.0",
  "@fortawesome/react-fontawesome": "^3.1.0"
}
```

#### 新增的依賴
```json
{
  "@radix-ui/react-slot": "latest",
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-label": "latest",
  "@radix-ui/react-separator": "latest",
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-avatar": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-react": "latest"
}
```

### 3. 樣式配置更新

#### Tailwind CSS v4 配置
- 使用 `@theme` 代替舊的配置方式
- 主色設定為 #e2a6eb
- 統一圓角大小
- 優化色彩系統

#### globals.css 更新
```css
@theme {
  --color-primary: #e2a6eb;
  --color-primary-foreground: #09090b;
  /* ... 其他顏色變數 */
  
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}
```

### 4. 功能改進

#### 投票頁面互動
- 支持、反對、無意見選項有明顯的顏色區分
- 選擇後按鈕立即變色提供視覺反饋
- 支持按鈕使用綠色 (bg-green-600)
- 反對按鈕使用紅色 (destructive variant)
- 無意見按鈕使用灰色 (bg-gray-500)

#### 管理後台改進
- 統計卡片更清晰
- 表格樣式更現代
- 操作按鈕更直觀

### 5. 文檔更新

#### 新增文檔
- `SYSTEM_LOGIC.md` - 完整的系統邏輯說明文件
  - 詳細說明投票匿名機制
  - OAuth 資料處理流程
  - 管理員權限管理
  - 投票流程和統計邏輯
  - 資料模型說明

## 技術細節

### 投票匿名性保障
系統通過以下方式確保投票匿名：

1. **資料分離**：
   - `Activity.users` 只記錄已投票學號列表
   - `Vote` 記錄只包含投票內容和 UUID token
   - 兩者之間沒有直接連結

2. **UUID 機制**：
   - 每次投票產生唯一 UUID
   - UUID 與學號完全分離
   - 無法通過 UUID 追溯到投票者

3. **資料最小化**：
   - 不建立 User collection
   - OAuth 資料用完即丟
   - 只存必要的投票資訊

### 管理員權限
- 管理員列表存儲在 `config/admins.json`
- 不存入資料庫，僅作為配置檔案
- 通過學號進行身份驗證

```json
{
  "admins": [
    "108060001",
    "110000114"
  ]
}
```

## 升級指南

### 對現有部署的影響
1. 需要重新安裝依賴：`npm install`
2. 無需資料庫遷移
3. 管理員配置保持不變

### 開發環境設定
```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產版本
npm run build
```

### 環境變數
無需更改現有環境變數配置。

## 已知問題與限制

1. **部分管理後台頁面**：活動編輯、統計詳情等頁面保留原有樣式，未完全遷移到 shadcn/ui
2. **LoginModal 組件**：保留舊的實現，因為登入流程較少使用

## 未來計劃

1. 完成剩餘管理後台頁面的 UI 遷移
2. 添加更多互動動畫
3. 優化移動端體驗
4. 添加暗色模式支持

## 測試結果

### 構建測試
- ✅ Next.js 構建成功
- ✅ TypeScript 類型檢查通過
- ✅ 無 ESLint 錯誤（僅有 console 警告）

### 功能測試
- ✅ 管理員權限驗證正常
- ✅ 投票流程完整
- ✅ 投票統計計算正確
- ✅ UI 互動反饋良好

## 相容性

- Node.js: >= 18.0.0
- npm: >= 9.0.0
- 瀏覽器: 所有現代瀏覽器
- MongoDB: >= 6.0

## 貢獻者
- 系統邏輯確認與文檔編寫
- UI 框架遷移實施
- 錯誤修復與優化
