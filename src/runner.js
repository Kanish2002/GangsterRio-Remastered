// Native integration derived from zb3/freej2me-web's main.js, GPL-3.0-or-later.
import canvasFont from '../emulator/libjs/libcanvasfont.js';
import canvasGraphics from '../emulator/libjs/libcanvasgraphics.js';
import gles from '../emulator/libjs/libgles2.js';
import jsRef from '../emulator/libjs/libjsreference.js';
import media from '../emulator/libjs/libmediabridge.js';
import midi from '../emulator/libjs/libmidibridge.js';
import {LibMidi,createUnlockingAudioContext} from '../emulator/libmidi/libmidi.js';
import {LibMedia} from '../emulator/libmedia/libmedia.js';
import {KeyRepeatManager} from '../emulator/src/key.js';
import {HOST_CODES} from './input.js';

import {EventQueue} from './eventqueue.js';
export class Runtime {
  constructor(canvas,status,onScreen) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.status=status;this.onScreen=onScreen;
    this.events=new EventQueue();this.repeat=new KeyRepeatManager();this.started=false;this.paused=false;
    this.repeat.register((kind,key)=>{if(kind==='click')return;this.events.queueEvent({kind:kind==='up'?'keyup':'keydown',args:[HOST_CODES[key],key.startsWith('Digit')?key.charCodeAt(5):0,false,false]});});
    window.evtQueue=this.events;
  }
  key(down,code) { if(this.started && HOST_CODES[code])this.repeat.post(down,code); }
  resetKeys() { for(const key of [...this.repeat.keyStates.keys()])this.repeat.post(false,key);this.repeat.reset(); }
  async initialize() {
    if(this.initPromise)return this.initPromise;
    this.initPromise=this._initialize();return this.initPromise;
  }
  async _initialize() {
    this.status('Loading Java browser runtime… First startup needs an internet connection.');
    if(!window.cheerpjInit)await new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='https://cjrtnc.leaningtech.com/20260317_2978/loader.js';script.onload=resolve;script.onerror=()=>reject(Error('Java runtime could not load. Check the internet connection.'));document.head.append(script);
    });
    await cheerpjInit({enableDebug:false,natives:{...canvasFont,...canvasGraphics,...gles,...jsRef,...media,...midi,
      Java_pl_zb3_freej2me_bridge_media_MediaBridge_playerSetVolume:async(lib,player,v)=>{player.rioVolume=v;player.volume=v*this.volume;},
      Java_pl_zb3_freej2me_bridge_media_MediaBridge_playerGetVolume:async(lib,player)=>player.rioVolume??player.volume,
      async Java_pl_zb3_freej2me_bridge_shell_Shell_setTitle(lib,title){document.title=title+' · Rio';},
      async Java_pl_zb3_freej2me_bridge_shell_Shell_setIcon(){},
      Java_pl_zb3_freej2me_bridge_shell_Shell_getScreenCtx:async()=>this.ctx,
      Java_pl_zb3_freej2me_bridge_shell_Shell_setCanvasSize:async(lib,w,h)=>{this.canvas.width=w;this.canvas.height=h;this.ctx.imageSmoothingEnabled=false;this.onScreen(w,h);},
      Java_pl_zb3_freej2me_bridge_shell_Shell_waitForAndDispatchEvents:async(lib,listener)=>{
        const evt=await this.events.waitForEvent();
        try {
          if(evt.kind==='host') { const value=await evt.action();evt.resolve(value);return; }
          if(evt.kind==='keydown'||evt.kind==='keyup') { const KeyEvent=await lib.pl.zb3.freej2me.bridge.shell.KeyEvent;const e=await new KeyEvent(...evt.args);if(evt.kind==='keydown')await listener.keyPressed(e);else await listener.keyReleased(e); }
          else if(evt.kind==='player-eom')await listener.playerEOM(evt.player);
          else if(evt.kind==='player-video-frame')await listener.playerVideoFrame(evt.player);
        }catch(error){if(evt.reject)evt.reject(error);else console.error('Input bridge:',error);}
      },
      Java_pl_zb3_freej2me_bridge_shell_Shell_restart:async()=>location.reload(),
      Java_pl_zb3_freej2me_bridge_shell_Shell_exit:async()=>{this.status('Game exited. Reload to launch again.');this.started=false;},
      Java_pl_zb3_freej2me_bridge_shell_Shell_say:async(lib,text)=>console.info(text),
      Java_pl_zb3_freej2me_bridge_shell_Shell_sayObject:async()=>{},
      Java_pl_zb3_freej2me_bridge_shell_Shell_sthop:async()=>{}
    }});
    this.status('Preparing the Java ME emulator…');
    this.lib=await cheerpjRunLibrary('/app/emulator/freej2me-web.jar:/app/emulator/rio-host.jar');
    this.launcher=await this.lib.pl.zb3.freej2me.launcher.LauncherUtil;
    this.host=await this.lib.org.rio.HostBridge;
  }
  async map(object) {const HashMap=await this.lib.java.util.HashMap;const result=await new HashMap();for(const [k,v] of Object.entries(object))await result.put(k,String(v));return result;}
  async install(bytes,info,settings,jad={}) {
    await this.initialize();this.status('Installing your JAR in browser storage…');
    const File=await this.lib.java.io.File,Loader=await this.lib.org.recompile.mobile.MIDletLoader;
    const file=await new File('/files/_tmp/'+info.hash+'.jar');await this.launcher.copyJar(new Int8Array(bytes),file);
    const loader=await Loader.getMIDletLoader(file);this.appId='rio-'+info.hash.slice(0,24);await loader.setAppId(this.appId);
    this.properties={...info.properties,...jad};const props=await this.map(this.properties);const config=await this.map({width:settings.width,height:settings.height,phone:settings.phone,sound:settings.sound?'on':'off',fps:'0'});
    if(!await cjFileBlob('/files/'+this.appId+'/app.jar')) await this.launcher.initApp(file,loader,config,props,await this.map({}));
    else await this.launcher.saveApp(this.appId,config,props,await this.map({}));
    await loader.close();this.status('Ready. Launch to play your original game.');
  }
  async start(volume,settings) {
    // Called synchronously from a click to create and unlock Web Audio.
    const audio=createUnlockingAudioContext();await audio.resume();this.gain=audio.createGain();this.gain.gain.value=volume;this.gain.connect(audio.destination);
    window.libmidi=new LibMidi(audio,this.gain);window.libmedia=new LibMedia();
    this.mediaPlayers=new Set();const create=window.libmedia.createMediaPlayer.bind(window.libmedia);
    window.libmedia.createMediaPlayer=()=>{const player=create();player.rioVolume=1;player.volume=this.volume;this.mediaPlayers.add(player);return player;};
    this.volume=volume;this.status('Preparing original audio…');await window.libmidi.init();
    window.libmidi.midiPlayer.addEventListener('end-of-media',e=>this.events.queueEvent({kind:'player-eom',player:e.target}));
    await this.launcher.saveApp(this.appId,await this.map({width:settings.width,height:settings.height,phone:settings.phone,sound:settings.sound?'on':'off',fps:'0'}),await this.map(this.properties),await this.map({}));
    this.status('Original game loading… This preserves its original startup sequence.');
    this.started=true;
    const Free=await this.lib.org.recompile.freej2me.FreeJ2ME;
    Free.main(['app',this.appId]).catch(error=>{this.started=false;console.error(error);this.status('The original game stopped. Reload or try another phone profile.');});
  }
  volumeTo(value) {this.volume=value;if(this.gain)this.gain.gain.value=value;for(const player of this.mediaPlayers||[]){player.volume=(player.rioVolume??1)*value;}}
  action(action) {return new Promise((resolve,reject)=>this.events.queueEvent({kind:'host',action,resolve,reject}));}
  async pause(value) {
    if(!this.started || value===this.paused)return;
    this.resetKeys();const success=await this.action(()=>this.host.setPaused(value));
    if(!success)throw Error('The MIDlet is still starting. Try pause again once the title screen appears.');
    this.paused=value;
    if(value)await window.libmidi.context.suspend();else await window.libmidi.context.resume();
  }
  async backup() {
    const paused=this.paused;await this.pause(true);
    try {const bytes=await this.action(()=>this.host.exportRms(this.appId));return new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength).slice();}
    finally {if(!paused)await this.pause(false);}
  }
  async restore(bytes) {if(this.started)throw Error('Restore before launch to keep open game records safe.');await this.host.importRms(this.appId,new Int8Array(bytes));}
}
