// Research utility only. Captures public marketing interfaces in an isolated browser.
const { chromium } = require('C:/Users/stoic/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const targets = [
  ['structured', 'https://structured.app/'],
  ['finch', 'https://finchcare.com/about-finch'],
  ['hevy', 'https://www.hevyapp.com/features/'],
  ['macrofactor', 'https://macrofactor.com/macrofactor/'],
  ['tiimo', 'https://www.tiimoapp.com/'],
  ['ladder', 'https://www.joinladder.com/'],
  ['cronometer', 'https://cronometer.com/features/'],
  ['calisteniapp', 'https://calisteniapp.com/workouts/smart'],
  ['habitica', 'https://habitica.com/static/features'],
  ['stoic', 'https://www.getstoic.com/features']
];
(async () => {
  const output = path.join(__dirname, 'screens');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const records = [];
  for (let start = 0; start < targets.length; start += 3) {
    await Promise.all(targets.slice(start, start + 3).map(async ([id, url]) => {
      const page = await context.newPage();
      const record = { id, requested_url: url, captured_at: new Date().toISOString(), surface: 'Public marketing page; not authenticated native app' };
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
        record.http_status = response?.status();
        await page.locator('body').waitFor({ timeout: 10000 });
        await page.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight).every(i => i.complete), null, { timeout: 5000 }).catch(() => {});
        record.final_url = page.url();
        record.title = await page.title();
        record.visible_text_sample = (await page.locator('body').innerText()).slice(0, 900);
        record.images = await page.locator('img').evaluateAll(images => images.map(i => { const r = i.getBoundingClientRect(); return { alt: i.alt, x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }; }).filter(i => i.width > 100 && i.height > 100).slice(0, 8));
        record.screenshot = 'screens/' + id + '.png';
        await page.screenshot({ path: path.join(output, id + '.png') });
      } catch (error) { record.error = error.message; }
      records.push(record);
      console.log(JSON.stringify({ id, status: record.http_status, title: record.title, error: record.error }));
      await page.close();
    }));
  }
  fs.writeFileSync(path.join(__dirname, 'visual-captures.json'), JSON.stringify(records, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
