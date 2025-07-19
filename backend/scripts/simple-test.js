console.log('🧪 Simple test starting...');

try {
  // 測試 package.json
  const packageJson = require('../package.json');
  console.log('✅ package.json loaded successfully');
  console.log('📦 Package name:', packageJson.name);
  
  // 測試環境變數
  require('dotenv').config();
  console.log('✅ .env loaded successfully');
  console.log('🔑 API Key exists:', !!process.env.ALPHA_VANTAGE_API_KEY);
  
  // 測試基本模組
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded successfully');
  
  console.log('🎉 All basic tests passed!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
} 