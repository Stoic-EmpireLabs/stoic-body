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
import { RecoveryStore } from '../../src/core/recovery';
import { SyncHub } from '../../src/core/sync-hub';
import { SyncClient } from '../../src/core/sync-client';
import { createSyncTransport, syncEndpoint } from '../../src/core/sync-transport';
import { readSetup, activeQuestions, legacyCandidates, setupQuestions } from '../../src/core/setup-schema';
import { buildLifePlan } from '../../src/core/life-plan';
import { nutritionPlan } from '../../src/core/nutrition-plan';
import { validateSetup, optionalSetupQuestions } from '../../src/core/setup-schema';
import { PhotoStore } from '../../src/core/photo-store';
import { buildGoalVisualBrief, UnavailableGoalImageProvider } from '../../src/core/goal-image-provider';
import { openPhotoArchive, sealPhotoArchive } from '../../src/core/backup-crypto';

export interface PilotOptions { databasePath: string; port: number; privateOrigin?:string; allowTestSyncLoopback?:boolean }
export interface PilotServer { url: string; close: () => Promise<void> }
class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
const assets: Record<string, [string, string]> = {
  '/': ['apps/local-pilot/public/index.html', 'text/html'],
  '/favicon.ico': ['assets/brand/stoic-body.ico','image/x-icon'],
  '/goal-visualization.js': ['apps/local-pilot/public/goal-visualization.js','text/javascript'],
  '/icon.png': ['assets/brand/stoic-body-512.png','image/png'],
  '/app.js': ['apps/local-pilot/public/app.js', 'text/javascript'],
  '/health.js': ['apps/local-pilot/public/health.js', 'text/javascript'],
  '/learn.js': ['apps/local-pilot/public/learn.js', 'text/javascript'],
  '/access.js': ['apps/local-pilot/public/access.js', 'text/javascript'],
  '/host.js': ['apps/local-pilot/public/host.js', 'text/javascript'],
  '/setup.js': ['apps/local-pilot/public/setup.js', 'text/javascript'],
  '/body-references.webp': ['assets/brand/body-references.webp','image/webp'],
  '/recovery.js': ['apps/local-pilot/public/recovery.js', 'text/javascript'],
  '/sync.js': ['apps/local-pilot/public/sync.js', 'text/javascript'],
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
async function body(request: IncomingMessage, limit = 1_048_576) {
  if (request.headers['content-type'] !== 'application/json') throw new HttpError(415, 'Send JSON data.');
  let length = 0; const parts: Buffer[] = [];
  for await (const chunk of request) {
    length += chunk.length;
    if (length > limit) throw new HttpError(413, 'The request is too large.');
    parts.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { throw new HttpError(400, 'The request could not be read.'); }
}
/** Always listens on loopback. An optional exact private HTTPS origin may proxy it. */
export async function startPilot(options: PilotOptions): Promise<PilotServer> {
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) throw new Error('Invalid port.');
  const repository = new CoreRepository(options.databasePath);
  const photos=new PhotoStore(repository.database),imageProvider=new UnavailableGoalImageProvider();
  const accounts = new AccountStore(repository.database);
  const recovery = new RecoveryStore(repository, accounts);
  const hub = new SyncHub(repository,accounts);
  const sync = new SyncClient(repository,accounts,recovery,createSyncTransport(options.allowTestSyncLoopback),hub.instanceId,options.allowTestSyncLoopback);
  const privateOrigin=options.privateOrigin?syncEndpoint(options.privateOrigin):undefined;
  let origin = '';
  const server = createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    void (async () => {
      const requestOrigin=privateOrigin&&request.headers.host===new URL(privateOrigin).host?privateOrigin:origin;
      if (request.headers.host !== new URL(requestOrigin).host || (request.headers.origin && request.headers.origin !== requestOrigin)
        || request.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'Open this app directly on this computer.');
      const path = new URL(request.url ?? '/', origin).pathname;
      if (path === '/api/identity' && request.method === 'GET') { json(response, 200, { product: 'Stoic Body', edition: 'desktop-local', version: '0.6.0-local' }); return; }
      if(['/api/sync/claim','/api/sync/exchange'].includes(path)){
        if(request.method!=='POST')throw new HttpError(405,'Use a sync client.');const data=await body(request);
        if(path.endsWith('/claim')){json(response,200,hub.claim(data));return;}
        const bearer=request.headers.authorization;if(!bearer?.startsWith('Bearer '))throw new HttpError(401,'Device authorization is required.');json(response,200,hub.exchange(bearer.slice(7),data));return;
      }
      const cookieFlags=`HttpOnly; SameSite=Strict; Path=/;${requestOrigin.startsWith('https:')?' Secure;':''}`;
      const cookie = request.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('stoic_local='))?.slice('stoic_local='.length);
      const session = accounts.authenticate(cookie);
      const signedIn = (account: Account, token: string) => ({ authenticated: true, account, token, snapshot: repository.snapshot(account.id), guide: accounts.readGuide(account.id), mode: 'local' });
      if (path === '/api/bootstrap' && request.method === 'GET') {
        json(response, 200, session ? signedIn(session.account, session.csrf) : { authenticated: false, mode: 'local' }); return;
      }
      if (['/api/auth/register','/api/auth/login','/api/auth/recover'].includes(path)) {
        if (request.method !== 'POST' || request.headers.origin !== requestOrigin) throw new HttpError(403,'Account requests must come from this app.');
        const data = await body(request);
        const result = path.endsWith('/register') ? await accounts.register(data) : path.endsWith('/recover') ? await accounts.recover(data) : {account:await accounts.login(data)};
        if(path.endsWith('/recover')){hub.reset(result.account.id);sync.disconnect(result.account.id);}
        if(cookie) accounts.logout(cookie);
        const fresh = accounts.createSession(result.account.id);
        response.setHeader('Set-Cookie',`stoic_local=${fresh.key}; ${cookieFlags} Max-Age=43200`);
        json(response,200,{...signedIn(result.account,fresh.csrf),...('recoveryKey' in result ? {recoveryKey:result.recoveryKey} : {})}); return;
      }
      if (path.startsWith('/api/')) {
        const supplied = request.headers['x-stoic-token'];
        if (!session) throw new HttpError(401, 'Sign in to open your private workspace.');
        if (typeof supplied !== 'string' || !secretEquals(supplied, session.csrf)) throw new HttpError(403, 'Your local session changed. Reconnect the app.');
        const owner = session.account.id;
        const requireCurrent = () => { const live=accounts.authenticate(cookie);if(!live||live.account.id!==owner||!secretEquals(supplied,live.csrf))throw new HttpError(401,'Your session changed. Sign in again.'); };
        if (path === '/api/recovery/points' && request.method === 'GET') { json(response,200,{points:recovery.list(owner)});return; }
        if (path === '/api/sync/status' && request.method === 'GET') {json(response,200,{...sync.status(owner),devices:hub.devices(owner),hostAddress:privateOrigin??null});return;}
        if (path === '/api/snapshot' && request.method === 'GET') { json(response, 200, { snapshot: repository.snapshot(owner) }); return; }
        if (path === '/api/health-content' && request.method === 'GET') { json(response, 200, { diets, trainingStyles, meals: mealCatalog }); return; }
        if (path === '/api/learning-content' && request.method === 'GET') { json(response, 200, { courses }); return; }
        if(path==='/api/setup'&&request.method==='GET'){const s=repository.snapshot(owner),state=readSetup(s);json(response,200,{state,questions:activeQuestions(state),catalog:setupQuestions,optional:optionalSetupQuestions,legacy:legacyCandidates(s.answers)});return;}
        if(path==='/api/photos'&&request.method==='GET'){json(response,200,{photos:photos.list(owner),provider:await imageProvider.status()});return;}
        if (request.method !== 'POST' || request.headers.origin !== requestOrigin) throw new HttpError(403, 'Save requests must come from this app.');
        const data = await body(request, path==='/api/photos/restore'?44*1024*1024:path==='/api/photos/add'?14*1024*1024:['/api/recovery/preview','/api/recovery/restore'].includes(path) ? 24*1024*1024 : 1_048_576);
        requireCurrent();
        if(path==='/api/photos/add'){const result=await photos.add(owner,data);requireCurrent();json(response,200,{photo:result});return;}
        if(path==='/api/photos/read'){const p=object(data);keys(p,['id','original']);const photo=photos.read(owner,text(p.id),p.original===true);json(response,200,{image:photo.bytes.toString('base64'),mime:photo.mime});return;}
        if(path==='/api/photos/delete'){const p=object(data);keys(p,['id']);photos.remove(owner,text(p.id));json(response,200,{deleted:true});return;}
        if(path==='/api/photos/export'){const p=object(data);keys(p,['passphrase']);const file=await sealPhotoArchive(photos.archive(owner),p.passphrase);requireCurrent();json(response,200,{file});return;}
        if(path==='/api/photos/restore'){const p=object(data);keys(p,['passphrase','file']);const archive=await openPhotoArchive(p.file,p.passphrase);requireCurrent();json(response,200,await photos.restore(owner,archive,requireCurrent));return;}
        if(path==='/api/photos/brief'){
          keys(object(data),[]);const snapshot=repository.snapshot(owner),s=readSetup(snapshot),a=s.answers,choice=(k:string)=>a[k]?.state==='answered'?a[k]?.selections||[]:[],measure=a.measurements?.state==='answered'?a.measurements:null,metric=measure?.units==='metric';
          const brief=buildGoalVisualBrief({profileRevision:snapshot.profileRevision,age:a.age?.state==='answered'?Number(a.age.values?.value):0,restrictions:choice('health').length===1?choice('health')[0]:'unknown',heightCm:measure?.units?Number(measure.values?.height)*(metric?1:2.54):0,weightKg:measure?.units?Number(measure.values?.weight)*(metric?1:.45359237):0,targetKg:measure?.values?.target?Number(measure.values.target)*(metric?1:.45359237):null,experience:choice('experience')[0]||'',availableMinutesPerWeek:choice('trainingDays').length*Number(choice('trainingTime')[0]||0),goals:choice('fitnessGoals'),visualGender:['male','female'].includes(choice('visual')[0])?choice('visual')[0] as 'male'|'female':null});
          json(response,200,{brief,provider:await imageProvider.status()});return;
        }
        if(path==='/api/photos/generate'){throw new HttpError(503,(await imageProvider.status()).reason);}
        if(path==='/api/sync/code'){keys(object(data),[]);if(sync.status(owner).linked)throw new Error('This account already uses another host. Create pairing codes on that host.');json(response,200,hub.issueCode(owner));return;}
        if(path==='/api/sync/link-preview'){const preview=await sync.previewLink(owner,data,requireCurrent);requireCurrent();json(response,200,preview);return;}
        if(path==='/api/sync/link-confirm'){const result=await sync.confirmLink(owner,data,requireCurrent);requireCurrent();json(response,200,{...result,...signedIn(session.account,session.csrf)});return;}
        if(path==='/api/sync/now'){keys(object(data),[]);await sync.run(owner);requireCurrent();json(response,200,{...sync.status(owner),snapshot:repository.snapshot(owner)});return;}
        if(path==='/api/sync/disconnect'){keys(object(data),[]);sync.disconnect(owner);json(response,200,sync.status(owner));return;}
        if(path==='/api/sync/resolve'){sync.resolve(owner,data);json(response,200,sync.status(owner));return;}
        if(path==='/api/sync/revoke'){const p=object(data);keys(p,['deviceId']);hub.revoke(owner,text(p.deviceId));json(response,200,{devices:hub.devices(owner)});return;}
        if (path === '/api/recovery/status') { json(response,200,recovery.status(owner,data));return; }
        if (path === '/api/recovery/export') { const p=object(data);keys(p,['passphrase']);const file=await recovery.export(owner,p.passphrase);requireCurrent();json(response,200,{file});return; }
        if (path === '/api/recovery/preview') { const p=object(data);keys(p,['source','passphrase']);const preview=await recovery.preview(owner,p.source,p.passphrase);requireCurrent();json(response,200,preview);return; }
        if (path === '/api/recovery/restore') {
          const result=await recovery.restore(owner,data,requireCurrent,()=>{hub.reset(owner);sync.disconnect(owner);});
          repository.database.prepare('DELETE FROM app_sessions WHERE owner_id=?').run(owner);
          const fresh=accounts.createSession(owner);
          response.setHeader('Set-Cookie',`stoic_local=${fresh.key}; ${cookieFlags} Max-Age=43200`);
          json(response,200,{...result,...signedIn(session.account,fresh.csrf)});return;
        }
        if (path === '/api/auth/logout') { keys(object(data),[]); accounts.logout(cookie!); response.setHeader('Set-Cookie',`stoic_local=; ${cookieFlags} Max-Age=0`); json(response,200,{authenticated:false}); return; }
        if (path === '/api/guide') { recovery.captureBeforeEdit(owner);json(response,200,{guide:accounts.saveGuide(owner,data)}); return; }
        if (path === '/api/meal-preview') { json(response, 200, previewMeal(data)); return; }
        if(path==='/api/setup/insights'){const p=object(data);keys(p,['state']);json(response,200,{nutrition:nutritionPlan(validateSetup(p.state))});return;}
        if(path==='/api/life-plan/preview'){const p=object(data);keys(p,['startDate','timezone','pace','notBefore']);const s=repository.snapshot(owner);json(response,200,{plan:buildLifePlan({setup:readSetup(s),snapshot:s,startDate:text(p.startDate,10),timezone:zone(p.timezone),pace:p.pace as 'normal'|'lighter',...(p.notBefore?{notBefore:text(p.notBefore,30)}:{})})});return;}
        if (path === '/api/training-preview') { json(response, 200, buildRoutine(data)); return; }
        if (path === '/api/health-summary') {
          const p = object(data); keys(p, ['date', 'unit']); if (!['kg', 'lb'].includes(String(p.unit))) throw new Error('Choose weight units.');
          json(response, 200, { summary: summarizeHealth(repository.snapshot(owner).health, text(p.date), p.unit as 'kg' | 'lb') }); return;
        }
        if (path === '/api/training-advice') { const p = object(data); keys(p, ['routineId', 'exercise']); json(response, 200, progressionAdvice(repository.snapshot(owner).health, text(p.routineId), text(p.exercise))); return; }
        if (path === '/api/command') {
          recovery.captureBeforeEdit(owner);
          const receipt = sync.apply(owner, data as Command);
          void sync.run(owner);
          json(response, receipt.status === 'conflict' ? 409 : 200, { receipt, snapshot: repository.snapshot(owner), ...(receipt.safeReason ? { error: receipt.safeReason } : {}) }); return;
        }
        if (path === '/api/propose') { recovery.captureBeforeEdit(owner);json(response, 200, repository.proposeDay(owner, data as DayInput)); return; }
        if (path === '/api/time') {
          const value = object(data); keys(value, ['local', 'timezone']);
          json(response, 200, resolveWallTime(text(value.local, 16), zone(value.timezone), { source: 'user' })); return;
        }
        throw new HttpError(404, 'This action is unavailable.');
      }
      if (request.method !== 'GET' || !Object.hasOwn(assets, path)) throw new HttpError(404, 'Page not found.');
      const [file, type] = assets[path];
      const bytes = await readFile(resolve(file));
      response.writeHead(200, { 'Content-Type': type.startsWith('text/')?`${type}; charset=utf-8`:type }); response.end(bytes);
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
  sync.start();let closed = false;
  return { url: origin, close: async () => {
    if (closed) return; closed = true;
    server.closeIdleConnections();
    await new Promise<void>((accept, reject) => server.close(error => error ? reject(error) : accept())); await sync.close();repository.close();
  } };
}

