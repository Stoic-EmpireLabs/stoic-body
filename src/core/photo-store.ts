import { randomUUID, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';
import { keys, object, id, instant } from './validation';
export interface PhotoRecord {id:string;kind:'source'|'actual';createdAt:string;mime:string;byteLength:number;width:number;height:number}
const MAX_BYTES=10*1024*1024, MAX_PIXELS=24_000_000;
export class PhotoStore {
 private decoding=false;
 constructor(private db:DatabaseSync){db.exec(`CREATE TABLE IF NOT EXISTS app_photos(owner_id TEXT NOT NULL REFERENCES core_owners(id),id TEXT NOT NULL,kind TEXT NOT NULL,created_at TEXT NOT NULL,mime TEXT NOT NULL,original BLOB NOT NULL,preview BLOB NOT NULL,width INTEGER NOT NULL,height INTEGER NOT NULL,digest TEXT NOT NULL,PRIMARY KEY(owner_id,id));`);}
 list(owner:string):PhotoRecord[]{return this.db.prepare('SELECT id,kind,created_at AS createdAt,mime,length(original) AS byteLength,width,height FROM app_photos WHERE owner_id=? ORDER BY created_at DESC').all(owner) as unknown as PhotoRecord[];}
 async add(owner:string,input:unknown):Promise<PhotoRecord>{
  const p=object(input);keys(p,['kind','image','consent','uploadId']);if(p.consent!==true)throw new Error('Confirm photo storage consent.');if(!['source','actual'].includes(String(p.kind)))throw new Error('Choose starting photo or actual progress.');
  const photoId=p.uploadId===undefined?randomUUID():id(p.uploadId);
  if(typeof p.image!=='string'||p.image.length>Math.ceil(MAX_BYTES/3)*4)throw new Error('Choose an image under 10 MiB.');
  const bytes=Buffer.from(p.image,'base64');if(!bytes.length||bytes.length>MAX_BYTES||bytes.toString('base64')!==p.image)throw new Error('Invalid photo encoding.');
  const digest=createHash('sha256').update(bytes).digest('hex'),prior=this.db.prepare('SELECT digest,kind FROM app_photos WHERE owner_id=? AND id=?').get(owner,photoId);
  if(prior){if(prior.digest!==digest||prior.kind!==p.kind)throw new Error('This upload ID belongs to a different photo.');return this.list(owner).find(p=>p.id===photoId)!;}
  const size=this.db.prepare('SELECT count(*) AS count,coalesce(sum(length(original)+length(preview)),0) AS bytes FROM app_photos WHERE owner_id=?').get(owner)!;
  if(Number(size.count)>=50||Number(size.bytes)+bytes.length>250*1024*1024)throw new Error('Photo storage is full. Export photos before removing any you no longer need.');
  if(this.decoding)throw new Error('Another photo is being processed. Try again shortly.');this.decoding=true;
  try{
   const decoder=sharp(bytes,{limitInputPixels:MAX_PIXELS,failOn:'warning',animated:false}).timeout({seconds:15}),m=await decoder.metadata();
   if(!['jpeg','png','webp'].includes(String(m.format))||(m.pages||1)!==1||!m.width||!m.height||m.width*m.height>MAX_PIXELS)throw new Error('Choose a still JPEG, PNG or WebP under 24 megapixels.');
   // Decode, orient and strip EXIF/GPS metadata. The original remains private and unchanged.
   const preview=await decoder.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).png().toBuffer();
   const createdAt=new Date().toISOString(),mime=m.format==='jpeg'?'image/jpeg':`image/${m.format}`;
   this.db.prepare('INSERT INTO app_photos VALUES(?,?,?,?,?,?,?,?,?,?)').run(owner,photoId,p.kind as string,createdAt,mime,bytes,preview,m.width,m.height,digest);
   return {id:photoId,kind:p.kind as PhotoRecord['kind'],createdAt,mime,byteLength:bytes.length,width:m.width,height:m.height};
  }catch(e){if(e instanceof Error&&/storage is full|Choose/.test(e.message))throw e;throw new Error('This image could not be decoded safely. Try another JPEG, PNG or WebP.');}finally{this.decoding=false;}
 }
 read(owner:string,photoId:string,original=false){const row=this.db.prepare('SELECT original,preview,mime FROM app_photos WHERE owner_id=? AND id=?').get(owner,id(photoId));if(!row)throw new Error('Photo not found.');return {bytes:Buffer.from((original?row.original:row.preview) as Uint8Array),mime:original?String(row.mime):'image/png'};}
 remove(owner:string,photoId:string){this.read(owner,photoId);this.db.prepare('DELETE FROM app_photos WHERE owner_id=? AND id=?').run(owner,photoId);}
 archive(owner:string){const records=this.list(owner);if(records.reduce((n,p)=>n+p.byteLength,0)>23*1024*1024)throw new Error('Photo archive exceeds 32 MiB encoded. Download individual originals instead.');return {version:1,photos:records.map(p=>({id:p.id,kind:p.kind,createdAt:p.createdAt,image:this.read(owner,p.id,true).bytes.toString('base64')}))};}
 async restore(owner:string,input:unknown,requireCurrent:()=>void=()=>{}){
  const archive=object(input);keys(archive,['version','photos']);if(archive.version!==1||!Array.isArray(archive.photos)||archive.photos.length>50)throw new Error('Invalid photo archive.');
  const temp=new DatabaseSync(':memory:');temp.exec("CREATE TABLE core_owners(id TEXT PRIMARY KEY); INSERT INTO core_owners VALUES('staging')");const staged=new PhotoStore(temp);let restored=0;
  try{
   const seen=new Set<string>();for(const raw of archive.photos){const p=object(raw);keys(p,['id','kind','createdAt','image']);const key=id(p.id);if(seen.has(key))throw new Error('Duplicate photo in archive.');seen.add(key);instant(p.createdAt);await staged.add('staging',{uploadId:key,kind:p.kind,image:p.image,consent:true});temp.prepare('UPDATE app_photos SET created_at=? WHERE id=?').run(String(p.createdAt),key);}
   requireCurrent();this.db.exec('BEGIN IMMEDIATE');try{
    const current=this.db.prepare('SELECT count(*) AS count,coalesce(sum(length(original)+length(preview)),0) AS bytes FROM app_photos WHERE owner_id=?').get(owner)!;let count=Number(current.count),bytes=Number(current.bytes);
    for(const row of temp.prepare('SELECT * FROM app_photos').all()){
     const prior=this.db.prepare('SELECT digest FROM app_photos WHERE owner_id=? AND id=?').get(owner,String(row.id));if(prior){if(prior.digest!==row.digest)throw new Error('A photo ID conflicts with a different saved image.');continue;}
     count++;bytes+=(row.original as Uint8Array).byteLength+(row.preview as Uint8Array).byteLength;if(count>50||bytes>250*1024*1024)throw new Error('This archive does not fit in your photo storage.');
     this.db.prepare('INSERT INTO app_photos VALUES(?,?,?,?,?,?,?,?,?,?)').run(owner,row.id,row.kind,row.created_at,row.mime,row.original,row.preview,row.width,row.height,row.digest);restored++;
    }this.db.exec('COMMIT');
   }catch(e){this.db.exec('ROLLBACK');throw e;}
   return {restored};
  }finally{temp.close();}
 }
}
