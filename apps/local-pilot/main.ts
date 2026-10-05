import { mkdir,readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startPilot } from './server';
import { object, keys, text } from '../../src/core/validation';

async function main() {
  const folder = resolve(process.env.STOIC_BODY_DATA_DIR || 'private/local-pilot');
  await mkdir(folder, { recursive: true });
  let privateOrigin=process.env.STOIC_BODY_PRIVATE_ORIGIN;
  try{const config=object(JSON.parse((await readFile(resolve(folder,'sync-host.json'),'utf8')).replace(/^\uFEFF/,'')));keys(config,['privateOrigin']);privateOrigin=privateOrigin||text(config.privateOrigin,300);}catch(e){if(!e||typeof e!=='object'||!('code' in e)||e.code!=='ENOENT')throw e;}
  const pilot = await startPilot({ databasePath: resolve(folder, 'stoic-body.sqlite'), port: Number(process.env.STOIC_BODY_PORT || 4330),privateOrigin });
  console.log(`Stoic Body local pilot: ${pilot.url}`);
  console.log('Saved on this computer. Optional private Windows sync is available in Settings. Native alarms remain in development.');
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void pilot.close().then(() => process.exit(0)); });
}
main().catch(() => { console.error('The local pilot could not start. Check that port 4330 is free and the private data folder is writable.'); process.exitCode = 1; });
