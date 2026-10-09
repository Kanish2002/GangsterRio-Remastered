import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {makeZip} from '../src/archive.js';
await mkdir('.runtime-build/probe',{recursive:true});
execFileSync('java',['-m','jdk.compiler/com.sun.tools.javac.Main','--release','8','-cp','dist/emulator/freej2me-web.jar','-d','.runtime-build/probe','tests/java/BridgeProbe.java','runtime-host/org/rio/HostBridge.java','tests/java/RmsBridgeTest.java'],{stdio:'inherit'});
execFileSync('java',['-cp','.runtime-build/probe:dist/emulator/freej2me-web.jar','RmsBridgeTest'],{stdio:'inherit'});
const entries={'META-INF/MANIFEST.MF':new TextEncoder().encode('Manifest-Version: 1.0\r\nMIDlet-Name: Rio Host Probe\r\nMIDlet-Version: 1.0.0\r\nMIDlet-Vendor: Rio Project\r\nMIDlet-1: Rio Host Probe, , BridgeProbe\r\nMicroEdition-Configuration: CLDC-1.1\r\nMicroEdition-Profile: MIDP-2.0\r\n\r\n')};
for(const name of await readdir('.runtime-build/probe'))if(name.startsWith('BridgeProbe')&&name.endsWith('.class'))entries[name]=await readFile('.runtime-build/probe/'+name);
await writeFile('.runtime-build/probe.jar',makeZip(entries));
