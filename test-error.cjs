const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('button.primary');
  
  // Click 'New analysis' (which goes to /analyze)
  const buttons = await page.$$('button.primary');
  await buttons[0].click();
  
  await page.waitForSelector('form.analysis-form');
  
  // Click 'Analyze change'
  const analyzeBtn = await page.$('button[type="submit"]');
  await analyzeBtn.click();
  
  // Wait for loading to finish and page to potentially crash
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
})();
