import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import {startPilot} from '../../apps/local-pilot/server';
import {authenticatePage} from './helpers';
test('Settings downloads encrypted data, previews a restore and preserves goal and XP after reload',async()=>{
 const app=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch({headless:true});try{
  const page=await browser.newPage();page.setDefaultTimeout(5000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await authenticatePage(page,app.url);await page.goto(app.url+'/?view=goals');
  await page.getByLabel('Goal title',{exact:true}).fill('Restore this goal');await page.getByLabel('Why it matters').fill('Synthetic recovery verification');await page.getByRole('button',{name:'Save goal',exact:true}).click();
  await page.getByText('Restore this goal',{exact:true}).first().waitFor();
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByLabel('Backup passphrase',{exact:true}).fill('synthetic export passphrase');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download encrypted backup'}).click();const file=await readFile((await (await download).path())!);
  assert.equal(file.toString().includes('Restore this goal'),false);
  // Change through the real API as another open client would.
  await page.evaluate(async()=>{const b=await(await fetch('/api/bootstrap')).json();await fetch('/api/command',{method:'POST',headers:{'Content-Type':'application/json','X-Stoic-Token':b.token},body:JSON.stringify({schemaVersion:1,operationId:'later-change',deviceId:'ui-test',entityId:b.snapshot.goals[0].id,type:'goal.update',baseRevision:1,payload:{title:'A later change',why:'Changed after export'}})});});
  await page.getByLabel('Encrypted backup file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:file});await page.getByLabel('Restore passphrase').fill('this is the wrong passphrase');await page.getByRole('button',{name:'Preview file restore'}).click();await page.getByText('Wrong backup passphrase or damaged file.').waitFor();
  await page.getByLabel('Restore passphrase').fill('synthetic export passphrase');await page.getByRole('button',{name:'Preview file restore'}).click();await page.getByRole('heading',{name:'Review before restoring'}).waitFor();
  // A second client changes the workspace after the preview; the UI must demand a fresh review.
  await page.evaluate(async()=>{const b=await(await fetch('/api/bootstrap')).json();await fetch('/api/command',{method:'POST',headers:{'Content-Type':'application/json','X-Stoic-Token':b.token},body:JSON.stringify({schemaVersion:1,operationId:'after-preview',deviceId:'ui-test',entityId:b.snapshot.goals[0].id,type:'goal.update',baseRevision:2,payload:{title:'A later change',why:'Another edit'}})});});
  await page.getByLabel('Replace my current app data with this backup').check();await page.getByRole('button',{name:'Confirm restore'}).click();await page.getByText('Your workspace changed after the preview. Preview again before restoring.').waitFor();assert.equal(await page.getByRole('button',{name:'Confirm restore'}).count(),0);
  await page.getByRole('button',{name:'Preview file restore'}).click();await page.getByRole('heading',{name:'Review before restoring'}).waitFor();
  await mkdir('private/recovery-evidence',{recursive:true});await page.locator('#recovery').screenshot({path:'private/recovery-evidence/settings-desktop.png'});
  await page.getByLabel('Replace my current app data with this backup').check();await page.getByRole('button',{name:'Confirm restore'}).click();await page.waitForURL('**/?view=settings');await page.getByRole('heading',{name:'Data & recovery'}).waitFor();
  await page.getByRole('button',{name:'Goals',exact:true}).click();await page.getByText('Restore this goal',{exact:true}).first().waitFor();assert.equal(await page.getByText('A later change',{exact:true}).count(),0);await page.reload();await page.getByRole('button',{name:'Goals',exact:true}).click();await page.getByText('Restore this goal',{exact:true}).first().waitFor();assert.equal(await page.locator('#total-xp').textContent(),'0 XP');
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:/Preview before restore/}).click();await page.getByRole('heading',{name:'Review before restoring'}).waitFor();await page.setViewportSize({width:390,height:844});await page.locator('#recovery').screenshot({path:'private/recovery-evidence/settings-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.getByRole('button',{name:'Cancel restore'}).click();assert.deepEqual(errors,[]);
 }finally{await browser.close();await app.close();}
});

