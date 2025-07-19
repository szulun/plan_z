#!/bin/bash

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm run install:all
fi

# 啟動開發環境
echo "Starting Plan B Portfolio in development mode..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "Press Ctrl+C to stop"

npm run dev 