import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname,join} from 'node:path';
export function createStaticServer(rootPath) {
  const root=resolve(rootPath),mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.wasm':'application/wasm','.jar':'application/java-archive','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.gz':'application/gzip'};
  return createServer(async(req,res)=>{
    try{
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
      const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),targetPath=resolve(root,'.'+path);
      if(targetPath!==root&&!targetPath.startsWith(root+sep))throw Error('invalid path');
      let target=targetPath,st=await stat(target);if(st.isDirectory()){target=join(target,'index.html');st=await stat(target);}
      const data=await readFile(target);let start=0,end=data.length-1;
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
        if(!match[1])start=Math.max(0,data.length-Number(match[2]));
        else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
        if(start<0||start>end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
        res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${data.length}`);
      }
      res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Type',mime[extname(target)]||'application/octet-stream');res.setHeader('Content-Length',data.length?end-start+1:0);
      res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));
    }catch(error){res.statusCode=404;res.end('Not found');}
  });
}
if(process.argv[1]===new URL(import.meta.url).pathname)createStaticServer('dist').listen(Number(process.env.PORT||4173),()=>console.log('Serving http://localhost:'+(process.env.PORT||4173)));
