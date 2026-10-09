import {mkdir,cp,writeFile,rm,readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {makeZip} from '../src/archive.js';
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
  await cp(join(upstream,'web'),join(dist,'emulator'),{recursive:true});
  for(const path of ['init.zip','index.html','run.html','libmidi/test'])await rm(join(dist,'emulator',path),{recursive:true,force:true});
  const bridge=Buffer.from(await readFile('runtime-host/HostBridge.class.b64','utf8'),'base64');
  if(bridge.readUInt32BE(0)!==0xcafebabe || bridge.readUInt16BE(6)!==52)throw Error('Invalid Java 8 host bridge.');
  await writeFile(join(dist,'emulator','rio-host.jar'),makeZip({'org/rio/HostBridge.class':bridge}));
  await mkdir(join(dist,'runtime'),{recursive:true});
  await cp(join(upstream,'LICENSE'),join(dist,'runtime','LICENSE'));
  await cp(archive,join(dist,'runtime','freej2me-web-source.tar.gz'));
  await cp('runtime-host',join(dist,'runtime','host-source'),{recursive:true});
  console.log('Built original-game player with pinned GPL runtime:',sha);
}finally{await rm(tmp,{recursive:true,force:true});}
