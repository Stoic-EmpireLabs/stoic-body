const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Only the synthetic review assets are eligible for upload.
const files = ['index.html', 'gallery.html', 'app.js', 'appearance.js', 'styles.css',
  'night-today-desktop.png', 'marble-today-desktop.png', 'journal-today-desktop.png'];
const project = path.resolve(__dirname, '../..');
const destination = path.join(project, '.vercel', 'phase-3-static');
const output = path.join(destination, '.vercel', 'output');
fs.mkdirSync(path.join(output, 'static'), {recursive:true});
const link = JSON.parse(fs.readFileSync(path.join(project, '.vercel', 'project.json'), 'utf8'));
if (link.projectName !== 'stoic-body') throw new Error('Unexpected Vercel project; review target before publishing.');
fs.writeFileSync(path.join(destination, '.vercel', 'project.json'), JSON.stringify({projectId:link.projectId, orgId:link.orgId, projectName:link.projectName}, null, 2));
const manifest = [];
for (const file of files) {
  const bytes = fs.readFileSync(path.join(__dirname, file));
  fs.writeFileSync(path.join(output, 'static', file), bytes);
  manifest.push({file, bytes:bytes.length, sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const actual = fs.readdirSync(path.join(output, 'static'));
if (actual.length !== files.length || actual.some(file => !files.includes(file))) throw new Error('Unexpected upload file.');
fs.writeFileSync(path.join(output, 'config.json'), JSON.stringify({version:3, routes:[
  {src:'/(.*)',headers:{'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow',
    'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"},continue:true},
  {handle:'filesystem'}, {src:'/',dest:'/index.html'}
]}, null, 2));
fs.writeFileSync(path.join(__dirname, 'publish-manifest.json'), JSON.stringify({scope:'Synthetic static prototype only',files:manifest},null,2)+'\n');
console.log(JSON.stringify({destination, files:manifest.map(f=>f.file), bytes:manifest.reduce((n,f)=>n+f.bytes,0)},null,2));
