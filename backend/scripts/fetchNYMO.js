import puppeteer from 'puppeteer';
import fs from 'fs';

async function fetchNYMO() {
  const url = 'https://stockcharts.com/h-sc/ui?s=$NYMO';
  const browser = await puppeteer.launch({ headless: 'new', args: ['--incognito', '--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2' });
  const content = await page.content();
  console.log('Puppeteer 抓到的 HTML:', content.slice(0, 1000)); // 只印前1000字

  // 等待圖表上方的文字出現
  await page.waitForSelector('.chartNotesContainer', { timeout: 30000 });

  // 取得圖表上方的文字
  const text = await page.$eval('.chartNotesContainer', el => el.innerText);
  console.log('抓到的內容：', text);

  // 用正則表達式抓取 Close 後面的數字
  const match = text.match(/Close\s([-\d.]+)/);
  if (match) {
    const nymoValue = parseFloat(match[1]);
    const now = new Date();
    const data = {
      value: nymoValue,
      date: now.toISOString(),
    };
    fs.writeFileSync('./backend/scripts/nymo-latest.json', JSON.stringify(data, null, 2));
    console.log(`[${now.toLocaleString()}] NYMO: ${nymoValue}`);
    await browser.close();
    return nymoValue;
  } else {
    console.log('NYMO value not found');
    await browser.close();
    return null;
  }
}

fetchNYMO();