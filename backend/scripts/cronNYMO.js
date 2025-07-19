// cronNYMO.js
import cron from 'node-cron';
import './fetchNYMO.js';

// 美國加州時間下午5點 = UTC+0凌晨0點
cron.schedule('0 0 * * *', () => {
  import('./fetchNYMO.js');
  // 這裡會每天自動執行 fetchNYMO
});