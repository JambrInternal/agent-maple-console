import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');
const port = Number(process.env.PORT || '3000');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const resolveConfigValue = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return '';
};

const resolveAppEnvFromRailway = () => {
  const railwayEnv = resolveConfigValue(process.env.RAILWAY_ENVIRONMENT_NAME).toLowerCase();
  if (railwayEnv === 'beta') return 'beta';
  if (railwayEnv === 'prod' || railwayEnv === 'production') return 'prod';
  return '';
};

const getRuntimeConfig = () => ({
  API_URL: resolveConfigValue(
    process.env.API_URL,
    process.env.VITE_API_URL,
    'https://api.dev.agentmaple.ca'
  ),
  AWS_REGION: resolveConfigValue(process.env.AWS_REGION, process.env.VITE_AWS_REGION, 'us-east-1'),
  COGNITO_USER_POOL_ID: resolveConfigValue(
    process.env.COGNITO_USER_POOL_ID,
    process.env.VITE_COGNITO_USER_POOL_ID,
    'us-east-1_dDp9djoZz'
  ),
  COGNITO_APP_CLIENT_ID: resolveConfigValue(
    process.env.COGNITO_APP_CLIENT_ID,
    process.env.VITE_COGNITO_APP_CLIENT_ID,
    '2j77g0duot54vs8461u4tbbenp'
  ),
  SENTRY_DSN: resolveConfigValue(process.env.SENTRY_DSN, process.env.VITE_SENTRY_DSN, ''),
  GIT_COMMIT: resolveConfigValue(
    process.env.GIT_COMMIT,
    process.env.RAILWAY_GIT_COMMIT_SHA,
    process.env.VITE_GIT_COMMIT,
    ''
  ),
  POSTHOG_KEY: resolveConfigValue(process.env.POSTHOG_KEY, process.env.VITE_POSTHOG_KEY, ''),
  POSTHOG_HOST: resolveConfigValue(
    process.env.POSTHOG_HOST,
    process.env.VITE_POSTHOG_HOST,
    'https://us.i.posthog.com'
  ),
  POSTHOG_ENABLED: resolveConfigValue(
    process.env.POSTHOG_ENABLED,
    process.env.VITE_POSTHOG_ENABLED,
    'true'
  ),
  APP_ENV: resolveAppEnvFromRailway(),
  POSTHOG_TARGETING_MODE: resolveConfigValue(
    process.env.POSTHOG_TARGETING_MODE,
    process.env.VITE_POSTHOG_TARGETING_MODE,
    'auto'
  ),
});

const sendFile = (res, filePath, method) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const stat = statSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
    });
    if (method === 'HEAD') {
      res.end();
      return;
    }
    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Error reading file');
      }
    });
    stream.pipe(res);
  } catch (_error) {
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  }
};

const serveStaticAsset = (pathname, method, res) => {
  const relativePath = pathname.replace(/^\/+/, '');
  const filePath = path.join(distDir, relativePath);
  const normalizedPath = path.normalize(filePath);
  const insideDist =
        normalizedPath === distDir || normalizedPath.startsWith(`${distDir}${path.sep}`);

  if (!insideDist) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return true;
  }

  try {
    const stat = statSync(normalizedPath);
    if (!stat.isFile()) {
      return false;
    }

    sendFile(res, normalizedPath, method);
    return true;
  } catch (_error) {
    return false;
  }
};

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  const method = req.method || 'GET';
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/healthz') {
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method Not Allowed');
      return;
    }
    res.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    if (method !== 'HEAD') {
      res.end('ok');
      return;
    }
    res.end();
    return;
  }

  if (pathname === '/env.js') {
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method Not Allowed');
      return;
    }
    const payload = `window.__APP_CONFIG__ = ${JSON.stringify(getRuntimeConfig())};`;
    res.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/javascript; charset=utf-8',
    });
    if (method !== 'HEAD') {
      res.end(payload);
      return;
    }
    res.end();
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  if (serveStaticAsset(pathname, method, res)) {
    return;
  }

  if (!existsSync(indexPath)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Application bundle not found');
    return;
  }

  try {
    const html = await readFile(indexPath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (method !== 'HEAD') {
      res.end(html);
      return;
    }
    res.end();
  } catch (_error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Failed to serve application');
  }
});

server.listen(port);
