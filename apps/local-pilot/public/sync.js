/* global window */
'use strict';
window.DeviceSync=(()=>{
 let ctx;
 function init(value){ctx=value;}
 function render(root){
  const {element:el,card,api}=ctx,section=card('Your devices');section.id='device-sync';root.append(section);
  section.append(el('p','Use this computer on its own, or connect Windows installations through your private host. Saved changes wait on this device whenever the host is off. Open both apps and connect Tailscale to catch up.','muted'));
  section.append(el('p','Each person keeps a separate account. Pair your own account across your devices; your wife can create her own account and goals. Apple offline apps and native alarms are still in development.','muted'));
  const status=el('p','Checking your devices…');status.setAttribute('role','status');status.setAttribute('aria-live','polite');section.append(status);
  const content=el('div');section.append(content);let working=false,preview=null;
  const run=async(fn)=>{if(working)return;working=true;section.setAttribute('aria-busy','true');section.querySelectorAll('button,input').forEach(x=>x.disabled=true);try{await fn();}catch(e){if(section.isConnected)status.textContent=e.message;}finally{working=false;section.removeAttribute('aria-busy');section.querySelectorAll('button,input').forEach(x=>x.disabled=false);}};
  const button=(title,fn)=>{const b=el('button',title,'button ghost');b.type='button';b.addEventListener('click',()=>void run(fn));return b;};
  const field=(parent,title,type='text')=>{const label=el('label',title,'recovery-label'),input=el('input');input.type=type;input.autocomplete='off';label.append(input);parent.append(label);return input;};
  async function load(){const s=await api('sync/status');if(!section.isConnected)return;content.replaceChildren();status.textContent=s.linked?`Connected · ${s.remoteName}`:'Saved on this computer';
   if(s.linked){
    content.append(el('p',`${s.queued} changes waiting · ${s.conflicts.length} to review. Last successful sync: ${s.lastSuccess?new Date(s.lastSuccess).toLocaleString():'Not yet'}.`),el('p',s.endpoint,'sync-address'));
    if(s.error)content.append(el('p',s.error,'sync-warning'));
    content.append(button('Sync now',async()=>{await api('sync/now',{});await load();ctx.updated();}));
    const disconnect=el('details');disconnect.append(el('summary','Disconnect this device'),el('p','Local records stay on this device. Unsent proposals remain available for review. Pairing again requires you to review them first.'));
    disconnect.append(button('Keep data and disconnect',async()=>{await api('sync/disconnect',{});await load();}));content.append(disconnect);
   }else{
    const host=el('details');host.open=true;host.append(el('summary','1. Use this computer as the host'));
    host.append(el('p',s.hostAddress?`Private address: ${s.hostAddress}`:'Private hosting has not been configured on this computer. The included README explains Tailscale setup. Local use works now.','sync-address'));
    host.append(el('p','Sign in to the account you want to share, create a code, then enter it on your other Windows installation. The code grants access to this account. It expires after 10 minutes.','muted'));
    const codeBox=el('div');host.append(button('Create pairing code',async()=>{const p=await api('sync/code',{});if(!section.isConnected)return;codeBox.replaceChildren();const code=field(codeBox,'Pairing code');code.readOnly=true;code.value=p.code;codeBox.append(el('p',`Expires ${new Date(p.expiresAt).toLocaleTimeString()}. Keep this private.`));status.textContent='Pairing code ready.';}),codeBox);content.append(host);
    const join=el('details');join.open=true;join.append(el('summary','2. Connect this device to an existing host'));
    const endpoint=field(join,'Host address','url');endpoint.placeholder='https://your-desktop.your-tailnet.ts.net:8443';const code=field(join,'Code from host');code.maxLength=64;const name=field(join,'This device name');name.maxLength=60;name.placeholder='My laptop';
    const review=el('div');review.className='recovery-preview';
    for(const input of [endpoint,code,name])input.addEventListener('input',()=>{preview=null;review.replaceChildren();});
    join.append(button('Preview connection',async()=>{
     preview=null;review.replaceChildren();const result=await api('sync/link-preview',{endpoint:endpoint.value.trim(),code:code.value.trim(),name:name.value.trim()});if(!section.isConnected)return;preview=result;
     review.append(el('h3','Review this connection'),el('p',`Host account: ${result.hostAccount.displayName} (@${result.hostAccount.username}). This replaces app data in your current local account. Your local password, guide and theme stay the same. A recovery point is saved first.`));
     const table=el('table');table.className='recovery-comparison';const header=el('tr');for(const title of ['Records','This device','Host'])header.append(el('th',title));table.append(header);
     for(const [key,title] of Object.entries({goals:'Goals',tasks:'Tasks',sessions:'Sessions',healthEntries:'Health logs',courses:'Courses'})){const row=el('tr');row.append(el('th',title),el('td',String(result.current[key])),el('td',String(result.incoming[key])));table.append(row);}review.append(table);
     const label=el('label','Replace this account’s app data with the host account','recovery-confirm'),check=el('input');check.type='checkbox';label.prepend(check);review.append(label);
     review.append(button('Confirm connection',async()=>{if(!check.checked){status.textContent='Check the replacement confirmation first.';return;}await api('sync/link-confirm',{previewId:preview.previewId});preview=null;code.value='';await load();ctx.updated();}));status.textContent='Preview ready. Your data has not changed.';
    }),review);content.append(join);
   }
   if(s.devices.some(d=>!d.revoked)){content.append(el('h3','Devices using this host account'));for(const device of s.devices.filter(d=>!d.revoked)){const row=el('div',undefined,'pilot-row');row.append(el('p',device.name),button(`Revoke ${device.name}`,async()=>{await api('sync/revoke',{deviceId:device.id});await load();}));content.append(row);}}
   if(s.conflicts.length){content.append(el('h3','Saved proposals to review'),el('p','The current workspace follows the host. These proposals were kept separately because they could not be merged safely. Copy any details you want to keep, then use the normal editor to make a fresh change.','muted'));
    for(const conflict of s.conflicts){const row=el('details'),payload=conflict.command.payload;const title=payload.title||({'health.save':'Health entry','profile.answer':'Profile answer','schedule.accept':'Day plan','completion.set':'Session completion','learning.checkpoint':'Course progress'}[conflict.command.type])||'Saved change';row.append(el('summary',title),el('p',conflict.reason));
     const details=conflict.details;
     if(details?.schedule){const schedule=details.schedule;row.append(el('p',`Original planned times · ${schedule.timezone}`));const list=el('ul');for(const placement of schedule.placements){const item=el('li'),format=value=>new Intl.DateTimeFormat(undefined,{timeZone:schedule.timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(value));item.append(el('strong',placement.title),el('p',`${format(placement.startAt)} – ${format(placement.endAt)}`),el('small',`Task reference: ${placement.taskId}`,'sync-address'));list.append(item);}row.append(list);}
     else if(details)row.append(el('p',`Applies to: ${details.entityLabel}`),el('small',`Record reference: ${details.entityId}`,'sync-address'));
     const fields=el('dl');for(const [key,value] of Object.entries(payload)){fields.append(el('dt',key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())),el('dd',typeof value==='object'?JSON.stringify(value,null,2):String(value),'sync-proposal'));}row.append(fields,button('Keep current version and dismiss proposal',async()=>{await api('sync/resolve',{operationId:conflict.operationId});await load();}));content.append(row);}
   }
  }
  void run(load);
 }
 return {init,render};
})();
