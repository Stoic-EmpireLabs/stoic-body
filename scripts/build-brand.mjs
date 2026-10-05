import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const original='assets/brand/stoic-body-original.png';
await sharp(original).resize(512,512).png().toFile('assets/brand/stoic-body-512.png');
const sizes=[16,24,32,48,64,128,256],frames=await Promise.all(sizes.map(size=>sharp(original).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*frames.length);header.writeUInt16LE(1,2);header.writeUInt16LE(frames.length,4);let offset=header.length;
for(const [i,frame] of frames.entries()){const p=6+16*i,size=sizes[i];header[p]=header[p+1]=size===256?0:size;header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(frame.length,p+8);header.writeUInt32LE(offset,p+12);offset+=frame.length;}
await writeFile('assets/brand/stoic-body.ico',Buffer.concat([header,...frames]));
console.log('Preserved original art; exported 512px web icon and seven-size Windows ICO.');
