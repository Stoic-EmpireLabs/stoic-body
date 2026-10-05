import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { CoreRepository } from '../../src/core/repository';
import { PhotoStore } from '../../src/core/photo-store';
import { sealPhotoArchive,openPhotoArchive,openBackup } from '../../src/core/backup-crypto';
test('encrypted photo archive restores originals additively, rejects tampering and is distinct from account backups',async()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');r.createOwner('b');const store=new PhotoStore(r.database),image=await sharp({create:{width:4,height:4,channels:3,background:'#333'}}).png().toBuffer();
 await store.add('a',{kind:'actual',image:image.toString('base64'),consent:true});const archive=store.archive('a'),pass='a separate photo archive passphrase',file=await sealPhotoArchive(archive,pass);
 assert.ok(!JSON.stringify(file).includes(image.toString('base64')));assert.deepEqual(await openPhotoArchive(file,pass),archive);
 await assert.rejects(openPhotoArchive(file,'the wrong photo archive phrase'));await assert.rejects(openBackup(file,pass));
 assert.equal((await store.restore('b',await openPhotoArchive(file,pass))).restored,1);assert.equal((await store.restore('b',archive)).restored,0);assert.deepEqual(store.read('b',archive.photos[0].id,true).bytes,image);
 const bad={version:1,photos:[{...archive.photos[0],id:'another-valid-id'},{...archive.photos[0],id:'bad-image',image:'not base64'}]};await assert.rejects(store.restore('b',bad));assert.equal(store.list('b').length,1);r.close();
});
