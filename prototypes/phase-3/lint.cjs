// Narrow prototype lint using the existing TypeScript parser; no dependency installation.
const fs=require('node:fs');
const path=require('node:path');
const ts=require('../../node_modules/typescript');
const errors=[];
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
const appearance=fs.readFileSync(path.join(__dirname,'appearance.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'styles.css'),'utf8');
const source=ts.createSourceFile('prototype.js',app+'\n'+appearance,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
for(const d of source.parseDiagnostics)errors.push(ts.flattenDiagnosticMessageText(d.messageText,' '));
function visit(node){
  if(ts.isDebuggerStatement(node))errors.push('Debugger statement');
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&['eval','alert','fetch'].includes(node.expression.text))errors.push('Disallowed preview call: '+node.expression.text);
  if(ts.isNewExpression(node)&&ts.isIdentifier(node.expression)&&['Function','WebSocket','XMLHttpRequest'].includes(node.expression.text))errors.push('Disallowed preview constructor: '+node.expression.text);
  if(ts.isBinaryExpression(node)&&[ts.SyntaxKind.EqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsToken].includes(node.operatorToken.kind))errors.push('Use strict equality');
  ts.forEachChild(node,visit);
}
visit(source);
if(/\son\w+\s*=/i.test(html))errors.push('Inline HTML event handler');
if(!html.includes('<html lang="en"'))errors.push('Missing document language');
if(!html.includes('name="viewport"'))errors.push('Missing viewport');
if(!html.includes('aria-live="polite"'))errors.push('Missing status live region');
if(!html.includes('Fictional data'))errors.push('Missing prototype disclosure');
if(!css.includes('prefers-reduced-motion'))errors.push('Missing reduced-motion handling');
if(!css.includes(':focus-visible'))errors.push('Missing visible-focus styles');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
if(new Set(ids).size!==ids.length)errors.push('Duplicate static HTML IDs');
if(/localStorage|sessionStorage|sendBeacon/.test(app))errors.push('Preview must not persist or transmit personal entries');
if(!appearance.includes("const key='stoic-body.appearance.v1'"))errors.push('Appearance storage key must be scoped');
if(/sessionStorage|sendBeacon/.test(appearance))errors.push('Unexpected storage or transmission in appearance module');
console.log(JSON.stringify({scope:'Prototype syntax/style/safety lint; not a full ESLint or accessibility audit',passed:errors.length===0,errors},null,2));
process.exitCode=errors.length?1:0;
