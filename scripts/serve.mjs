import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const target=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(target!==path.resolve(root)&&!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);return res.end('Forbidden');}const file=(await stat(target)).isDirectory()?path.join(target,'index.html'):target;const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});
const port=Number(process.env.PORT)||4173;server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
