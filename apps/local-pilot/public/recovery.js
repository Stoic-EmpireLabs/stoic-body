/* global window */
'use strict';
window.Recovery=(()=>{
 let ctx;
 function init(value){ctx=value;}
 function render(root){
  const {element:el,card,api}=ctx,section=card('Data & recovery');section.id='recovery';root.append(section);
  section.append(el('p','Keep a portable, encrypted copy of your goals, schedule, XP, health logs, course progress and setup answers. Your password, recovery key, other accounts and browser theme are excluded.','muted'));
  section.append(el('p','This version saves on this computer. Automatic device sync is not connected. The planned sync host may be off between syncs; separate offline clients are still in development.','muted'));
  const status=el('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');section.append(status);
  let working=false,pending=null;
  const run=async(fn)=>{if(working)return;working=true;status.textContent='Working…';section.setAttribute('aria-busy','true');section.querySelectorAll('button,input').forEach(x=>x.disabled=true);try{await fn();}catch(e){status.textContent=e.message;if(e.responseStatus===409){pending=null;review.replaceChildren();}}finally{working=false;section.removeAttribute('aria-busy');section.querySelectorAll('button,input').forEach(x=>x.disabled=false);}};
  const button=(title,fn)=>{const b=el('button',title,'button ghost');b.type='button';b.addEventListener('click',()=>void run(fn));return b;};
  const field=(title,type)=>{const label=el('label',title,'recovery-label'),input=el('input');input.type=type;label.append(input);section.append(label);return input;};
  section.append(el('h3','Download a backup'));
  const phrase=field('Backup passphrase','password');phrase.minLength=15;phrase.maxLength=128;phrase.autocomplete='new-password';
  section.append(el('p','Choose 15–128 characters and keep the passphrase separately. There is no reset for an encrypted file. Downloads may contain health information.','muted'));
  section.append(button('Download encrypted backup',async()=>{
    const result=await api('recovery/export',{passphrase:phrase.value});if(!section.isConnected)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(result.file)],{type:'application/json'})),a=el('a');a.href=url;a.download=`Stoic-Body-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);phrase.value='';status.textContent='Encrypted download created. Keep a copy away from this computer to protect against disk loss.';
  }));
  section.append(el('h3','Restore from a file'));
  const file=field('Encrypted backup file','file');file.accept='.json,application/json';const pass=field('Restore passphrase','password');pass.maxLength=128;pass.autocomplete='off';
  const review=el('div');review.className='recovery-preview';
  function show(p,source,passphrase){
    pending={source,passphrase,expectedFingerprint:p.fingerprint,digest:p.digest,operationId:crypto.randomUUID()};review.replaceChildren(el('h3','Review before restoring'),el('p',`Backup created ${new Date(p.createdAt).toLocaleString()}. This replaces your current app data. Your sign-in stays the same; other sessions will need to sign in again.`));
    const table=el('table');table.className='recovery-comparison';const header=el('tr');for(const title of ['Records','Current','Backup'])header.append(el('th',title));table.append(header);
    const labels={goals:'Goals',tasks:'Tasks',sessions:'Scheduled sessions',healthEntries:'Health entries',courses:'Courses',xp:'Total XP'};
    for(const [key,title] of Object.entries(labels)){const tr=el('tr');tr.append(el('th',title),el('td',String(p.current[key])),el('td',String(p.incoming[key])));table.append(tr);}review.append(table);
    const label=el('label','Replace my current app data with this backup','recovery-confirm'),check=el('input');check.type='checkbox';label.prepend(check);review.append(label);
    review.append(button('Confirm restore',async()=>{
      if(!check.checked){status.textContent='Read the preview and check the replacement confirmation first.';return;}
      await api('recovery/restore',pending);pending=null;pass.value='';file.value='';ctx.announceAccountChange();location.replace('/?view=settings');
    }),button('Cancel restore',async()=>{pending=null;pass.value='';file.value='';review.replaceChildren();status.textContent='Restore cancelled. Your data has not changed.';}));
    status.textContent='Preview ready. Nothing has been replaced.';
  }
  const invalidate=()=>{pending=null;review.replaceChildren();};file.addEventListener('change',invalidate);pass.addEventListener('input',invalidate);
  section.append(button('Preview file restore',async()=>{pending=null;review.replaceChildren();const chosen=file.files[0];if(!chosen)throw new Error('Choose an encrypted backup file.');if(chosen.size>24*1024*1024)throw new Error('Choose a file smaller than 24 MiB.');let parsed;try{parsed=JSON.parse(await chosen.text());}catch{throw new Error('The selected file is not valid JSON.');}const source={file:parsed},password=pass.value;const p=await api('recovery/preview',{source,passphrase:password});if(section.isConnected)show(p,source,password);}));
  section.append(el('h3','Local recovery points'),el('p','Up to seven points are saved before edits (at most once per hour) and before a restore. They share this computer’s unencrypted database and cannot protect against disk loss.','muted'));
  const points=el('div');section.append(points,review);
  void api('recovery/points').then(data=>{if(!section.isConnected)return;if(!data.points.length)points.append(el('p','A recovery point will appear before your next saved edit.','muted'));for(const point of data.points)points.append(button(`Preview ${point.reason.toLowerCase()} · ${new Date(point.createdAt).toLocaleString()}`,async()=>{pending=null;review.replaceChildren();const source={pointId:point.id},p=await api('recovery/preview',{source});if(section.isConnected)show(p,source);}));}).catch(e=>{if(section.isConnected)status.textContent=e.message;});
 }
 return {init,render};
})();
