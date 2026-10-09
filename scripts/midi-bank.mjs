// Original synthesized samples and deterministic WebAssembly bank substitution.
// GPL-3.0-or-later. No recorded third-party sounds.
import {Buffer} from 'node:buffer';
function u16(n){const b=Buffer.alloc(2);b.writeUInt16LE(n&65535);return b;}
function u32(n){const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b;}
function name(n){const b=Buffer.alloc(20);b.write(n.slice(0,19));return b;}
function chunk(id,data){return Buffer.concat([Buffer.from(id),u32(data.length),data,data.length%2?Buffer.alloc(1):Buffer.alloc(0)]);}
function list(id,chunks){return chunk('LIST',Buffer.concat([Buffer.from(id),...chunks]));}
export function createBank(paddedLength=0){
  const samples=[],headers=[];let offset=0,seed=20261010;
  for(let family=0;family<17;family++){
    const length=family===16?8192:2048,pcm=Buffer.alloc((length+46)*2);
    for(let i=0;i<length;i++){
      const phase=2*Math.PI*12*i/2048;let value=0;
      if(family===16){seed=(Math.imul(seed,1664525)+1013904223)>>>0;value=((seed/4294967296)*2-1)*Math.exp(-i/1300)+.4*Math.sin(i*.025)*Math.exp(-i/2500);}
      else{for(let harmonic=1;harmonic<=8;harmonic++){const odd=(family%3===1&&harmonic%2===0)?0:1;value+=odd*Math.sin(phase*harmonic)/(harmonic**(1.3+(family%4)*.45));}value*=.45;}
      pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*.65*32767),i*2);
    }
    samples.push(pcm);headers.push(Buffer.concat([name('Rio wave '+family),u32(offset),u32(offset+length),u32(offset),u32(offset+length),u32(family===16?22050:Math.round(440*2**(-9/12)*2048/12)),Buffer.from([60,0]),u16(0),u16(1)]));offset+=length+46;
  }
  headers.push(Buffer.concat([name('EOS'),Buffer.alloc(26)]));
  const phdr=[],pbag=[],pgen=[],inst=[],ibag=[],igen=[];let generator=0;
  for(let program=0;program<129;program++){
    phdr.push(Buffer.concat([name('Rio synth '+program),u16(program===128?0:program),u16(program===128?128:0),u16(program),Buffer.alloc(12)]));
    pbag.push(Buffer.concat([u16(program),u16(0)]));pgen.push(Buffer.concat([u16(41),u16(program)]));
    inst.push(Buffer.concat([name('Rio voice '+program),u16(program)]));ibag.push(Buffer.concat([u16(generator),u16(0)]));
    const family=program===128?16:Math.floor(program/8);
    for(const [operator,value] of [[34,-9000],[36,-2500],[37,program===128?0:160],[38,-4500],[54,program===128?0:1],[58,60],[53,family]]){igen.push(Buffer.concat([u16(operator),u16(value)]));generator++;}
  }
  phdr.push(Buffer.concat([name('EOP'),u16(0),u16(0),u16(129),Buffer.alloc(12)]));pbag.push(Buffer.concat([u16(129),u16(0)]));pgen.push(Buffer.alloc(4));
  inst.push(Buffer.concat([name('EOI'),u16(129)]));ibag.push(Buffer.concat([u16(generator),u16(0)]));igen.push(Buffer.alloc(4));
  const info=list('INFO',[chunk('ifil',Buffer.concat([u16(2),u16(1)])),chunk('INAM',Buffer.from('Rio original synthesized bank\0')),chunk('ICOP',Buffer.from('Rio project; GPL-3.0-or-later\0'))]);
  const sdta=list('sdta',[chunk('smpl',Buffer.concat(samples))]);
  const pdta=list('pdta',[chunk('phdr',Buffer.concat(phdr)),chunk('pbag',Buffer.concat(pbag)),chunk('pmod',Buffer.alloc(10)),chunk('pgen',Buffer.concat(pgen)),chunk('inst',Buffer.concat(inst)),chunk('ibag',Buffer.concat(ibag)),chunk('imod',Buffer.alloc(10)),chunk('igen',Buffer.concat(igen)),chunk('shdr',Buffer.concat(headers))]);
  let payload=Buffer.concat([Buffer.from('sfbk'),info,sdta,pdta]);
  if(paddedLength){const extra=paddedLength-8-payload.length;if(extra<8||extra%2)throw Error('Bank padding is too small or odd');payload=Buffer.concat([payload,chunk('JUNK',Buffer.alloc(extra-8))]);}
  return Buffer.concat([Buffer.from('RIFF'),u32(payload.length),payload]);
}
function readLeb(bytes,position,signed=false){let n=0,shift=0,byte;do{if(position.i>=bytes.length||shift>35)throw Error('Malformed WASM integer');byte=bytes[position.i++];n+=(byte&127)*2**shift;shift+=7;}while(byte&128);if(signed&&shift<32&&(byte&64))n-=2**shift;return n;}
function leb(n){const bytes=[];do{let b=n&127;n=Math.floor(n/128);bytes.push(b|(n?128:0));}while(n);return Buffer.from(bytes);}
function signedLeb(n){const bytes=[];while(true){let b=n&127;n>>=7;const done=(n===0&&!(b&64))||(n===-1&&(b&64));bytes.push(b|(done?0:128));if(done)return Buffer.from(bytes);}}
export function patchMidiWasm(bytes){
  const original=Buffer.from(bytes),sections=[];let pos={i:8},patched=false;
  if(original.readUInt32LE(0)!==0x6d736100)throw Error('Not WebAssembly');
  while(pos.i<original.length){const id=original[pos.i++],length=readLeb(original,pos),end=pos.i+length;if(end>original.length)throw Error('Truncated WASM section');let payload=original.subarray(pos.i,end);
    if(id===11){const p={i:0},count=readLeb(payload,p),segments=[];let min=Infinity,max=0;
      for(let i=0;i<count;i++){const flag=readLeb(payload,p);if(flag!==0)throw Error('Unsupported WASM data mode');if(payload[p.i++]!==0x41)throw Error('Unsupported WASM offset');const offset=readLeb(payload,p,true);if(payload[p.i++]!==0x0b||offset<0)throw Error('Invalid WASM data offset');const len=readLeb(payload,p),data=payload.subarray(p.i,p.i+len);if(data.length!==len)throw Error('Truncated WASM data');p.i+=len;segments.push({offset,data});min=Math.min(min,offset);max=Math.max(max,offset+len);}
      if(p.i!==payload.length||max>16*1024*1024)throw Error('Unexpected WASM layout');
      const memory=Buffer.alloc(max-min);for(const {offset,data} of segments)data.copy(memory,offset-min);
      let bank=-1;for(let i=memory.indexOf('RIFF');i>=0;i=memory.indexOf('RIFF',i+4))if(memory.subarray(i+8,i+12).toString()==='sfbk'){if(bank>=0)throw Error('Multiple embedded banks');bank=i;}
      if(bank<0||memory.readUInt32LE(bank+4)+8!==3208108||!memory.subarray(bank,bank+500).includes(Buffer.from('Roland')))throw Error('Pinned embedded bank does not match audit');
      createBank(3208108).copy(memory,bank);
      payload=Buffer.concat([leb(1),leb(0),Buffer.from([0x41]),signedLeb(min),Buffer.from([0x0b]),leb(memory.length),memory]);patched=true;
    }
    sections.push(Buffer.concat([Buffer.from([id]),leb(payload.length),payload]));pos.i=end;
  }
  if(!patched)throw Error('No MIDI data section');return Buffer.concat([original.subarray(0,8),...sections]);
}
