import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startPilot } from './server';

async function main() {
  const folder = resolve('private/local-pilot');
  await mkdir(folder, { recursive: true });
  const pilot = await startPilot({ databasePath: resolve(folder, 'stoic-body.sqlite'), port: 4330 });
  console.log(`Stoic Body local pilot: ${pilot.url}`);
  console.log('Saved on this computer. Automatic cross-device sync and native alarms are not connected yet.');
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void pilot.close().then(() => process.exit(0)); });
}
main().catch(() => { console.error('The local pilot could not start. Check that port 4330 is free and the private data folder is writable.'); process.exitCode = 1; });
