import { randomBytes, scrypt, createCipheriv, createDecipheriv } from 'node:crypto';
import { AccountError } from './accounts';
import { validateBundle, MAX_BUNDLE_BYTES, type AccountBundle } from './account-bundle';
import { keys, object } from './validation';
export interface BackupEnvelope { format:'stoic-body-encrypted';version:1;salt:string;nonce:string;tag:string;data:string }
let active=0;
function pass(value:unknown):string {if(typeof value!=='string'||value.length<15||value.length>128||!value.trim())throw new Error('Use a backup passphrase of 15–128 characters.');return value.normalize('NFC');}
async function key(value:string,salt:Buffer):Promise<Buffer> {
  if(active>=2)throw new AccountError(429,'Backup encryption is busy. Try again shortly.');active++;
  try{return await new Promise((resolve,reject)=>scrypt(value,salt,32,{N:32768,r:8,p:3,maxmem:64*1024*1024},(err,result)=>err?reject(err):resolve(result)));}finally{active--;}
}
function base64(value:unknown,max:number,exact?:number):Buffer {
  if(typeof value!=='string'||value.length>Math.ceil(max/3)*4||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))throw new Error('Damaged backup encoding.');
  const b=Buffer.from(value,'base64');if(b.length>max||(exact!==undefined&&b.length!==exact))throw new Error('Damaged backup length.');return b;
}
export async function sealBackup(bundle:AccountBundle,phrase:unknown):Promise<BackupEnvelope> {
  const password=pass(phrase), data=Buffer.from(JSON.stringify(bundle));if(data.length>MAX_BUNDLE_BYTES)throw new Error('Backup exceeds 16 MiB.');
  const salt=randomBytes(16),nonce=randomBytes(12),k=await key(password,salt);
  try {const cipher=createCipheriv('aes-256-gcm',k,nonce);cipher.setAAD(Buffer.from('stoic-body-encrypted:1'));return {format:'stoic-body-encrypted',version:1,salt:salt.toString('base64'),nonce:nonce.toString('base64'),data:Buffer.concat([cipher.update(data),cipher.final()]).toString('base64'),tag:cipher.getAuthTag().toString('base64')};}finally{k.fill(0);data.fill(0);}
}
export async function openBackup(input:unknown,phrase:unknown):Promise<AccountBundle> {
  const password=pass(phrase),e=object(input);keys(e,['format','version','salt','nonce','tag','data']);if(e.format!=='stoic-body-encrypted'||e.version!==1)throw new Error('Unsupported encrypted backup version.');
  const salt=base64(e.salt,16,16),nonce=base64(e.nonce,12,12),tag=base64(e.tag,16,16),data=base64(e.data,MAX_BUNDLE_BYTES),k=await key(password,salt);let plain:Buffer;
  try {const decipher=createDecipheriv('aes-256-gcm',k,nonce);decipher.setAAD(Buffer.from('stoic-body-encrypted:1'));decipher.setAuthTag(tag);plain=Buffer.concat([decipher.update(data),decipher.final()]);}catch{throw new Error('Wrong backup passphrase or damaged file.');}finally{k.fill(0);}
  try{return validateBundle(JSON.parse(plain.toString('utf8')));}finally{plain.fill(0);}
}
