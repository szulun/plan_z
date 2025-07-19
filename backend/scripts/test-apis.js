const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAPIs() {
  console.log('🧪 Testing Plan B Portfolio API Keys...\n');

  // Test Alpha Vantage API
  console.log('1. Testing Alpha Vantage API...');
  try {
    const alphaResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'AAPL',
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });
    
    if (alphaResponse.data['Global Quote']) {
      console.log('   ✅ Alpha Vantage API: Working');
      console.log(`   📊 AAPL Price: $${alphaResponse.data['Global Quote']['05. price']}`);
    } else {
      console.log('   ⚠️  Alpha Vantage API: Response format unexpected');
    }
  } catch (error) {
    console.log('   ❌ Alpha Vantage API: Failed');
    console.log(`   Error: ${error.message}`);
  }

  // Test MongoDB Atlas
  console.log('\n2. Testing MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB Atlas: Connected successfully');
    console.log(`   📊 Database: ${mongoose.connection.name}`);
    await mongoose.connection.close();
  } catch (error) {
    console.log('   ❌ MongoDB Atlas: Failed to connect');
    console.log(`   Error: ${error.message}`);
  }

  // Test JWT Secret
  console.log('\n3. Testing JWT Secret...');
  try {
    const testData = { userId: 'test123', email: 'test@example.com' };
    const token = jwt.sign(testData, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId === testData.userId) {
      console.log('   ✅ JWT Secret: Working');
      console.log('   🔐 Token generated and verified successfully');
    } else {
      console.log('   ❌ JWT Secret: Verification failed');
    }
  } catch (error) {
    console.log('   ❌ JWT Secret: Failed');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎉 API Testing Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Run: npm run install:all');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3000');
}

testAPIs(); 