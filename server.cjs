const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
http.createServer((req,res)=>{
  const name = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if(!file.startsWith(root + path.sep)){res.writeHead(403).end();return;}
  fs.stat(file,(err,stat)=>{
    if(err || !stat.isFile()){res.writeHead(404).end();return;}
    const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.jpg':'image/jpeg','.png':'image/png'}[path.extname(file)] || 'application/octet-stream';
    const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]),stat.size-1) : stat.size-1;
    if(start > end){res.writeHead(416).end();return;}
    res.writeHead(range?206:200,{'Content-Type':mime,'Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${stat.size}`}:{})});
    fs.createReadStream(file,{start,end}).pipe(res);
  });
}).listen(4187,'127.0.0.1',()=>console.log('http://localhost:4187'));

