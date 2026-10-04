import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export async function buildDesktop({ outputRoot = resolve('private/releases', new Date().toISOString().replace(/[:.]/g, '-')), archive = true } = {}) {
  if (process.platform !== 'win32' || process.arch !== 'x64' || process.version !== 'v24.19.0') throw new Error('Build with Windows x64 Node v24.19.0 to match the bundled license.');
  const folder = resolve(outputRoot, 'Stoic-Body-Windows-x64');
  await mkdir(outputRoot, { recursive: true });
  await mkdir(folder); // Refuse an existing build instead of overwriting it.
  const entries = [
    ...['index.html', 'app.js', 'health.js', 'learn.js', 'access.js', 'host.js', 'recovery.js', 'styles.css'].map(f => [`apps/local-pilot/public/${f}`, `apps/local-pilot/public/${f}`]),
    ...['styles.css', 'appearance.js'].map(f => [`prototypes/phase-3/${f}`, `prototypes/phase-3/${f}`]),
    ...['Start Stoic Body.cmd', 'Stop Stoic Body.cmd', 'launch.ps1', 'README.txt'].map(f => [`apps/desktop/${f}`, f]),
    [process.execPath, 'runtime/node.exe'], ['apps/desktop/node-LICENSE.txt', 'runtime/LICENSE.txt'],
  ];
  for (const [source, relative] of entries) {
    const destination = resolve(folder, relative);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  await build({ entryPoints: ['apps/local-pilot/main.ts'], bundle: true, platform: 'node', target: 'node24', format: 'cjs', outfile: resolve(folder, 'server.cjs'), legalComments: 'eof' });
  const files = [];
  for (const relative of [...entries.map(e => e[1]), 'server.cjs'].sort()) {
    const bytes = await readFile(resolve(folder, relative));
    files.push({ path: relative, bytes: bytes.length, sha256: digest(bytes) });
  }
  const commit = (await run('git', ['rev-parse', 'HEAD'])).stdout.trim();
  await writeFile(resolve(folder, 'manifest.json'), JSON.stringify({ product: 'Stoic Body local pilot', runtime: process.version, sourceCommit: commit, files }, null, 2) + '\n');
  let zip;
  if (archive) {
    zip = resolve(outputRoot, 'Stoic-Body-Windows-x64.zip');
    await run('powershell.exe', ['-NoProfile', '-Command', 'Compress-Archive -LiteralPath $env:STOIC_PACKAGE_FOLDER -DestinationPath $env:STOIC_PACKAGE_ZIP -CompressionLevel Optimal'], { env: { ...process.env, STOIC_PACKAGE_FOLDER: folder, STOIC_PACKAGE_ZIP: zip }, timeout: 180000 });
    await writeFile(resolve(outputRoot, 'SHA256SUMS.txt'), `${digest(await readFile(zip))}  ${basename(zip)}\n`);
  }
  return { folder, zip };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(JSON.stringify(await buildDesktop()));

