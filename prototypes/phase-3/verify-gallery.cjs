const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async()=>{
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    const checks = [];
    for (const width of [1440,834,390]) {
      await page.setViewportSize({width,height:1050});
      await page.goto('http://127.0.0.1:4327/gallery.html');
      await page.locator('img').last().waitFor();
      assert.equal(await page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.equal(await page.locator('.card').count(),3);
      checks.push({width,images:true,noOverflow:true,threeDirections:true});
      if(width===1440) await page.screenshot({path:path.join(__dirname,'gallery-desktop.png'),fullPage:true});
    }
    for (const theme of ['night','marble','journal']) {
      await page.goto('http://127.0.0.1:4327/gallery.html');
      await page.locator(`.action[href="/?theme=${theme}"]`).click();
      assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    }
    fs.writeFileSync(path.join(__dirname,'gallery-verification.json'),JSON.stringify({checked_at:new Date().toISOString(),checks,themeLinksPassed:3},null,2)+'\n');
    console.log('Gallery PASS: images and layout at 3 sizes; all 3 theme links.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
