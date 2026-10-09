import { mkdir, cp, writeFile, rm, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
const sha='c19416e75cbc15f9a27f7e967ee81cb108761e30';
const root=resolve('.'), dist=join(root,'dist'), tmp=join(root,'.runtime-build');
await rm(dist,{recursive:true,force:true}); await mkdir(dist,{recursive:true});
await Promise.all(['index.html','style.css'].map(p=>cp(join(root,p),join(dist,p))));
if(process.env.SKIP_RUNTIME_FETCH==='1'){console.warn('SKIP_RUNTIME_FETCH=1: emulator is NOT included in this build');process.exit(0)}
await rm(tmp,{recursive:true,force:true});await mkdir(tmp,{recursive:true});
try{
  const url=`https://github.com/zb3/freej2me-web/archive/${sha}.tar.gz`;
  const res=await fetch(url,{signal:AbortSignal.timeout(120000)});
  if(!res.ok)throw Error(`Upstream runtime download HTTP ${res.status}`);
  const archive=join(tmp,'source.tar.gz');await writeFile(archive,Buffer.from(await res.arrayBuffer()));
  execFileSync('tar',['-xzf',archive,'-C',tmp],{stdio:'inherit'});
  const upstream=join(tmp,`freej2me-web-${sha}`);
  await stat(join(upstream,'web','index.html'));
  await cp(join(upstream,'web'),join(dist,'emulator'),{recursive:true});
  await mkdir(join(dist,'runtime'),{recursive:true});
  await cp(join(upstream,'LICENSE'),join(dist,'runtime','LICENSE'));
  await cp(archive,join(dist,'runtime','freej2me-web-source.tar.gz'));
  console.log('Runtime bundled from pinned upstream source',sha);
}finally{await rm(tmp,{recursive:true,force:true})}
