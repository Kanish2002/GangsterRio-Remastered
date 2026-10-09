export async function openStorage() {
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open('rio-preservation-v1',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('records');
    req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result);
  });
}
export async function store(key,value) {
  const db=await openStorage();
  return new Promise((resolve,reject)=>{const tx=db.transaction('records',value===undefined?'readonly':'readwrite');const req=value===undefined?tx.objectStore('records').get(key):tx.objectStore('records').put(value,key);tx.oncomplete=()=>{db.close();resolve(req.result);};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error||Error('Storage transaction aborted.'));};});
}
export function encodeBytes(bytes) { let text='';for(let p=0;p<bytes.length;p+=8192)text+=String.fromCharCode(...bytes.subarray(p,p+8192));return btoa(text); }
export function decodeBytes(text) { if(typeof text!=='string'||text.length>12*1024*1024 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw Error('Invalid save payload.'); return Uint8Array.from(atob(text),x=>x.charCodeAt(0)); }
export function validateSave(save,hash) {
  if(!save || save.schema!==1 || save.kind!=='rio-rms-backup' || save.gameHash!==hash || typeof save.createdAt!=='string') throw Error('Save belongs to a different JAR or version.');
  return decodeBytes(save.rms);
}
