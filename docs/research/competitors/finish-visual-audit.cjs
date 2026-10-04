const { chromium } = require('C:/Users/stoic/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs'); const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const records=[];
 await Promise.all([
  ['tiimo-store','https://apps.apple.com/us/app/tiimo-ai-plan-focus-to-do/id1480220328?platform=iphone',null],
  ['ladder-clear','https://www.joinladder.com/','Ladder app showing daily workout'],
  ['finch-store','https://apps.apple.com/us/app/finch-self-care-pet/id1528595748',null]
 ].map(async([id,url,alt])=>{
  const page=await context.newPage();const r={id,url,captured_at:new Date().toISOString()};
  try{r.status=(await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000})).status();
   await page.waitForLoadState('networkidle',{timeout:8000}).catch(()=>{});
   if(id==='tiimo-clear'){const decline=page.getByRole('button',{name:'DECLINE ALL',exact:true});if(await decline.count())await decline.click();}
   if(alt){const target=page.locator(`img[alt*=${JSON.stringify(alt)}]:visible`).first();await target.scrollIntoViewIfNeeded({timeout:8000});
    if(id==='tiimo-clear'){await page.getByText('DECLINE ALL',{exact:true}).click({timeout:5000}).catch(()=>{});await page.getByText('DECLINE ALL',{exact:true}).waitFor({state:'hidden',timeout:5000}).catch(()=>{});}
    await target.screenshot({path:path.join(__dirname,'screens',id+'.png')});}
   else{await page.screenshot({path:path.join(__dirname,'screens',id+'.png')});}
   r.screenshot='screens/'+id+'.png';r.title=await page.title();
  }catch(e){r.error=e.message;} records.push(r);console.log(JSON.stringify(r));await page.close();
 }));
 fs.writeFileSync(path.join(__dirname,'visual-repairs.json'),JSON.stringify(records,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
