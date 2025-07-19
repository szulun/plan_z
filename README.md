# Plan B Portfolio - Investment Tracker

一個乾淨美麗的投資追蹤器，使用 React + Next.js 前端和 Node.js + Express 後端。

## 🚀 功能特色

- 📊 即時股票報價
- 💼 投資組合管理
- 📈 績效追蹤
- 🔐 Firebase 身份驗證
- 📱 響應式設計
- 🎨 現代化 UI/UX

## 🛠️ 技術棧

### 前端
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- Firebase Auth
- Lucide React Icons

### 後端
- Node.js
- Express.js
- MongoDB
- JWT 認證
- Alpha Vantage API
- Finnhub API

## 📦 本地開發

```bash
# 安裝所有依賴
npm run install:all

# 啟動開發伺服器（同時啟動前後端）
npm run dev

# 或分別啟動
npm run dev:frontend  # 前端 (http://localhost:3000)
npm run dev:backend   # 後端 (http://localhost:5001)
```

## 🌐 Render 部署

### 一次部署前後端

1. **前往 [Render Dashboard](https://dashboard.render.com/)**
2. **點擊 "New +" → "Blueprint"**
3. **連接你的 GitHub repository**: `szulun/plan_z`
4. **Render 會自動偵測 `render.yaml` 並部署兩個服務**

### 部署的服務

#### 後端服務 (plan-b-backend)
- **類型**: Web Service
- **環境**: Node.js
- **根目錄**: `backend`
- **建置指令**: `npm install`
- **啟動指令**: `npm start`

#### 前端服務 (plan-b-frontend)
- **類型**: Static Site
- **根目錄**: `frontend`
- **建置指令**: `npm install && npm run build`
- **發布目錄**: `.next`

### 環境變數設定

部署完成後，需要在每個服務中設定環境變數：

#### 後端環境變數
```
NODE_ENV=production
MONGODB_URI=你的MongoDB連線字串
ALPHA_VANTAGE_API_KEY=你的Alpha Vantage API Key
FINNHUB_API_KEY=你的Finnhub API Key
JWT_SECRET=你的JWT密鑰
GMAIL_APP_PASSWORD=你的Gmail應用程式密碼
```

#### 前端環境變數
```
NEXT_PUBLIC_FIREBASE_API_KEY=你的Firebase API Key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的Firebase Auth Domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的Firebase Project ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的Firebase Storage Bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的Firebase Messaging Sender ID
NEXT_PUBLIC_FIREBASE_APP_ID=你的Firebase App ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=你的Firebase Measurement ID
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=你的Alpha Vantage API Key
NEXT_PUBLIC_BACKEND_URL=https://plan-b-backend.onrender.com
```

## 🔧 環境變數

### 後端 (.env)
```env
MONGODB_URI=mongodb+srv://...
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
JWT_SECRET=your_jwt_secret
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### 前端 (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## 📝 可用指令

```bash
# 開發
npm run dev                    # 同時啟動前後端
npm run dev:frontend          # 只啟動前端
npm run dev:backend           # 只啟動後端

# 建置
npm run build                 # 建置前後端
npm run build:frontend        # 建置前端
npm run build:backend         # 建置後端

# 生產環境
npm run start                 # 同時啟動前後端
npm run start:frontend        # 啟動前端
npm run start:backend         # 啟動後端

# 其他
npm run install:all           # 安裝所有依賴
npm run clean                 # 清理 node_modules
npm run lint                  # 程式碼檢查
npm run test                  # 執行測試
```

## 🔗 API 端點

### 認證
- `POST /api/auth/firebase-login` - Firebase 登入
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入

### 投資組合
- `GET /api/portfolio` - 取得投資組合
- `POST /api/portfolio` - 新增股票
- `PUT /api/portfolio/:id` - 更新股票
- `DELETE /api/portfolio/:id` - 刪除股票

### 股票資料
- `GET /api/stocks/quote/:symbol` - 取得股票報價
- `GET /api/quote/:symbol` - 取得股票報價 (Finnhub)

### 市場情緒
- `GET /api/market-sentiment/spy-ytd` - SPY 年初至今表現

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！ 