import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createSyncTransport} from '../../src/core/sync-transport';
test('transport rejects redirects and oversized replies, forwards abort and accepts bounded JSON',async()=>{
 let mode='normal';const server=createServer((_req,res)=>{if(mode==='redirect'){res.writeHead(302,{Location:'http://127.0.0.1:1'});res.end();return;}res.setHeader('Content-Type','application/json');if(mode==='oversize')res.setHeader('Content-Length',String(25*1024*1024));res.end('{"ok":true}');});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address!=='string');const endpoint=`http://127.0.0.1:${address.port}`,send=createSyncTransport(true);
 try{assert.deepEqual(await send(endpoint,'claim',{}),{ok:true});mode='redirect';await assert.rejects(send(endpoint,'claim',{}));mode='oversize';await assert.rejects(send(endpoint,'claim',{}),/24 MiB/);const c=new AbortController();c.abort();await assert.rejects(send(endpoint,'claim',{},undefined,c.signal));}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
