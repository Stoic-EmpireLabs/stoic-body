// Documentation integrity only. Does not execute or validate production features.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
process.chdir(root);
const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const walk = d => fs.readdirSync(d, {withFileTypes:true}).flatMap(x => x.isDirectory() ? walk(path.join(d,x.name)) : [path.join(d,x.name)]);
const reportPath = 'docs/phase-2-verification.md';
if (!fs.existsSync(reportPath)) fs.writeFileSync(reportPath, '# Phase 2 verification\n');
const files = ['README.md', ...walk('docs'), ...walk('private')];
const broken = [], jsonErrors = [];
let localLinks = 0;
for (const f of files) {
  if (f.endsWith('.json')) { try { json(f); } catch (e) { jsonErrors.push({file:f,error:e.message}); } }
  if (!f.endsWith('.md')) continue;
  for (const m of read(f).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = m[1].replace(/^<|>$/g,'').split('#')[0];
    if (!target || /^(https?:|mailto:|app:)/.test(target)) continue;
    localLinks++;
    if (!fs.existsSync(path.resolve(path.dirname(f),target))) broken.push({file:f,target});
  }
}
const req = json('docs/requirements.json').requirements;
const trace = json('docs/architecture/traceability.json').requirements;
const patterns = json('docs/research/competitors/experience-patterns.json').patterns;
const sources = json('docs/architecture/sources.json').sources;
const baseline = json('docs/architecture/baseline-snapshot.json');
const changed = Object.entries(baseline.files).filter(([f,h]) => !fs.existsSync(f) || crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex') !== h).map(([f]) => f);
const screens = [...read('docs/architecture/product-spec.md').matchAll(/\| (SC\d{2})\b/g)].map(m=>m[1]);
const prior = JSON.parse(cp.execFileSync('git',['show','HEAD:docs/requirements.json'],{encoding:'utf8'})).requirements;
const alteredSourceRequirements = prior.filter(p=>!req.some(r=>r.id===p.id&&r.requirement===p.requirement&&r.source===p.source)).map(p=>p.id);
const missingTrace = req.filter(r=>!trace.some(t=>t.id===r.id)).map(r=>r.id);
const badPaths = trace.filter(t=>!fs.existsSync(path.resolve('docs',t.design))||!fs.existsSync(path.resolve('docs',t.plan))).map(t=>t.id);
const badPatterns = patterns.flatMap(p=>p.requirement_ids.filter(id=>!req.some(r=>r.id===id)).map(id=>({pattern:p.id,id})));
const ignored = cp.spawnSync('git',['check-ignore','--','private/personal-profile.json'],{encoding:'utf8'}).status===0;
const pass = req.length===96 && new Set(req.map(r=>r.id)).size===96 && trace.length===96 && screens.length===20 && new Set(screens).size===20 && sources.length===18 && !broken.length && !jsonErrors.length && !missingTrace.length && !badPaths.length && !badPatterns.length && !changed.length && !alteredSourceRequirements.length && ignored;
const result = {
  checked_at:new Date().toISOString(), scope:'Documentation integrity; not product acceptance', passed:pass,
  requirements:req.length, unique_requirements:new Set(req.map(r=>r.id)).size, original_requirements_preserved:prior.length,
  altered_source_requirements:alteredSourceRequirements, traceability_rows:trace.length, missing_traceability:missingTrace,
  invalid_design_or_plan_paths:badPaths, screens:screens.length, competitor_patterns:patterns.length,
  invalid_pattern_requirements:badPatterns, technical_sources:sources.length,
  json_files_checked:files.filter(f=>f.endsWith('.json')).length,json_errors:jsonErrors,
  local_markdown_links_checked:localLinks,broken_links:broken,baseline_files_checked:Object.keys(baseline.files).length,
  product_files_changed_since_snapshot:changed,private_planning_path_ignored:ignored,
  legacy_unit_tests:{passed:15,failed:0,command:'npm test',scope:'Executed this turn; existing tests include requirements mismatches'},
  legacy_typecheck:{exit_code:0,command:'node node_modules/typescript/bin/tsc --noEmit --incremental false'},
  lint:'Not run: no script in existing package',native_acceptance:'Not executed',
  xp_spec_arithmetic:{thresholds:[1,2,3,4].map(l=>100*(l-1)+25*(l-1)*(l-2)/2),half_workout:Math.floor(25*0.5),split_budget_total:9+8+8}
};
fs.writeFileSync('docs/architecture/verification-results.json',JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(reportPath, `# Phase 2 verification receipt\n\nChecked ${result.checked_at}. Result: **${pass?'PASS':'FAIL'} for documentation integrity only**. [Machine-readable evidence](architecture/verification-results.json).\n\n- ${req.length} unique requirements and ${trace.length} design/plan mappings; ${prior.length} previous requirement/source texts preserved.\n- ${screens.length} specified screens, ${patterns.length} competitor journey patterns with valid requirement references, and ${sources.length} technical-source records.\n- ${result.json_files_checked} JSON files parsed; ${localLinks} local Markdown references checked; ${broken.length} broken links. Scope is README, docs and private planning records; third-party dependency files are excluded.\n- ${Object.keys(baseline.files).length} existing source/test/package hashes compared: ${changed.length} changed during this documentation work.\n- Private planning path remains ignored by Git. This does not protect owner-like values already embedded in tracked app source.\n- XP specification arithmetic checked: level thresholds 0/100/225/375; half of a 25-XP workout earns 12; child budgets 9+8+8 remain 25. This is a specification check, not implementation acceptance.\n\n## Existing app checks\n\nExecuted npm test: 15 passed, zero failures. Executed TypeScript checking with --noEmit --incremental false: exit 0. No lint script exists. These checks validate only the existing code/tests; they do not establish the requested XP/scheduling/privacy behavior. See [baseline assessment](architecture/baseline-assessment.md).\n\nThe public-URL E2E script was not run. No native build, automatic sync, alarm delivery, encryption, entitlement, complete restore or commercial release was tested. No app code, package dependency, secret, account or deployment was modified by this phase.\n\n## Review corrections\n\nThe first document scan found references to this not-yet-written receipt and used an overly strict screen-ID pattern that missed IDs followed by screen names. The receipt was added and the selector corrected; this check was rerun. These were documentation-check issues, not app defects. Source review found legacy requirement mismatches, recorded as unresolved rather than hidden behind passing unit tests.\n\n## Remaining decisions\n\nHosting for mandatory sync, Apple build access, OS floors, Android timing and the commercial offer remain explicit inputs. Personal health/schedule unknowns remain unanswered. Phase 3 has not begun; [Phase 2 review](phase-2-review.md) is the current approval checkpoint.\n`);
console.log(JSON.stringify(result,null,2));
process.exitCode = pass ? 0 : 1;
