import { chromium } from '../web/node_modules/playwright/index.mjs';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const webRoot = path.resolve(projectRoot, 'web');
const artifactDir = 'C:\\Users\\stoic\\.gemini\\antigravity\\brain\\958af3de-883f-4c46-95ab-6f08aeb8e3d0';

console.log('[1/4] Starting Vite preview server...');
const server = spawn('npm', ['--prefix', 'web', 'run', 'preview', '--', '--port', '4173'], {
  cwd: projectRoot,
  shell: true,
  stdio: 'pipe',
});

server.stdout.on('data', (d) => {
  const s = d.toString();
  if (s.includes('Local:')) {
    console.log('Preview Server is ready:', s.trim());
  }
});

server.stderr.on('data', (d) => {
  console.error('Server err:', d.toString());
});

// Wait 2.5 seconds for server to boot
await new Promise((r) => setTimeout(r, 2500));

console.log('[2/4] Launching Playwright browser...');
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

try {
  console.log('[3/4] Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });

  // 1. Home / Today Screen
  console.log('Capturing stoic-body-home.png...');
  await page.screenshot({ path: path.join(artifactDir, 'stoic-body-home.png'), fullPage: false });

  // 2. Anatomical Map / Train Screen
  console.log('Navigating to Anatomical Map (Train)...');
  const trainBtn = page.locator('text=Anatomical Map').first();
  if (await trainBtn.isVisible()) {
    await trainBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'stoic-body-train.png'), fullPage: false });
  }

  // 3. Exercise Library
  console.log('Navigating to Exercise Library...');
  const exerciseBtn = page.locator('text=Exercise Library').first();
  if (await exerciseBtn.isVisible()) {
    await exerciseBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'stoic-body-exercises.png'), fullPage: false });
  }

  // 4. Routines & Splits
  console.log('Navigating to Routines & Splits...');
  const routinesBtn = page.locator('text=Routines & Splits').first();
  if (await routinesBtn.isVisible()) {
    await routinesBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'stoic-body-routines.png'), fullPage: false });
  }

  // 5. Gym Calculators / Tools
  console.log('Navigating to Gym Calculators...');
  const toolsBtn = page.locator('text=Gym Calculators').first();
  if (await toolsBtn.isVisible()) {
    await toolsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'stoic-body-tools.png'), fullPage: false });
  }

  // 6. Settings & Privacy
  console.log('Navigating to Settings & Privacy...');
  const settingsBtn = page.locator('text=Settings & Privacy').first();
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'stoic-body-settings.png'), fullPage: false });
  }

  // 7. About Stoic Body
  console.log('Navigating to About Stoic Body...');
  const aboutBtn = page.locator('text=About Stoic Body').first();
  if (await aboutBtn.isVisible()) {
    await aboutBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'stoic-body-about.png'), fullPage: false });
  }

  console.log('[4/4] ALL SCREENSHOTS SUCCESSFULLY CAPTURED!');
} catch (err) {
  console.error('Test execution error:', err);
} finally {
  await browser.close();
  server.kill('SIGTERM');
  process.exit(0);
}
