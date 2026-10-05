import {AccountError} from './accounts';
export type SyncTransport=(endpoint:string,path:'claim'|'exchange',data:unknown,secret?:string,signal?:AbortSignal)=>Promise<unknown>;
export function syncEndpoint(value:unknown,allowTestLoopback=false){
 if(typeof value!=='string'||value.length>300)throw new Error('Enter the private HTTPS address of your host.');
 const u=new URL(value),local=allowTestLoopback&&u.protocol==='http:'&&u.hostname==='127.0.0.1';
 if((!local&&(u.protocol!=='https:'||!u.hostname.endsWith('.ts.net')))||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw new Error('Use a private Tailscale HTTPS address, without a path, password or query.');
 return u.origin;
}
export function createSyncTransport(allowTestLoopback=false,fetcher:typeof fetch=fetch):SyncTransport {
 return async(endpoint,path,data,secret,signal)=>{
  const url=syncEndpoint(endpoint,allowTestLoopback),body=JSON.stringify(data);if(Buffer.byteLength(body)>1048576)throw new Error('Sync request exceeds 1 MiB.');
  const abort=AbortSignal.any([AbortSignal.timeout(12000),...(signal?[signal]:[])]);
  const response=await fetcher(`${url}/api/sync/${path}`,{method:'POST',redirect:'error',signal:abort,headers:{'Content-Type':'application/json',...(secret?{Authorization:`Bearer ${secret}`}:{})},body});
  if(!response.ok){await response.body?.cancel();throw new AccountError(response.status,response.status===401?'Device access expired. Pair this device again.':'The host could not complete this sync. Your local changes are retained.');}
  if(!response.headers.get('content-type')?.startsWith('application/json')){await response.body?.cancel();throw new Error('The address did not return a Stoic Body sync response.');}
  const limit=24*1024*1024;if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw new Error('Sync response exceeds 24 MiB.');}
  const reader=response.body?.getReader();if(!reader)throw new Error('Empty sync response.');const chunks:Uint8Array[]=[];let length=0;
  try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>limit)throw new Error('Sync response exceeds 24 MiB.');chunks.push(value);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
  finally{await reader.cancel();reader.releaseLock();}
 };
}
