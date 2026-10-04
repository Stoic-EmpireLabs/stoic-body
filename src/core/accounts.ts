import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { canonical, integer, keys, object, text } from './validation';

export class AccountError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export interface Account { id: string; username: string; displayName: string }
export interface GuideState { stage: 'welcome' | 'questions' | 'paused' | 'ready'; question: number; tourStep: number; tourDone: boolean }
export interface Guide { revision: number; state: GuideState }
interface AccountRow { owner_id: string; username: string; display_name: string; salt: string; password_hash: string; recovery_hash: string; guide_revision: number; guide_json: string }
const initial: GuideState = { stage: 'welcome', question: 0, tourStep: 0, tourDone: false };
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const account = (row: AccountRow): Account => ({ id: row.owner_id, username: row.username, displayName: row.display_name });
function username(value: unknown) { const v = text(value, 40).toLowerCase(); if (!/^[a-z0-9][a-z0-9_.-]{2,39}$/.test(v)) throw new AccountError(400, 'Use a username of 3–40 letters, numbers, dots, dashes or underscores.'); return v; }
function password(value: unknown) { if (typeof value !== 'string' || value.length < 15 || value.length > 128 || !value.trim()) throw new AccountError(400, 'Use a passphrase of 15–128 characters.'); return value.normalize('NFC'); }
function equal(a: string, b: string) { const x = Buffer.from(a, 'hex'), y = Buffer.from(b, 'hex'); return x.length === y.length && timingSafeEqual(x, y); }
let hashing = 0;
async function hash(value: string, salt: string): Promise<string> {
  if (hashing >= 4) throw new AccountError(429, 'Sign-in is busy. Try again in a moment.');
  hashing++;
  try { return await new Promise((resolve, reject) => scrypt(value, Buffer.from(salt, 'hex'), 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, result) => error ? reject(error) : resolve(result.toString('hex')))); }
  finally { hashing--; }
}

