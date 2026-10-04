const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:4327';
const key='stoic-body.appearance.v1';
const checks=[];
const check=(name,pass)=>{assert.ok(pass,name);checks.push(name);};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({colorScheme:'dark'}),page=await context.newPage();
  await page.goto(base+'/?view=settings');
  await page.getByRole('heading',{name:'Theme & colors',exact:true}).waitFor({timeout:3000});
  check('Appearance is a real Settings section',true);
  await page.getByRole('button',{name:'Light',exact:true}).click();
  check('Light mode applied',await page.locator('html').getAttribute('data-mode')==='light');
  await page.getByRole('button',{name:'System',exact:true}).click();
  await page.emulateMedia({colorScheme:'light'});
  await page.waitForFunction(()=>document.documentElement.dataset.mode==='light');
  check('System responds to light preference',await page.locator('html').getAttribute('data-mode')==='light');
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForFunction(()=>document.documentElement.dataset.mode==='dark');
  check('System responds to dark preference',await page.locator('html').getAttribute('data-mode')==='dark');
  await page.getByRole('button',{name:'Quiet Marble preset',exact:true}).click();
  check('Preset changes theme and mode',await page.locator('html').getAttribute('data-theme')==='marble'&&await page.locator('html').getAttribute('data-mode')==='light');
  await page.getByLabel('Accent color',{exact:true}).fill('#000000');
  await page.getByLabel('Gold and reward color',{exact:true}).fill('#ffffff');
  const values=await page.evaluate(()=>({prefs:JSON.parse(localStorage.getItem('stoic-body.appearance.v1')),action:getComputedStyle(document.documentElement).getPropertyValue('--action').trim()}));
  check('Custom color applies and is stored',values.prefs.accent==='#000000'&&values.prefs.gold==='#ffffff'&&values.action==='#000000');
  const contrast=await page.evaluate(()=>{
    const lum=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
    const e=document.querySelector('.appearance-example .button'),s=getComputedStyle(e),a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  check('Custom action text remains readable',contrast>=4.5);
  await page.locator('#desktop-nav').getByRole('button',{name:'Today',exact:true}).click();
  await page.getByRole('button',{name:'Complete Movement & strength',exact:true}).click();
  await page.reload();
  check('Appearance survives refresh',await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--action').trim())==='#000000');
  await page.locator('#desktop-nav').getByRole('button',{name:'Today',exact:true}).click();
  check('Sample health/task data still resets',await page.locator('[data-xp]').textContent()==='80 XP');
  check('Only appearance is stored',await page.evaluate(()=>Object.keys(localStorage).length===1&&Object.keys(JSON.parse(localStorage.getItem('stoic-body.appearance.v1'))).sort().join(',')==='accent,gold,mode,theme,version'));
  await page.goto(base+'/?view=settings');
  await page.getByRole('button',{name:'Reset appearance',exact:true}).click();
  await page.reload();
  check('Reset restores red black and gold persistently',await page.locator('html').getAttribute('data-theme')==='night'&&await page.getByLabel('Accent color',{exact:true}).inputValue()==='#b91c35');
  await page.evaluate(k=>localStorage.setItem(k,'{"mode":"evil","accent":"url(https://example.invalid)","gold":"#fff"}'),key);
  await page.reload();
  check('Invalid stored values recover to safe defaults',await page.getByLabel('Accent color',{exact:true}).inputValue()==='#b91c35');
  await page.evaluate(k=>localStorage.setItem(k,'{broken'),key);
  await page.reload();
  check('Malformed storage does not break settings',await page.getByRole('heading',{name:'Theme & colors',exact:true}).isVisible());
  await page.getByRole('button',{name:'Reset appearance',exact:true}).click();
  for(const width of [1440,834,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.locator('main').focus();await page.evaluate(()=>window.scrollTo(0,0));
   check(`${width}px settings has no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width===1440||width===390)await page.screenshot({path:path.join(__dirname,`appearance-${width}.png`),fullPage:true});
  }
  const blocked=await browser.newContext();
  await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('Storage denied');}});});
  const bp=await blocked.newPage();await bp.goto(base+'/?view=settings');
  await bp.getByRole('button',{name:'Light',exact:true}).click();
  check('Denied storage keeps controls usable and explains session-only setting',await bp.locator('html').getAttribute('data-mode')==='light'&&(await bp.locator('#appearance-storage').textContent()).includes('this visit'));
  fs.writeFileSync(path.join(__dirname,'appearance-verification.json'),JSON.stringify({checked_at:new Date().toISOString(),passed:true,checks},null,2)+'\n');
  console.log(`Appearance PASS: ${checks.length} checks.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
