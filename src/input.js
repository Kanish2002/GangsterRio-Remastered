export const DEFAULT_BINDINGS = {KeyW:'Digit2',KeyA:'Digit4',KeyS:'Digit8',KeyD:'Digit6',ArrowUp:'Digit2',ArrowLeft:'Digit4',ArrowDown:'Digit8',ArrowRight:'Digit6',Space:'Digit5',Enter:'Digit5',KeyE:'Digit0',KeyQ:'F1',KeyR:'F2',KeyX:'NumpadMultiply',KeyM:'NumpadDivide'};
export const HOST_CODES = {Digit0:48,Digit1:49,Digit2:50,Digit3:51,Digit4:52,Digit5:53,Digit6:54,Digit7:55,Digit8:56,Digit9:57,F1:112,F2:113,NumpadMultiply:106,NumpadDivide:111};
export class InputState {
  constructor(emit) { this.emit=emit;this.sources=new Map();this.codes=new Map(); }
  press(source,code) {
    if(this.sources.get(source)===code)return;
    this.release(source);this.sources.set(source,code);
    const set=this.codes.get(code)||new Set();set.add(source);this.codes.set(code,set);
    if(set.size===1)this.emit(true,code);
  }
  release(source) {
    const code=this.sources.get(source);if(!code)return;this.sources.delete(source);
    const set=this.codes.get(code);set.delete(source);if(!set.size){this.codes.delete(code);this.emit(false,code);}
  }
  reset() { for(const source of [...this.sources.keys()])this.release(source); }
}
export function gamepadCodes(pad) {
  const codes=[];const b=n=>pad.buttons[n]?.pressed;
  if(b(12)||pad.axes[1]<-.35)codes.push('Digit2');if(b(13)||pad.axes[1]>.35)codes.push('Digit8');
  if(b(14)||pad.axes[0]<-.35)codes.push('Digit4');if(b(15)||pad.axes[0]>.35)codes.push('Digit6');
  if(b(0))codes.push('Digit5');if(b(1))codes.push('Digit0');if(b(4))codes.push('F1');if(b(5))codes.push('F2');
  return codes;
}
