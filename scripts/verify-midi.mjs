import {readFile} from 'node:fs/promises';
const bytes=await readFile('dist/emulator/libmidi/libmidi.wasm');
const module=await WebAssembly.compile(bytes);
const {exports:x}=await WebAssembly.instantiate(module,{env:{log_msg:()=>{},emscripten_notify_memory_growth:()=>{}}});
x._initialize();let minimum=Infinity;
for(let program=0;program<129;program++){
  const player=x.midiplayer_create(44100),left=x.malloc(4096),right=x.malloc(4096),channel=program===128?9:0;
  x.midiplayer_short_event(player,0xc0+channel,program===128?0:program,0);
  x.midiplayer_short_event(player,0x90+channel,program===128?38:60,100);
  let peak=0;
  for(let block=0;block<10;block++){x.midiplayer_write_data(player,left,right,1024,0);for(const value of new Float32Array(x.memory.buffer,left,1024)){if(!Number.isFinite(value))throw Error('Non-finite MIDI audio');peak=Math.max(peak,Math.abs(value));}}
  if(peak<.001)throw Error('No MIDI output from program '+program);minimum=Math.min(minimum,peak);
  x.midiplayer_delete(player);x.free(left);x.free(right);
}
console.log('Original synthesized bank: 128 programs + percussion produce finite audio; minimum peak',minimum);
