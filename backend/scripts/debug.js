const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Plan B Backend...\n');

// 檢查目錄結構
console.log('1. Checking directory structure:');
const dirs = ['src', 'src/config', 'src/models', 'src/routes', 'src/middleware'];
dirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, '..', dir));
  console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
});

// 檢查關鍵文件
console.log('\n2. Checking key files:');
const files = [
  'src/index.js',
  'src/config/database.js',
  'src/models/User.js',
  'src/models/Portfolio.js',
  'src/routes/auth.js',
  'src/routes/portfolio.js',
  'src/routes/stocks.js',
  'src/routes/insights.js',
  'src/middleware/auth.js',
  '.env',
  'package.json'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 檢查 node_modules
console.log('\n3. Checking dependencies:');
const nodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
console.log(`   ${nodeModulesExists ? '✅' : '❌'} node_modules exists`);

// 檢查 package.json 內容
console.log('\n4. Checking package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  console.log(`   ✅ package.json is valid JSON`);
  console.log(`   📦 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  console.log(`   🔧 DevDependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
} catch (error) {
  console.log(`   ❌ package.json error: ${error.message}`);
}

// 檢查環境變數
console.log('\n5. Checking environment variables:');
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const requiredEnvVars = ['MONGODB_URI', 'ALPHA_VANTAGE_API_KEY', 'JWT_SECRET'];
  requiredEnvVars.forEach(envVar => {
    const exists = process.env[envVar];
    console.log(`   ${exists ? '✅' : '❌'} ${envVar}`);
  });
} catch (error) {
  console.log(`   ❌ .env error: ${error.message}`);
}

console.log('\n�� Debug complete!'); 