import assert from 'node:assert/strict';
import type { Page } from 'playwright';
export const testCredentials = {username:'pilot-test',displayName:'Test client',password:'synthetic test passphrase only'};
export async function authenticatePage(page: Page,url: string) {
  let response=await page.request.post(url+'/api/auth/register',{headers:{Origin:url},data:testCredentials});
  if(response.status()===409) response=await page.request.post(url+'/api/auth/login',{headers:{Origin:url},data:{username:testCredentials.username,password:testCredentials.password}});
  assert.equal(response.status(),200,await response.text()); const data=await response.json();
  const guide=await page.request.post(url+'/api/guide',{headers:{Origin:url,'X-Stoic-Token':data.token},data:{baseRevision:data.guide.revision,state:{stage:'ready',question:0,tourStep:0,tourDone:true}}});
  assert.equal(guide.status(),200,await guide.text());
}
export async function authenticateHttp(url: string,login=false) {
  const body=login?{username:testCredentials.username,password:testCredentials.password}:testCredentials;
  const response=await fetch(url+`/api/auth/${login?'login':'register'}`,{method:'POST',headers:{Origin:url,'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal(response.status,200); const data=await response.json();
  return {data,headers:{Origin:url,'Content-Type':'application/json',Cookie:response.headers.get('set-cookie')!.split(';')[0],'X-Stoic-Token':data.token}};
}
