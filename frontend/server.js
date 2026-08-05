import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT) || 4173;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const sendFile = (res, filePath) => {
  const extension = extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': filePath.includes(`${join('dist', 'assets')}`)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  });
  createReadStream(filePath).pipe(res);
};

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'marketeye-web' }));
    return;
  }

  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const requestedFile = join(root, safePath === '/' ? 'index.html' : safePath);
  const filePath = requestedFile.startsWith(root)
    && existsSync(requestedFile)
    && statSync(requestedFile).isFile()
    ? requestedFile
    : join(root, 'index.html');

  sendFile(res, filePath);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`MarketEye frontend listening on port ${port}`);
});
