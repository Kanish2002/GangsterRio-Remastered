// Bounded ZIP reader for local JAR inspection. No game bytes leave the browser.
export const MAX_ARCHIVE = 24 * 1024 * 1024;
export const MAX_EXPANDED = 96 * 1024 * 1024;
export function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) { c ^= b; for (let j=0;j<8;j++) c=(c>>>1)^((c&1)?0xedb88320:0); }
  return (c ^ 0xffffffff) >>> 0;
}
export function readDirectory(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length > MAX_ARCHIVE || bytes.length < 22) throw Error('Invalid archive size (maximum 24 MB).');
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let e = bytes.length - 22;
  while (e >= Math.max(0, bytes.length - 65557) && v.getUint32(e,true)!==0x06054b50) e--;
  if(e<0 || e<bytes.length-65557 || e+22+v.getUint16(e+20,true)!==bytes.length) throw Error('Not a complete ZIP/JAR archive.');
  const count=v.getUint16(e+10,true), size=v.getUint32(e+12,true), offset=v.getUint32(e+16,true);
  if(v.getUint16(e+4,true) || v.getUint16(e+6,true) || count!==v.getUint16(e+8,true) || count===65535 || offset+size!==e || count>4096) throw Error('Unsupported archive directory.');
  const entries=[], names=new Set(); let p=offset, total=0;
  for(let i=0;i<count;i++) {
    if(p+46>e || v.getUint32(p,true)!==0x02014b50) throw Error('Corrupt ZIP directory.');
    const flags=v.getUint16(p+8,true), method=v.getUint16(p+10,true), crc=v.getUint32(p+16,true), compressed=v.getUint32(p+20,true), expanded=v.getUint32(p+24,true);
    const nl=v.getUint16(p+28,true), el=v.getUint16(p+30,true), cl=v.getUint16(p+32,true), local=v.getUint32(p+42,true);
    if(p+46+nl+el+cl>e) throw Error('Truncated ZIP entry.');
    const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+nl));
    if(!name || name.startsWith('/') || name.includes('\\') || name.includes('\0') || /^[A-Za-z]:/.test(name) || name.split('/').some(x=>x==='..'||x==='.') || names.has(name)) throw Error('Unsafe or duplicate archive path.');
    if(flags&1 || ![0,8].includes(method) || (total+=expanded)>MAX_EXPANDED || local+30>offset || v.getUint32(local,true)!==0x04034b50) throw Error('Encrypted, excessive or unsupported archive.');
    const start=local+30+v.getUint16(local+26,true)+v.getUint16(local+28,true);
    if(start+compressed>offset || v.getUint16(local+8,true)!==method) throw Error('Corrupt ZIP payload.');
    const localName=new TextDecoder().decode(bytes.subarray(local+30,local+30+v.getUint16(local+26,true)));
    if(localName!==name) throw Error('Inconsistent ZIP path.');
    entries.push({name,method,crc,compressed,expanded,start}); names.add(name); p+=46+nl+el+cl;
  }
  if(p!==offset+size) throw Error('Corrupt ZIP directory size.');
  return {bytes,entries,total};
}
export async function extractEntry(archive, entry) {
  const source=archive.bytes.subarray(entry.start,entry.start+entry.compressed);
  let result=source;
  if(entry.method===8) {
    const stream=new Blob([source]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    const reader=stream.getReader(),chunks=[];let length=0;
    try { for(;;) { const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>entry.expanded)throw Error('Expansion exceeds declared size.');chunks.push(value); } }
    finally { await reader.cancel(); }
    result=new Uint8Array(length);let p=0;for(const chunk of chunks){result.set(chunk,p);p+=chunk.length;}
  }
  if(result.length!==entry.expanded || crc32(result)!==entry.crc) throw Error('Archive checksum mismatch.');
  return result;
}
export function parseManifest(text) {
  const result={}; let last='';
  for(const line of text.replace(/\r/g,'').split('\n')) {
    if(line.startsWith(' ') && last) {result[last]+=line.slice(1);continue;}
    const colon=line.indexOf(':'); if(colon<1){last='';continue;}
    last=line.slice(0,colon);result[last]=line.slice(colon+1).trim();
  }
  return result;
}
export async function inspectJar(buffer) {
  const archive=readDirectory(buffer), manifest=archive.entries.find(x=>x.name==='META-INF/MANIFEST.MF');
  if(!manifest || manifest.expanded>65536) throw Error('Missing or excessive Java ME manifest.');
  const properties=parseManifest(new TextDecoder().decode(await extractEntry(archive,manifest)));
  const main=properties['MIDlet-1']?.split(',').at(-1)?.trim();
  if(!main || !archive.entries.some(x=>x.name===main.replaceAll('.','/')+'.class')) throw Error('No valid MIDlet entry class found.');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),x=>x.toString(16).padStart(2,'0')).join('');
  return {hash,properties,classes:archive.entries.filter(x=>x.name.endsWith('.class')).length,entries:archive.entries.length,bytes:buffer.byteLength};
}
// Stored ZIP writer also used by the Node build for the redistributable host bridge.
export function makeZip(files) {
  const local=[],central=[];let offset=0;
  for(const [name,data] of Object.entries(files)) {
    const n=new TextEncoder().encode(name), b=new Uint8Array(data), crc=crc32(b);
    const l=new Uint8Array(30+n.length+b.length),lv=new DataView(l.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,2048,true);lv.setUint32(14,crc,true);lv.setUint32(18,b.length,true);lv.setUint32(22,b.length,true);lv.setUint16(26,n.length,true);l.set(n,30);l.set(b,30+n.length);
    const c=new Uint8Array(46+n.length),cv=new DataView(c.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,2048,true);cv.setUint32(16,crc,true);cv.setUint32(20,b.length,true);cv.setUint32(24,b.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);c.set(n,46);
    local.push(l);central.push(c);offset+=l.length;
  }
  const cs=central.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);
  v.setUint32(0,0x06054b50,true);v.setUint16(8,central.length,true);v.setUint16(10,central.length,true);v.setUint32(12,cs,true);v.setUint32(16,offset,true);
  const out=new Uint8Array(offset+cs+22);let p=0;for(const b of [...local,...central,end]){out.set(b,p);p+=b.length;}return out;
}
