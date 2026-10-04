import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CoreRepository, type Command } from '../../src/core/repository';
import type { DayInput } from '../../src/core/schedule-store';

export interface PilotOptions { databasePath: string; port: number }
export interface PilotServer { url: string; close: () => Promise<void> }
class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
const assets: Record<string, [string, string]> = {
  '/': ['apps/local-pilot/public/index.html', 'text/html'],
  '/app.js': ['apps/local-pilot/public/app.js', 'text/javascript'],
  '/styles.css': ['apps/local-pilot/public/styles.css', 'text/css'],
  '/base.css': ['prototypes/phase-3/styles.css', 'text/css'],
  '/appearance.js': ['prototypes/phase-3/appearance.js', 'text/javascript'],
};
function secretEquals(actual: string | undefined, expected: string) {
  if (!actual || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
function json(response: ServerResponse, status: number, data: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(data));
}
async function body(request: IncomingMessage) {
  if (request.headers['content-type'] !== 'application/json') throw new HttpError(415, 'Send JSON data.');
  let length = 0; const parts: Buffer[] = [];
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 1_048_576) throw new HttpError(413, 'The request is too large.');
    parts.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { throw new HttpError(400, 'The request could not be read.'); }
}
/** Loopback-only personal pilot. Not a remote authentication or deployment service. */
export async function startPilot(options: PilotOptions): Promise<PilotServer> {
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) throw new Error('Invalid port.');
  const repository = new CoreRepository(options.databasePath);
  const owner = 'local-owner';
  if (!repository.database.prepare('SELECT 1 FROM core_owners WHERE id=?').get(owner)) repository.createOwner(owner);
  const session = randomBytes(32).toString('hex'), token = randomBytes(32).toString('hex');
  let origin = '';
  const server = createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    void (async () => {
      if (request.headers.host !== new URL(origin).host || (request.headers.origin && request.headers.origin !== origin)
        || request.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'Open this app directly on this computer.');
      const path = new URL(request.url ?? '/', origin).pathname;
      if (path === '/api/bootstrap' && request.method === 'GET') {
        response.setHeader('Set-Cookie', `stoic_local=${session}; HttpOnly; SameSite=Strict; Path=/`);
        json(response, 200, { token, snapshot: repository.snapshot(owner), mode: 'local' }); return;
      }
      if (path.startsWith('/api/')) {
        const cookie = request.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('stoic_local='))?.slice('stoic_local='.length);
        const supplied = request.headers['x-stoic-token'];
        if (!secretEquals(cookie, session) || typeof supplied !== 'string' || !secretEquals(supplied, token)) throw new HttpError(403, 'Your local session expired. Reload the app.');
        if (path === '/api/snapshot' && request.method === 'GET') { json(response, 200, { snapshot: repository.snapshot(owner) }); return; }
        if (request.method !== 'POST' || request.headers.origin !== origin) throw new HttpError(403, 'Save requests must come from this app.');
        const data = await body(request);
        if (path === '/api/command') {
          const receipt = repository.apply(owner, data as Command);
          json(response, receipt.status === 'conflict' ? 409 : 200, { receipt, snapshot: repository.snapshot(owner), ...(receipt.safeReason ? { error: receipt.safeReason } : {}) }); return;
        }
        if (path === '/api/propose') { json(response, 200, repository.proposeDay(owner, data as DayInput)); return; }
        throw new HttpError(404, 'This action is unavailable.');
      }
      if (request.method !== 'GET' || !Object.hasOwn(assets, path)) throw new HttpError(404, 'Page not found.');
      const [file, type] = assets[path];
      const bytes = await readFile(resolve(file));
      response.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` }); response.end(bytes);
    })().catch(error => {
      if (response.writableEnded || response.destroyed) return;
      if (error instanceof HttpError) { json(response, error.status, { error: error.message }); return; }
      if (error && typeof error === 'object' && 'code' in error) {
        json(response, 503, { error: 'Local storage is unavailable. Your previous saved data is retained. Retry after checking free disk space.' }); return;
      }
      json(response, 400, { error: error instanceof Error ? error.message : 'This change could not be saved.' });
    });
  });
  server.requestTimeout = 15_000; server.headersTimeout = 10_000;
  await new Promise<void>((accept, reject) => {
    server.once('error', error => { repository.close(); reject(error); });
    server.listen(options.port, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') { reject(new Error('Local address unavailable.')); return; }
      origin = `http://127.0.0.1:${address.port}`; accept();
    });
  });
  let closed = false;
  return { url: origin, close: async () => {
    if (closed) return; closed = true;
    server.closeIdleConnections();
    await new Promise<void>((accept, reject) => server.close(error => error ? reject(error) : accept())); repository.close();
  } };
}
