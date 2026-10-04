import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CoreRepository, type Command } from '../../src/core/repository';
import type { DayInput } from '../../src/core/schedule-store';
import { resolveWallTime } from '../../src/core/time';
import { object, keys, text, zone } from '../../src/core/validation';
import { diets } from '../../src/core/health-content';
import { summarizeHealth } from '../../src/core/health-metrics';
import { buildRoutine, trainingStyles, progressionAdvice } from '../../src/core/training';
import { courses } from '../../src/core/learning-content';
import { mealCatalog, previewMeal } from '../../src/core/meals';
import { AccountStore, AccountError, type Account } from '../../src/core/accounts';

export interface PilotOptions { databasePath: string; port: number }
export interface PilotServer { url: string; close: () => Promise<void> }
class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
const assets: Record<string, [string, string]> = {
  '/': ['apps/local-pilot/public/index.html', 'text/html'],
  '/app.js': ['apps/local-pilot/public/app.js', 'text/javascript'],
  '/health.js': ['apps/local-pilot/public/health.js', 'text/javascript'],
  '/learn.js': ['apps/local-pilot/public/learn.js', 'text/javascript'],
  '/styles.css': ['apps/local-pilot/public/styles.css', 'text/css'],
  '/base.css': ['prototypes/phase-3/styles.css', 'text/css'],
  '/appearance.js': ['prototypes/phase-3/appearance.js', 'text/javascript'],
};
function secretEquals(actual: string | undefined, expected: string) {
  if (!actual || actual.length !== expected.length) return false;
  const actualBytes = Buffer.from(actual), expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
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
  const accounts = new AccountStore(repository.database);
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
      const cookie = request.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('stoic_local='))?.slice('stoic_local='.length);
      const session = accounts.authenticate(cookie);
      const signedIn = (account: Account, token: string) => ({ authenticated: true, account, token, snapshot: repository.snapshot(account.id), guide: accounts.readGuide(account.id), mode: 'local' });
      if (path === '/api/bootstrap' && request.method === 'GET') {
        json(response, 200, session ? signedIn(session.account, session.csrf) : { authenticated: false, mode: 'local' }); return;
      }
      if (['/api/auth/register','/api/auth/login','/api/auth/recover'].includes(path)) {
        if (request.method !== 'POST' || request.headers.origin !== origin) throw new HttpError(403,'Account requests must come from this app.');
        const data = await body(request);
        const result = path.endsWith('/register') ? await accounts.register(data) : path.endsWith('/recover') ? await accounts.recover(data) : {account:await accounts.login(data)};
        if(cookie) accounts.logout(cookie);
        const fresh = accounts.createSession(result.account.id);
        response.setHeader('Set-Cookie',`stoic_local=${fresh.key}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`);
        json(response,200,{...signedIn(result.account,fresh.csrf),...('recoveryKey' in result ? {recoveryKey:result.recoveryKey} : {})}); return;
      }
      if (path.startsWith('/api/')) {
        const supplied = request.headers['x-stoic-token'];
        if (!session) throw new HttpError(401, 'Sign in to open your private workspace.');
        if (typeof supplied !== 'string' || !secretEquals(supplied, session.csrf)) throw new HttpError(403, 'Your local session changed. Reconnect the app.');
        const owner = session.account.id;
        if (path === '/api/snapshot' && request.method === 'GET') { json(response, 200, { snapshot: repository.snapshot(owner) }); return; }
        if (path === '/api/health-content' && request.method === 'GET') { json(response, 200, { diets, trainingStyles, meals: mealCatalog }); return; }
        if (path === '/api/learning-content' && request.method === 'GET') { json(response, 200, { courses }); return; }
        if (request.method !== 'POST' || request.headers.origin !== origin) throw new HttpError(403, 'Save requests must come from this app.');
        const data = await body(request);
        if (path === '/api/auth/logout') { keys(object(data),[]); accounts.logout(cookie!); response.setHeader('Set-Cookie','stoic_local=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); json(response,200,{authenticated:false}); return; }
        if (path === '/api/guide') { json(response,200,{guide:accounts.saveGuide(owner,data)}); return; }
        if (path === '/api/meal-preview') { json(response, 200, previewMeal(data)); return; }
        if (path === '/api/training-preview') { json(response, 200, buildRoutine(data)); return; }
        if (path === '/api/health-summary') {
          const p = object(data); keys(p, ['date', 'unit']); if (!['kg', 'lb'].includes(String(p.unit))) throw new Error('Choose weight units.');
          json(response, 200, { summary: summarizeHealth(repository.snapshot(owner).health, text(p.date), p.unit as 'kg' | 'lb') }); return;
        }
        if (path === '/api/training-advice') { const p = object(data); keys(p, ['routineId', 'exercise']); json(response, 200, progressionAdvice(repository.snapshot(owner).health, text(p.routineId), text(p.exercise))); return; }
        if (path === '/api/command') {
          const receipt = repository.apply(owner, data as Command);
          json(response, receipt.status === 'conflict' ? 409 : 200, { receipt, snapshot: repository.snapshot(owner), ...(receipt.safeReason ? { error: receipt.safeReason } : {}) }); return;
        }
        if (path === '/api/propose') { json(response, 200, repository.proposeDay(owner, data as DayInput)); return; }
        if (path === '/api/time') {
          const value = object(data); keys(value, ['local', 'timezone']);
          json(response, 200, resolveWallTime(text(value.local, 16), zone(value.timezone), { source: 'user' })); return;
        }
        throw new HttpError(404, 'This action is unavailable.');
      }
      if (request.method !== 'GET' || !Object.hasOwn(assets, path)) throw new HttpError(404, 'Page not found.');
      const [file, type] = assets[path];
      const bytes = await readFile(resolve(file));
      response.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` }); response.end(bytes);
    })().catch(error => {
      if (response.writableEnded || response.destroyed) return;
      if (error instanceof HttpError || error instanceof AccountError) { json(response, error.status, { error: error.message }); return; }
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
