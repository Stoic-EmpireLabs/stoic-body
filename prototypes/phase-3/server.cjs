const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const allowed = {'/':'index.html','/index.html':'index.html','/gallery.html':'gallery.html','/styles.css':'styles.css','/app.js':'app.js','/appearance.js':'appearance.js','/night-today-desktop.png':'night-today-desktop.png','/marble-today-desktop.png':'marble-today-desktop.png','/journal-today-desktop.png':'journal-today-desktop.png'};
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'};
const port = Number(process.env.STOIC_PROTOTYPE_PORT || 4327);
http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://127.0.0.1').pathname;
  const file = Object.hasOwn(allowed,pathname) ? allowed[pathname] : null;
  if(req.method!=='GET' || !file){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; frame-ancestors 'none'"});
  fs.createReadStream(path.join(__dirname,file)).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Stoic Body design preview: http://127.0.0.1:${port}`));
