const { chromium } = require('C:/Users/stoic/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const jobs=[
  ['structured-ui','https://structured.app/','Structured app on iPhone showing daily timeline'],
  ['tiimo-ui','https://www.tiimoapp.com/','Tiimo app interface displaying'],
  ['ladder-ui','https://www.joinladder.com/','Ladder app showing daily workout'],
  ['stoic-ui','https://www.getstoic.com/features','Blurbs saying morning preparation'],
  ['cronometer-ui','https://cronometer.com/gold/',null],
  ['habitica-ready','https://habitica.com/static/features',null],
  ['structured-web-entry','https://web.structured.app/',null]
 ];
 const results=[];
 for(let i=0;i<jobs.length;i+=3){await Promise.all(jobs.slice(i,i+3).map(async([id,url,alt])=>{
  const page=await context.newPage();const result={id,url,surface:'Public interface illustration or unauthenticated entry',captured_at:new Date().toISOString()};
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});result.http_status=response?.status();
   await page.waitForFunction(()=>document.body.innerText.length>300,null,{timeout:10000}).catch(()=>{});
   await page.waitForLoadState('networkidle',{timeout:8000}).catch(()=>{});
   if(alt){const target=page.locator('img').filter({visible:true}).and(page.locator('img[alt]')).filter({hasNot:page.locator('nosuchtag')});
    const image=page.locator(`img[alt*=${JSON.stringify(alt)}]`).first();
    await image.scrollIntoViewIfNeeded({timeout:10000});
    await image.evaluate(async image=>{if(!image.complete)await image.decode().catch(()=>{});});
    await image.screenshot({path:path.join(__dirname,'screens',id+'.png'),timeout:10000});
   }else{await page.screenshot({path:path.join(__dirname,'screens',id+'.png')});}
   result.screenshot='screens/'+id+'.png';result.title=await page.title();
   result.body_sample=(await page.locator('body').innerText()).slice(0,1800);
   result.controls=await page.locator('button,a,input').evaluateAll(nodes=>nodes.map(e=>({tag:e.tagName,text:e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder'),href:e.getAttribute('href')})).filter(e=>e.text).slice(0,30));
  }catch(e){result.error=e.message;}
  results.push(result);console.log(JSON.stringify({id,status:result.http_status,error:result.error}));await page.close();
 }));}
 fs.writeFileSync(path.join(__dirname,'interface-captures.json'),JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
