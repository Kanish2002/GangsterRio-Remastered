import {mkdir,cp,writeFile,rm,readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {makeZip} from '../src/archive.js';
import {createBank,patchMidiWasm} from './midi-bank.mjs';
const sha='c19416e75cbc15f9a27f7e967ee81cb108761e30';
const root=resolve('.'),dist=join(root,'dist'),tmp=join(root,'.runtime-build');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await cp('index.html',join(dist,'index.html'));await cp('style.css',join(dist,'style.css'));await cp('src',join(dist,'src'),{recursive:true});
await mkdir(tmp,{recursive:true});
try{
  let bytes;
  if(process.env.RUNTIME_ARCHIVE)bytes=await readFile(process.env.RUNTIME_ARCHIVE);
  else {
    const res=await fetch(`https://github.com/zb3/freej2me-web/archive/${sha}.tar.gz`,{signal:AbortSignal.timeout(90000)});
    if(!res.ok)throw Error(`Runtime download HTTP ${res.status}`);bytes=Buffer.from(await res.arrayBuffer());
  }
  const archive=join(tmp,'source.tar.gz');await writeFile(archive,bytes);
  execFileSync('tar',['-xzf',archive,'-C',tmp],{stdio:'inherit'});
  const upstream=join(tmp,`freej2me-web-${sha}`);
  await stat(join(upstream,'web','freej2me-web.jar'));
  const emulatorJar=await readFile(join(upstream,'web','freej2me-web.jar'));
  if(createHash('sha256').update(emulatorJar).digest('hex')!=='08ffc41af9e1bf815012a03d87e0af0e894eb98181f42b2302a2febf12b343eb')throw Error('Pinned emulator checksum mismatch.');
  // Remove unrelated sample media and replace the bank whose distribution rights are unestablished.
  const web=join(upstream,'web'),bank=createBank(3208108);
  await writeFile(join(web,'libmidi','libmidi.wasm'),patchMidiWasm(await readFile(join(web,'libmidi','libmidi.wasm'))));
  await writeFile(join(web,'libmidi','wasm','lib','gm.sf2'),bank);
  const header='unsigned char gm_sf2[] = {\n'+Array.from(bank,(v,i)=>(i%24===0?'\n':'')+'0x'+v.toString(16).padStart(2,'0')+',').join('')+'\n};\nunsigned int gm_sf2_len = '+bank.length+';\n';
  await writeFile(join(web,'libmidi','wasm','lib','gm.h'),header);
  for(const path of ['init.zip','libmidi/test','libmedia/test'])await rm(join(web,path),{recursive:true,force:true});
  // Upstream's media build references external codec sources. Bundle the exact versions too.
  const codecs=[
    {name:'ffmpeg',env:'FFMPEG_ARCHIVE',url:'https://github.com/FFmpeg/FFmpeg/archive/refs/tags/n7.1.1.tar.gz',hash:'f117507dc501f2a6c11f9241d8d0c3213846cfad91764361af37befd6b6c523d'},
    {name:'x264',env:'X264_ARCHIVE',url:'https://github.com/mirror/x264/archive/fe9e4a7f39d7a9fd208e4592238f9809d5936439.tar.gz',hash:'49afd0f9d8a9c1feece4e60ace1b3e7b2358d5f8a28dc34d851be74668fb6faa'}
  ];
  await Promise.all(codecs.map(async codec=>{
    let data;if(process.env[codec.env])data=await readFile(process.env[codec.env]);
    else{const response=await fetch(codec.url,{signal:AbortSignal.timeout(90000)});if(!response.ok)throw Error(codec.name+' source HTTP '+response.status);data=Buffer.from(await response.arrayBuffer());}
    if(createHash('sha256').update(data).digest('hex')!==codec.hash)throw Error(codec.name+' source checksum mismatch');
    const packed=join(tmp,codec.name+'.tar.gz'),target=join(web,'libmedia','transcode','wasm',codec.name);
    await writeFile(packed,data);await mkdir(target,{recursive:true});execFileSync('tar',['-xzf',packed,'--strip-components=1','-C',target]);
  }));
  execFileSync('patch',['-p1','-i',join(web,'libmedia','transcode','wasm','patches','x264_cpu_cores.patch')],{cwd:join(web,'libmedia','transcode','wasm','x264')});
  await mkdir(join(upstream,'rio-modifications'),{recursive:true});
  await cp('scripts/midi-bank.mjs',join(upstream,'rio-modifications','midi-bank.mjs'));
  await writeFile(join(upstream,'rio-modifications','NOTICE'),'2026-10-10: Roland bank replaced by original GPL synthesized samples using midi-bank.mjs. Unrelated sample games/media omitted. Runtime Java code is unchanged.\n');
  await cp(web,join(dist,'emulator'),{recursive:true});
  // Codec sources are served in the corresponding-source tarball, not copied into runtime assets.
  for(const codec of codecs)await rm(join(dist,'emulator','libmedia','transcode','wasm',codec.name),{recursive:true,force:true});
  for(const path of ['init.zip','index.html','run.html','libmidi/test'])await rm(join(dist,'emulator',path),{recursive:true,force:true});
  const bridge=Buffer.from(await readFile('runtime-host/HostBridge.class.b64','utf8'),'base64');
  if(bridge.readUInt32BE(0)!==0xcafebabe || bridge.readUInt16BE(6)!==52)throw Error('Invalid Java 8 host bridge.');
  await writeFile(join(dist,'emulator','rio-host.jar'),makeZip({'org/rio/HostBridge.class':bridge}));
  await mkdir(join(dist,'runtime'),{recursive:true});
  await cp(join(upstream,'LICENSE'),join(dist,'runtime','LICENSE'));
  execFileSync('tar',['-czf',join(dist,'runtime','freej2me-web-source.tar.gz'),'-C',tmp,`freej2me-web-${sha}`]);
  await cp('runtime-host',join(dist,'runtime','host-source'),{recursive:true});
  console.log('Built original-game player with pinned GPL runtime:',sha);
}finally{await rm(tmp,{recursive:true,force:true});}