/** Local account adapter. Only the HTTP session determines the core owner. */
export class AccountStore {
  constructor(private db: DatabaseSync, private now = () => Date.now()) {
    db.exec(`CREATE TABLE IF NOT EXISTS app_accounts(
      owner_id TEXT PRIMARY KEY REFERENCES core_owners(id), username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
      salt TEXT NOT NULL,password_hash TEXT NOT NULL,recovery_hash TEXT NOT NULL,guide_revision INTEGER NOT NULL DEFAULT 0,guide_json TEXT NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS app_sessions(key_hash TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES app_accounts(owner_id),csrf TEXT NOT NULL,expires INTEGER NOT NULL,idle INTEGER NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS app_auth_limits(key_hash TEXT PRIMARY KEY,attempts INTEGER NOT NULL,until_time INTEGER NOT NULL) STRICT;`);
  }
  private row(name: string) { return this.db.prepare('SELECT * FROM app_accounts WHERE username=?').get(name) as unknown as AccountRow | undefined; }
  private throttle(key: string, max: number) {
    const now = this.now(), keyHash = digest(key);
    this.db.prepare('DELETE FROM app_auth_limits WHERE until_time<=?').run(now);
    const row = this.db.prepare('SELECT attempts FROM app_auth_limits WHERE key_hash=?').get(keyHash);
    if (row && Number(row.attempts) >= max) throw new AccountError(429, 'Too many attempts. Wait 15 minutes before trying again.');
    this.db.prepare('INSERT INTO app_auth_limits VALUES(?,1,?) ON CONFLICT(key_hash) DO UPDATE SET attempts=attempts+1').run(keyHash, now + 15 * 60_000);
  }
  async register(input: unknown) {
    const p = object(input); keys(p, ['username', 'displayName', 'password']); const name = username(p.username), displayName = text(p.displayName, 60), pass = password(p.password);
    this.throttle('register', 12);
    const salt = randomBytes(16).toString('hex'), passwordHash = await hash(pass, salt), recoveryKey = randomBytes(24).toString('hex'), owner = `account-${randomUUID()}`;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (this.row(name)) throw new AccountError(409, 'That username is unavailable. Sign in or choose another.');
      this.db.prepare('INSERT INTO core_owners(id) VALUES(?)').run(owner);
      this.db.prepare('INSERT INTO app_accounts(owner_id,username,display_name,salt,password_hash,recovery_hash,guide_json) VALUES(?,?,?,?,?,?,?)').run(owner,name,displayName,salt,passwordHash,digest(recoveryKey),JSON.stringify(initial));
      this.db.exec('COMMIT');
    } catch (e) { if (this.db.isTransaction) this.db.exec('ROLLBACK'); throw e; }
    return { account: { id: owner, username: name, displayName }, recoveryKey };
  }
  async login(input: unknown): Promise<Account> {
    const p = object(input); keys(p, ['username', 'password']); const name = username(p.username);
    this.throttle('auth-global', 60); this.throttle(`login:${name}`, 5);
    const pass = typeof p.password === 'string' && p.password.length <= 128 ? p.password.normalize('NFC') : '';
    const row = this.row(name), candidate = await hash(pass, row?.salt || '0'.repeat(32));
    const current = this.row(name);
    if (!row || !current || row.password_hash !== current.password_hash || row.salt !== current.salt || !equal(candidate, current.password_hash)) throw new AccountError(401, 'Sign-in details are incorrect.');
    this.db.prepare('DELETE FROM app_auth_limits WHERE key_hash=?').run(digest(`login:${name}`));
    return account(row);
  }
  async recover(input: unknown) {
    const p = object(input); keys(p, ['username', 'recoveryKey', 'password']); const name = username(p.username), pass = password(p.password);
    this.throttle('recover-global', 20); this.throttle(`recover:${name}`, 5);
    const row = this.row(name), key = typeof p.recoveryKey === 'string' ? p.recoveryKey.trim().slice(0, 200) : '';
    if (!row || !equal(digest(key), row.recovery_hash)) throw new AccountError(401, 'Recovery details are incorrect.');
    const salt = randomBytes(16).toString('hex'), passwordHash = await hash(pass, salt), recoveryKey = randomBytes(24).toString('hex');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = this.db.prepare('UPDATE app_accounts SET salt=?,password_hash=?,recovery_hash=? WHERE owner_id=? AND recovery_hash=?').run(salt,passwordHash,digest(recoveryKey),row.owner_id,row.recovery_hash);
      if (result.changes !== 1) throw new AccountError(401, 'Recovery details are incorrect.');
      this.db.prepare('DELETE FROM app_sessions WHERE owner_id=?').run(row.owner_id);
      this.db.prepare('DELETE FROM app_auth_limits WHERE key_hash IN (?,?)').run(digest(`login:${name}`),digest(`recover:${name}`)); this.db.exec('COMMIT');
    } catch(e) { if(this.db.isTransaction) this.db.exec('ROLLBACK'); throw e; }
    return { account: account(row), recoveryKey };
  }
  createSession(owner: string) {
    const key = randomBytes(32).toString('hex'), csrf = randomBytes(32).toString('hex'), now = this.now();
    this.db.prepare('DELETE FROM app_sessions WHERE expires<=? OR idle<=?').run(now,now);
    this.db.prepare('INSERT INTO app_sessions VALUES(?,?,?,?,?)').run(digest(key),owner,csrf,now+12*60*60_000,now+30*60_000);
    return { key, csrf };
  }
  authenticate(key: string | undefined) {
    if (!key || !/^[a-f0-9]{64}$/.test(key)) return null;
    const now = this.now(), keyHash = digest(key);
    const row = this.db.prepare('SELECT a.*,s.csrf FROM app_sessions s JOIN app_accounts a ON a.owner_id=s.owner_id WHERE s.key_hash=? AND s.expires>? AND s.idle>?').get(keyHash,now,now) as unknown as (AccountRow & {csrf:string}) | undefined;
    if (!row) return null;
    this.db.prepare('UPDATE app_sessions SET idle=? WHERE key_hash=?').run(now+30*60_000,keyHash);
    return { account: account(row), csrf: row.csrf };
  }
  logout(key: string) { this.db.prepare('DELETE FROM app_sessions WHERE key_hash=?').run(digest(key)); }
  readGuide(owner: string): Guide {
    const row = this.db.prepare('SELECT guide_revision,guide_json FROM app_accounts WHERE owner_id=?').get(owner)!;
    return { revision: Number(row.guide_revision), state: JSON.parse(String(row.guide_json)) };
  }
  saveGuide(owner: string, input: unknown): Guide {
    const p = object(input); keys(p, ['baseRevision','state']); const revision = integer(p.baseRevision,0), state = object(p.state); keys(state,['stage','question','tourStep','tourDone']);
    if (!['welcome','questions','paused','ready'].includes(String(state.stage)) || typeof state.tourDone !== 'boolean') throw new AccountError(400,'Choose a valid setup state.');
    integer(state.question,0,19); integer(state.tourStep,0,11);
    const current=this.readGuide(owner);
    if(canonical(current.state)===canonical(state)) return current;
    const result=this.db.prepare('UPDATE app_accounts SET guide_json=?,guide_revision=guide_revision+1 WHERE owner_id=? AND guide_revision=?').run(JSON.stringify(state),owner,revision);
    if(result.changes!==1) throw new AccountError(409,'Setup changed in another tab. Reconnect before continuing.');
    return this.readGuide(owner);
  }
}
