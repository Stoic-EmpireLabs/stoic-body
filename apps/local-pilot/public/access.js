/* global window */
'use strict';
window.Access = (() => {
  let ctx, mode = 'welcome', working = false;
  const el = (...a) => ctx.element(...a);
  function field(form, name, label, type, autocomplete) {
    const wrap=el('label',label), input=el('input'); input.name=name; input.type=type; input.required=true; input.autocomplete=autocomplete; input.setAttribute('aria-label',label); input.maxLength=name==='password'?128:name==='displayName'?60:48;
    if(name==='password') input.minLength=15; wrap.append(input); form.append(wrap); return input;
  }
  function button(label, fn, primary=false) {const b=el('button',label,`button ${primary?'primary':'ghost'}`); b.type='button'; b.addEventListener('click',fn); return b;}
  function show(error='') {
    document.querySelector('.pilot-shell').hidden=true;
    const root=document.querySelector('#access'); root.hidden=false; root.replaceChildren();
    const shell=el('div',undefined,'access-layout'), story=el('section',undefined,'access-story');
    story.append(el('div','S','access-emblem'),el('span','STOIC BODY','eyebrow'),el('h1','A life, intentionally lived.'),el('p','Turn what matters into a day you can actually follow. I’ll help you find your first step.','access-lead'));
    for(const [number,title,body] of [['01','Find your direction','Tell me about your goals, routines and the life you want to build.'],['02','Build a realistic day','Bring meals, movement, focused learning and family time into one plan.'],['03','Practice. Reflect. Progress.','Check off meaningful actions and earn XP. Recovery counts, too.']]) { const row=el('div',undefined,'access-promise');row.append(el('span',number),el('h2',title),el('p',body));story.append(row); }
    const card=ctx.card(mode==='welcome'?'Your next chapter starts here.':mode==='register'?'Make this space yours.':mode==='recover'?'Recover your account.':'Welcome back.');
    const status=el('p',error,'access-error');status.setAttribute('role','alert');card.append(status);
    if(mode==='welcome') {
      card.append(el('p','A guided setup, a clear next action, and support whenever you need it. No experience needed.','muted'),button('Create my account',()=>{mode='register';show();},true),button('Sign in',()=>{mode='login';show();}));
    } else {
      const form=el('form',undefined,'pilot-form');
      if(mode==='register') field(form,'displayName','Your name','text','nickname');
      const user=field(form,'username','Username','text','username');user.maxLength=40;user.minLength=3;user.pattern='[A-Za-z0-9][A-Za-z0-9_.-]{2,39}';
      if(mode==='recover') field(form,'recoveryKey','Recovery key','text','off');
      const pass=field(form,'password','Passphrase','password',mode==='login'?'current-password':'new-password');
      if(mode==='login') pass.minLength=1;
      form.append(button('Show passphrase',event=>{const hidden=pass.type==='password';pass.type=hidden?'text':'password';event.currentTarget.textContent=hidden?'Hide passphrase':'Show passphrase';}));
      form.append(el('small',mode==='login'?'Use the account you created on this computer.':'Use at least 15 characters. A few unrelated words can be easier to remember.','muted'));
      const submit=el('button',mode==='register'?'Create account':mode==='recover'?'Reset passphrase':'Sign in to my space','button primary');submit.type='submit';form.append(submit);
      form.addEventListener('submit',async event=>{
        event.preventDefault();if(working)return;working=true;status.textContent='';form.querySelectorAll('button,input').forEach(e=>{e.disabled=true;});
        const data={username:form.elements.username.value,password:pass.value}; if(mode==='register') data.displayName=form.elements.displayName.value;if(mode==='recover')data.recoveryKey=form.elements.recoveryKey.value;
        try {const result=await ctx.api(`auth/${mode}`,data); ctx.announceAccountChange(); if(result.recoveryKey) recovery(result.recoveryKey);else location.replace('/');}
        catch(e){status.textContent=e.message;form.querySelectorAll('button,input').forEach(e=>{e.disabled=false;});}
        finally{working=false;}
      }); card.append(form);
      card.append(button(mode==='login'?'Use my recovery key':'I already have an account',()=>{mode=mode==='login'?'recover':'login';show();}));
      card.append(button('Back to welcome',()=>{mode='welcome';show();}));
    }
    card.append(el('p','Your account and entries stay on this computer. Cloud sync is still being built. We do not send your answers to an AI service.','access-privacy'));
    shell.append(story,card);root.append(shell);root.querySelector('h1').tabIndex=-1;root.querySelector('h1').focus({preventScroll:true});
  }
  function recovery(key) {
    const root=document.querySelector('#access');root.replaceChildren();const c=ctx.card('Keep your recovery key');c.classList.add('recovery-card');
    c.append(el('p','Save this key in your password manager. It can reset your passphrase, so keep it private. It is shown only now; there is no email reset service.','muted'));
    const code=el('code',key);code.id='recovery-key';c.append(code,button('I saved my key — continue',()=>location.replace('/'),true));root.append(c);c.querySelector('h2').tabIndex=-1;c.querySelector('h2').focus();
  }
  async function signOut() {try {await ctx.api('auth/logout',{});ctx.announceAccountChange();}finally{location.replace('/');}}
  return {init:context=>{ctx=context;},show,signOut};
})();
