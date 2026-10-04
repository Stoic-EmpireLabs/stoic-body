const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const manifest = require('./publish-manifest.json');
const proof = path.resolve(__dirname, '../../.vercel/phase3-remote-proof');
const results = [];
for (const entry of manifest.files) {
  const raw = fs.readFileSync(path.join(proof, entry.file));
  let content = raw;
  let platformAppendix = false;
  if (entry.file.endsWith('.html')) {
    const known = '<script async data-explicit-opt-in="true" data-deployment-id="dpl_4hQR15b2fbLmo8H6WNaquLMxmgbD" src="https://vercel.live/_next-live/feedback/feedback.js"></script>';
    const text = raw.toString('utf8');
    if (text.endsWith(known)) { content = Buffer.from(text.slice(0,-known.length)); platformAppendix = true; }
  }
  const sha256 = crypto.createHash('sha256').update(content).digest('hex');
  assert.equal(sha256, entry.sha256, 'Uploaded source mismatch: '+entry.file);
  results.push({file:entry.file,sourceMatches:true,vercelToolbarAppendix:platformAppendix,sourceSha256:sha256});
}
fs.writeFileSync(path.join(__dirname,'deployment-verification.json'),JSON.stringify({checked_at:new Date().toISOString(),
  deployment:'https://stoic-body-qv8gdjf3o-stoic-dev-team.vercel.app',
  protection:'Vercel account authentication retained; fetched with authenticated Vercel CLI',
  note:'HTML comparison permits only the exact observed Vercel feedback script appended after the source. CSP does not allow that external script. All other bytes must match.',assets:results},null,2)+'\n');
console.log('PASS: all 7 uploaded source assets match; platform-added HTML toolbar script identified separately.');
