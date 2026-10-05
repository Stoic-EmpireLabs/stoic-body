import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { CoreRepository } from '../../src/core/repository';
import { PhotoStore } from '../../src/core/photo-store';
const pixel=async()=>sharp({create:{width:64,height:96,channels:3,background:'#c4a675'}}).png().toBuffer();
test('private source photo validates consent, bytes and owner; preserves original and strips preview metadata',async()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');r.createOwner('b');const s=new PhotoStore(r.database),original=await sharp(await pixel()).withExif({IFD0:{Artist:'Private fixture'}}).jpeg().toBuffer();
 await assert.rejects(s.add('a',{kind:'source',image:original.toString('base64'),consent:false}),/consent/i);
 const p=await s.add('a',{kind:'source',image:original.toString('base64'),consent:true});
 assert.equal(s.list('b').length,0); assert.throws(()=>s.read('b',p.id),/not found/i);
 assert.deepEqual(s.read('a',p.id,true).bytes,original);
 assert.equal((await sharp(s.read('a',p.id).bytes).metadata()).exif,undefined);
 assert.throws(()=>s.remove('b',p.id),/not found/i);s.remove('a',p.id);assert.equal(s.list('a').length,0);r.close();
});
test('photo intake rejects disguised, oversized and excessive-pixel images',async()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const s=new PhotoStore(r.database);
 for(const image of [Buffer.from('<svg/>').toString('base64'),Buffer.alloc(10*1024*1024+1).toString('base64')])await assert.rejects(s.add('a',{kind:'source',image,consent:true}));
 const big=await sharp({create:{width:5000,height:5000,channels:3,background:'#fff'}}).png().toBuffer();
 await assert.rejects(s.add('a',{kind:'source',image:big.toString('base64'),consent:true}));assert.equal(s.list('a').length,0);r.close();
});
