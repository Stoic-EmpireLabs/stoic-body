/* Only appearance preferences are stored. No profile, schedule or health data enters this key. */
'use strict';
const Appearance=(()=>{
  const key='stoic-body.appearance.v1';
  const presets={
    night:{label:'Crimson & Gold',description:'Black · red · gold',mode:'dark',accent:'#b91c35',gold:'#e6c36a'},
    marble:{label:'Quiet Marble',description:'Ivory · plum · gold',mode:'light',accent:'#634188',gold:'#806320'},
    journal:{label:'Training Journal',description:'Slate · green · gold',mode:'light',accent:'#165f50',gold:'#9c7926'}
  };
  const defaults=()=>({version:1,theme:'night',mode:'dark',accent:'#b91c35',gold:'#e6c36a'});
  const valid=p=>p&&p.version===1&&Object.hasOwn(presets,p.theme)&&['dark','light','system'].includes(p.mode)&&typeof p.accent==='string'&&typeof p.gold==='string'&&/^#[a-f\d]{6}$/i.test(p.accent)&&/^#[a-f\d]{6}$/i.test(p.gold);
  const clean=p=>({version:1,theme:p.theme,mode:p.mode,accent:p.accent.toLowerCase(),gold:p.gold.toLowerCase()});
  let prefs=defaults(),storageMessage='Saved only in this browser. Device sync comes with the full app.';
  try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(valid(saved))prefs=clean(saved);}catch{storageMessage='Applied for this visit. Browser storage is unavailable or could not be read.';}
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  const rgb=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16));
  const mix=(a,b,amount)=>'#'+rgb(a).map((c,i)=>Math.round(c*(1-amount)+rgb(b)[i]*amount).toString(16).padStart(2,'0')).join('');
  const luminance=color=>{const c=rgb(color).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const ink=bg=>contrast('#ffffff',bg)>contrast('#000000',bg)?'#ffffff':'#000000';
  function readable(color,bg){const target=ink(bg);for(let i=0;i<=20;i++){const candidate=mix(color,target,i/20);if(contrast(candidate,bg)>=4.5)return candidate;}return target;}
  function apply(){
    const root=document.documentElement,dark=prefs.mode==='dark'||(prefs.mode==='system'&&system.matches);
    root.dataset.theme=prefs.theme;root.dataset.mode=dark?'dark':'light';root.dataset.appearance='true';root.style.colorScheme=dark?'dark':'light';
    const base=dark?{bg:'#090909',panel:'#141414',panel2:'#1c1a19',text:'#f8f3e8',muted:'#c7bdb3',line:'#655a55',sidebar:'#0d0d0d',green:'#a4d8b7',red:'#ffb1ac'}:{bg:'#f2efe8',panel:'#fffefa',panel2:'#eeebe3',text:'#2a2531',muted:'#696270',line:'#9a8f98',sidebar:'#e9e5dd',green:'#286e4e',red:'#a13435'};
    const soft=mix(base.panel,prefs.accent,dark?.18:.08);
    const values={...base,soft,accent:readable(prefs.accent,soft),onaccent:ink(readable(prefs.accent,soft)),gold:readable(prefs.gold,base.panel),chart:readable(prefs.accent,base.panel),action:prefs.accent,onaction:ink(prefs.accent),'hero-start':soft,'hero-end':base.panel};
    for(const [k,v] of Object.entries(values))root.style.setProperty('--'+k,v);
    root.style.setProperty('--heading',prefs.theme==='journal'?"'Segoe UI',Arial,sans-serif":"Georgia,'Times New Roman',serif");
    root.style.setProperty('--radius',prefs.theme==='journal'?'10px':'18px');
    refreshControls();
  }
  function refreshControls(){
    document.querySelectorAll('[data-theme-option],[data-appearance-preset]').forEach(b=>{const name=b.getAttribute('data-theme-option')||b.getAttribute('data-appearance-preset');const p=presets[name];b.setAttribute('aria-pressed',String(prefs.theme===name&&prefs.accent===p.accent&&prefs.gold===p.gold));});
    document.querySelectorAll('[data-appearance-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute('data-appearance-mode')===prefs.mode)));
    for(const field of ['accent','gold']){const output=document.querySelector(`[data-color-value="${field}"]`);if(output)output.textContent=prefs[field].toUpperCase();const input=document.querySelector(`[data-appearance-color="${field}"]`);if(input instanceof HTMLInputElement)input.value=prefs[field];}
    const storage=document.querySelector('#appearance-storage');if(storage)storage.textContent=storageMessage;
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(clean(prefs)));storageMessage='Saved only in this browser. Device sync comes with the full app.';}catch{storageMessage='Applied for this visit. Browser storage is unavailable.';}refreshControls();}
  function preset(name,persist=true){if(!Object.hasOwn(presets,name))return;const p=presets[name];prefs={version:1,theme:name,mode:p.mode,accent:p.accent,gold:p.gold};apply();if(persist)save();}
  function markup(){return `<section class="card appearance-card" aria-labelledby="appearance-heading"><div class="card-title"><div><p class="eyebrow">MAKE IT YOURS</p><h2 id="appearance-heading">Theme & colors</h2></div><span class="pill gold">Live preview</span></div><p class="tiny muted">Choose the light, the colors and the mood of your daily practice.</p><div class="appearance-grid"><div><h3 class="appearance-label">Theme</h3><div class="appearance-modes" role="group" aria-label="Theme mode">${[['dark','Dark'],['light','Light'],['system','System']].map(([mode,label])=>`<button data-appearance-mode="${mode}" aria-pressed="${prefs.mode===mode}">${label}</button>`).join('')}</div><h3 class="appearance-label">Color presets</h3><div class="appearance-presets" role="group" aria-label="Color presets">${Object.entries(presets).map(([name,p])=>`<button data-appearance-preset="${name}" aria-label="${p.label} preset" aria-pressed="${prefs.theme===name&&prefs.accent===p.accent&&prefs.gold===p.gold}"><span class="palette-dots" aria-hidden="true"><i style="background:${p.mode==='dark'?'#090909':'#f2efe8'}"></i><i style="background:${p.accent}"></i><i style="background:${p.gold}"></i></span><strong>${p.label}</strong><small>${p.description}</small></button>`).join('')}</div></div><div><h3 class="appearance-label">Custom colors</h3><div class="color-fields">${[['accent','Accent color'],['gold','Gold and reward color']].map(([field,label])=>`<label class="color-field"><span>${label}</span><input type="color" data-appearance-color="${field}" value="${prefs[field]}" aria-label="${label}"><output data-color-value="${field}">${prefs[field].toUpperCase()}</output></label>`).join('')}</div><p class="tiny muted">Text and highlights adjust for readable contrast.</p><div class="appearance-example"><span class="label">YOUR DAILY PRACTICE</span><h3>Make today count.</h3><div class="buttons"><button class="button primary" data-view="today">Preview Today →</button><span class="xp-chip">+25 XP</span></div><div class="progress-track" aria-label="Sample appearance progress"><span style="width:65%"></span></div></div></div></div><div class="appearance-footer"><p id="appearance-storage" class="tiny muted" role="status">${storageMessage}</p><button class="button ghost" data-appearance-reset>Reset appearance</button></div></section>`;}
  document.addEventListener('click',event=>{
    const button=event.target instanceof Element?event.target.closest('button'):null;if(!button)return;
    if(button.hasAttribute('data-appearance-mode')){const mode=button.getAttribute('data-appearance-mode');if(['dark','light','system'].includes(mode)){prefs.mode=mode;apply();save();}}
    if(button.hasAttribute('data-appearance-preset'))preset(button.getAttribute('data-appearance-preset'));
    if(button.hasAttribute('data-appearance-reset')){prefs=defaults();apply();save();}
  });
  function colorInput(event){const input=event.target;if(!(input instanceof HTMLInputElement)||!input.hasAttribute('data-appearance-color'))return;const field=input.getAttribute('data-appearance-color');if(!['accent','gold'].includes(field)||!/^#[a-f\d]{6}$/i.test(input.value))return;prefs[field]=input.value.toLowerCase();apply();if(event.type==='change')save();}
  document.addEventListener('input',colorInput);document.addEventListener('change',colorInput);
  system.addEventListener('change',()=>{if(prefs.mode==='system')apply();});
  apply();
  return {preset,markup};
})();
