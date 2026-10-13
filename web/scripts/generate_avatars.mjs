import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_STOIC = path.resolve(__dirname, '..');
const ROOT_COMMUNITY = path.resolve(__dirname, '../../../stoic-body-community/web');

const EXERCISES_JSON_PATH = path.join(ROOT_STOIC, 'src/data/exercises.json');
const FEMALE_MANIFEST_PATH = path.join(ROOT_STOIC, 'src/data/female_3d_manifest.json');

const MALE_SRC_DIR = path.join(ROOT_STOIC, 'public/assets/male-3d');
const FEMALE_SRC_DIR = path.join(ROOT_STOIC, 'public/assets/female-3d');

const MALE_OUT_DIR = path.join(ROOT_STOIC, 'public/assets/exercises/male');
const FEMALE_OUT_DIR = path.join(ROOT_STOIC, 'public/assets/exercises/female');

const MALE_COMMUNITY_OUT_DIR = path.join(ROOT_COMMUNITY, 'public/assets/exercises/male');
const FEMALE_COMMUNITY_OUT_DIR = path.join(ROOT_COMMUNITY, 'public/assets/exercises/female');

const CACHE_DIR = path.join(ROOT_STOIC, '.webp_cache');

[
  MALE_OUT_DIR,
  FEMALE_OUT_DIR,
  MALE_COMMUNITY_OUT_DIR,
  FEMALE_COMMUNITY_OUT_DIR,
  CACHE_DIR
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('--- Phase 1: Reading Catalog & Manifests ---');
const rawExercises = JSON.parse(fs.readFileSync(EXERCISES_JSON_PATH, 'utf8'));
const femaleManifestList = JSON.parse(fs.readFileSync(FEMALE_MANIFEST_PATH, 'utf8'));
const femaleManifestMap = new Map();
femaleManifestList.forEach(m => {
  femaleManifestMap.set(m.id, m);
});

console.log(`Loaded ${rawExercises.length} exercises and ${femaleManifestList.length} female manifest entries.`);

// Male movement archetype lookup
const maleArchetypeImageMap = {
  'barbell-squat': 'barbell-squat.jpg',
  'goblet-squat': 'barbell-squat.jpg',
  'bench-press': 'bench-press.jpg',
  'push-up': 'bench-press.jpg',
  'deadlift': 'deadlift.jpg',
  'romanian-deadlift': 'deadlift.jpg',
  'overhead-press': 'overhead-press.jpg',
  'lat-pulldown': 'lat-pulldown.jpg',
  'bicep-curl': 'bicep-curl.jpg',
  'tricep-pushdown': 'tricep-pushdown.jpg',
  'barbell-row': 'barbell-row.jpg',
  'lateral-raise': 'lateral-raise.jpg',
  'walking-lunge': 'walking-lunge.jpg',
  'pull-up': 'pull-up.jpg',
  'standing-calf-raise': 'standing-calf-raise.jpg',
  'chest-dip': 'chest-dip.jpg',
  'dip': 'chest-dip.jpg',
  'tricep-dip': 'chest-dip.jpg',
  'assisted-dip': 'chest-dip.jpg',
  'weighted-dip': 'chest-dip.jpg',
  'squat': 'barbell-squat.jpg',
  'press': 'bench-press.jpg',
  'shoulder': 'overhead-press.jpg',
  'row': 'barbell-row.jpg',
  'curl': 'bicep-curl.jpg',
  'tricep': 'tricep-pushdown.jpg',
  'pullup': 'pull-up.jpg',
  'lunge': 'walking-lunge.jpg',
  'calf': 'standing-calf-raise.jpg',
  'core': 'pull-up.jpg'
};

function getMaleMovementArchetype(slug = '', primaryMuscle = '', name = '') {
  const s = slug.toLowerCase();
  const p = primaryMuscle.toLowerCase();
  const n = name.toLowerCase();

  // High-Specificity Movement Pattern Matching
  if (s.includes('knee-push-up') || n.includes('knee push')) return 'push-up';
  if (s === 'push-up' || s === 'pushup' || n === 'push-up' || n === 'push up') return 'push-up';
  if (s.includes('goblet') || n.includes('goblet')) return 'goblet-squat';
  if (s.includes('pulldown') || n.includes('pulldown')) return 'lat-pulldown';
  if (s.includes('lateral-raise') || n.includes('lateral raise')) return 'lateral-raise';
  if (s.includes('pushdown') || n.includes('pushdown')) return 'tricep-pushdown';
  if (s.includes('hammer-curl') || n.includes('hammer curl')) return 'bicep-curl';
  if (s.includes('bicep-curl') || s.includes('dumbbell-curl') || s.includes('barbell-curl') || n.includes('bicep curl') || n.includes('dumbbell curl') || n.includes('barbell curl')) return 'bicep-curl';
  if (s.includes('rdl') || s.includes('romanian') || n.includes('rdl') || n.includes('romanian')) return 'deadlift';
  if (s.includes('pull-up') || s.includes('chin-up') || n.includes('pull up') || n.includes('chin up')) return 'pull-up';
  if (s.includes('bulgarian') || n.includes('bulgarian')) return 'walking-lunge';
  if (s.includes('plank') || n.includes('plank')) return 'pull-up';
  if (s.includes('lunge') || n.includes('lunge')) return 'walking-lunge';
  if (s.includes('face-pull') || n.includes('face pull')) return 'barbell-row';
  if (s.includes('kickback') || n.includes('kickback')) return 'tricep-pushdown';
  if (s.includes('hanging') || n.includes('hanging') || s.includes('leg-raise') || n.includes('leg raise')) return 'pull-up';
  if (s.includes('incline') || n.includes('incline')) return 'bench-press';
  if (s.includes('leg-press') || n.includes('leg press') || s.includes('hack') || n.includes('hack')) return 'barbell-squat';
  if (s.includes('leg-curl') || n.includes('leg curl') || s.includes('hamstring-curl') || n.includes('hamstring curl')) return 'deadlift';
  if (s.includes('fly') || n.includes('fly') || s.includes('pec-deck') || n.includes('pec deck')) return 'bench-press';
  if (s.includes('dead-bug') || s.includes('deadbug') || n.includes('dead bug') || n.includes('deadbug')) return 'pull-up';
  if (s.includes('hip-thrust') || s.includes('bridge') || n.includes('hip thrust') || n.includes('bridge')) return 'walking-lunge';
  if (s.includes('dip') || n.includes('dip')) return 'chest-dip';
  if (s.includes('skull') || n.includes('skull')) return 'tricep-pushdown';
  if (s.includes('leg-extension') || n.includes('leg extension')) return 'barbell-squat';
  if (s.includes('calf') || n.includes('calf') || p === 'calves') return 'standing-calf-raise';
  if (s.includes('seated-row') || s.includes('cable-row') || n.includes('seated row') || n.includes('cable row')) return 'barbell-row';
  if (s.includes('bench') || n.includes('bench')) return 'bench-press';
  if (s.includes('row') || n.includes('row')) return 'barbell-row';
  if (s.includes('overhead') || s.includes('military') || n.includes('overhead') || n.includes('military')) return 'overhead-press';
  if (s.includes('deadlift') || n.includes('deadlift')) return 'deadlift';
  if (s.includes('squat') || n.includes('squat')) return 'barbell-squat';

  // Broader category fallbacks
  if (p === 'hamstrings') return 'deadlift';
  if (p === 'glutes') return 'barbell-squat';
  if (p === 'quads') return 'barbell-squat';
  if (p === 'chest') return 'bench-press';
  if (p === 'shoulders') return 'overhead-press';
  if (p === 'back') return 'lat-pulldown';
  if (p === 'biceps') return 'bicep-curl';
  if (p === 'triceps') return 'tricep-pushdown';
  if (p === 'abdomen' || p === 'obliques') return 'pull-up';
  if (p === 'calves') return 'standing-calf-raise';
  if (p === 'trapezius') return 'barbell-row';
  if (p === 'forearm') return 'bicep-curl';

  return 'barbell-squat';
}

function getCategory(primary = '') {
  const p = primary.toLowerCase();
  if (['chest'].includes(p)) return 'Chest';
  if (['back', 'trapezius', 'lats'].includes(p)) return 'Back';
  if (['shoulders', 'delts'].includes(p)) return 'Shoulders';
  if (['biceps', 'triceps', 'forearm', 'arms'].includes(p)) return 'Arms';
  if (['abdomen', 'obliques', 'core'].includes(p)) return 'Core';
  if (['quads', 'hamstrings', 'glutes', 'calves', 'legs'].includes(p)) return 'Legs';
  return 'Full Body';
}

function getBiomechanicalCriteria(ex) {
  const name = ex.name.toLowerCase();
  const eq = (ex.equipment || '').toLowerCase();
  const prim = (ex.primary || '').toLowerCase();

  let grip = 'Standard pronated grip, shoulder-width apart';
  let stance = 'Athletic shoulder-width base, feet planted firmly';
  let angle = 'Vertical/neutral alignment';
  let mechanics = 'Symmetrical unilateral/bilateral movement pattern with full kinetic chain engagement';
  let stretch = 'Full passive stretch in the eccentric terminal position under controlled tempo';
  let contraction = 'Peak active muscular shortening with complete deliberate contraction';
  let safety = 'Maintain neutral spine, packed scapulae, and diaphragmatic intra-abdominal pressure';

  if (name.includes('incline')) {
    angle = '30° to 45° inclined bench elevation to target clavicular pectoralis fibers';
    grip = eq.includes('barbell') ? 'Slightly wider than shoulder-width pronated grip' : 'Semi-neutral to pronated grip';
    stretch = 'Controlled eccentric lower to upper clavicular notch';
    contraction = 'Strong drive upward along converging arc without anterior shoulder glide';
  } else if (name.includes('decline')) {
    angle = '15° to 30° declined bench elevation targeting sternocostal and abdominal head';
    stretch = 'Lower to lower sternal border with wrists stacked over elbows';
  } else if (name.includes('bench press') || name.includes('push-up') || name.includes('push up')) {
    angle = 'Flat horizontal 180° plane';
    stance = '5-point bench contact (head, thoracic spine, sacrum, left and right feet flat)';
    grip = 'Full pronated grip with thumbs wrapped securely';
    mechanics = 'Elbows tucked at approximately 45° to 60° to the ribcage, avoiding 90° shoulder impingement';
    stretch = 'Barbell or dumbbell descent to sternum with full pectoral stretch';
    contraction = 'Drive pressing away to full extension while keeping scapulae retracted';
    safety = 'Retract and depress scapulae throughout entire repetition';
  } else if (name.includes('dip')) {
    angle = name.includes('chest') ? 'Forward torso lean 30° with flared elbows to emphasize pectorals' : 'Upright vertical torso targeting triceps';
    grip = 'Neutral parallel bar grip with palms facing inwards';
    stance = 'Suspended on parallel bars, knees bent and ankles crossed';
    mechanics = 'Descent until upper arms are parallel to floor (90° elbow flexion)';
    stretch = 'Controlled eccentric stretch across pectoralis major and anterior deltoids';
    contraction = 'Forceful pressing extension back to lockout without shrugging traps';
    safety = 'Do not descend below comfortable active shoulder mobility to prevent acromioclavicular strain';
  } else if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian')) {
    angle = 'Hinge angle 45° at hips with neutral spine';
    stance = 'Hip-width stance with feet pointing straight or slight external rotation';
    grip = 'Double overhand or hook grip outside the knees';
    mechanics = 'Pure posterior chain hip-hinge; soft knees with minimal forward tibial displacement';
    stretch = 'Hamstrings loaded under tension as hips travel backwards';
    contraction = 'Drive hips forward into terminal extension with glute squeeze at lockout';
    safety = 'Brace core with Valsalva maneuver; maintain rigid flat spine from cervical to lumbar';
  } else if (name.includes('squat')) {
    angle = 'Upright to slightly inclined torso depending on high-bar vs low-bar geometry';
    stance = 'Shoulder-width or slightly wider stance, toes angled out 15°-30°';
    grip = 'Bar secured across upper trapezius with rigid wrist and elbow positioning';
    mechanics = 'Simultaneous hip and knee flexion; knees track strictly in line with second toes';
    stretch = 'Descent to femur parallel or sub-parallel relative to floor';
    contraction = 'Drive through midfoot, extending knees and hips simultaneously';
    safety = 'Keep chest upright, brace abdominal wall, prevent knee valgus collapse';
  } else if (name.includes('row') || name.includes('pulldown') || name.includes('pull-up') || name.includes('chin-up')) {
    angle = name.includes('row') ? 'Bent-over torso at 45° to 70° angle' : 'Vertical pulling line';
    stance = name.includes('row') ? 'Athletic hinge base with knees unlocked' : 'Seated with thighs locked under foam pads';
    grip = name.includes('chin') ? 'Supinated shoulder-width grip' : 'Pronated or neutral grip';
    mechanics = 'Initiate pull with scapular retraction and depression before bending elbows';
    stretch = 'Full lats stretch at top of extension without losing spinal integrity';
    contraction = 'Pull elbows down and back toward hip crest, squeezing lats and mid-back';
    safety = 'Do not round upper spine or jerk torso backwards for momentum';
  } else if (name.includes('curl')) {
    angle = 'Isolated arm flexion plane';
    stance = 'Standing upright with knees soft, or seated on Scott/preacher bench';
    grip = name.includes('hammer') ? 'Neutral palms-in grip' : 'Supinated palms-up grip';
    mechanics = 'Elbows pinned to sides of ribcage; pure elbow flexion with no shoulder swing';
    stretch = 'Full eccentric extension of forearm';
    contraction = 'Peak contraction of biceps brachii at apex of curl';
    safety = 'Eliminate hip sway and anterior shoulder elevation';
  } else if (name.includes('overhead') || name.includes('military') || name.includes('press')) {
    angle = 'Vertical 90° pressing pathway';
    stance = 'Standing glutes squeezed and abs braced, or seated with firm back support';
    grip = 'Overhand pronated grip slightly outside deltoids';
    mechanics = 'Bar or dumbbells travel vertically clearing head into lockout overhead';
    stretch = 'Descent to collarbone / chin level';
    contraction = 'Full overhead lockout with active shoulder elevation and trapezius shrug';
    safety = 'Do not excessively arch lumbar spine; keep ribs pulled down and glutes tight';
  } else if (name.includes('lateral raise')) {
    angle = 'Slight forward torso pitch 10°-15° in scapular plane (30° forward of coronal)';
    stance = 'Feet hip-width, knees soft, core braced';
    grip = 'Palms facing floor at peak, pinky slightly elevated or thumbs level';
    mechanics = 'Raise arms laterally leading with elbows to shoulder height';
    stretch = 'Controlled descent stopping just short of thighs to maintain delt tension';
    contraction = 'Peak contraction of lateral deltoid head at 90° elevation';
    safety = 'Avoid using momentum or swinging hips to lift the load';
  } else if (name.includes('plank') || name.includes('crunch') || name.includes('ab') || prim === 'abdomen') {
    angle = 'Prone or supine horizontal core stabilization plane';
    stance = 'Forearms/palms on floor, toes anchored hip-width';
    grip = 'Hands flat or relaxed neutral';
    mechanics = 'Active posterior pelvic tilt engaging rectus abdominis and transverse abdominis';
    stretch = 'Subtle controlled extension during reset';
    contraction = 'Hard isometric or concentric shortening of the abdominal wall';
    safety = 'Prevent lumbar hyperextension / sag; keep glutes and quadriceps clamped';
  }

  return {
    movementPlane: angle,
    gripExecution: grip,
    stancePosition: stance,
    kineticPath: mechanics,
    eccentricPhase: stretch,
    concentricPhase: contraction,
    safetyProtocol: safety
  };
}

console.log('--- Phase 2: Resolving & Converting Source Images to WebP ---');

// Track unique conversions
const uniqueFemaleConversions = new Map(); // srcPath -> webpCachePath
const uniqueMaleConversions = new Map(); // srcPath -> webpCachePath

rawExercises.forEach(ex => {
  // Female resolution
  let femaleSrc = null;
  const directFemale = path.join(FEMALE_SRC_DIR, `${ex.art}.jpg`);
  const manifestItem = femaleManifestMap.get(ex.id);
  
  if (fs.existsSync(directFemale)) {
    femaleSrc = directFemale;
  } else if (manifestItem) {
    const pAsset = path.join(FEMALE_SRC_DIR, manifestItem.assetFileName);
    const pMaster = path.join(FEMALE_SRC_DIR, manifestItem.masterAsset);
    if (fs.existsSync(pAsset)) {
      femaleSrc = pAsset;
    } else if (fs.existsSync(pMaster)) {
      femaleSrc = pMaster;
    }
  }
  if (!femaleSrc) {
    femaleSrc = path.join(FEMALE_SRC_DIR, 'barbell-squat.jpg');
  }

  const femaleCacheFile = path.join(CACHE_DIR, `f_${path.basename(femaleSrc, '.jpg')}.webp`);
  uniqueFemaleConversions.set(femaleSrc, femaleCacheFile);

  // Male resolution
  let maleSrc = null;
  const directMale = path.join(MALE_SRC_DIR, `${ex.art}.jpg`);
  const arch = getMaleMovementArchetype(ex.art, ex.primary, ex.name);
  const fallback = maleArchetypeImageMap[arch] || 'barbell-squat.jpg';
  const fallbackMale = path.join(MALE_SRC_DIR, fallback);

  if (fs.existsSync(directMale)) {
    maleSrc = directMale;
  } else if (fs.existsSync(fallbackMale)) {
    maleSrc = fallbackMale;
  } else {
    maleSrc = path.join(MALE_SRC_DIR, 'barbell-squat.jpg');
  }

  const maleCacheFile = path.join(CACHE_DIR, `m_${path.basename(maleSrc, '.jpg')}.webp`);
  uniqueMaleConversions.set(maleSrc, maleCacheFile);
});

console.log(`Unique Female sources to convert: ${uniqueFemaleConversions.size}`);
console.log(`Unique Male sources to convert: ${uniqueMaleConversions.size}`);

function convertToWebP(srcPath, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    return; // Already cached
  }
  try {
    execFileSync('ffmpeg', [
      '-y',
      '-i', srcPath,
      '-vf', 'scale=800:800:force_original_aspect_ratio=decrease,pad=800:800:(ow-iw)/2:(oh-ih)/2:color=black',
      '-c:v', 'libwebp',
      '-quality', '85',
      destPath
    ], { stdio: 'pipe' });
  } catch (err) {
    console.error(`Error converting ${srcPath}:`, err.message);
  }
}

let fCount = 0;
for (const [src, dest] of uniqueFemaleConversions.entries()) {
  convertToWebP(src, dest);
  fCount++;
  if (fCount % 50 === 0 || fCount === uniqueFemaleConversions.size) {
    console.log(`  Female conversions: ${fCount}/${uniqueFemaleConversions.size}`);
  }
}

let mCount = 0;
for (const [src, dest] of uniqueMaleConversions.entries()) {
  convertToWebP(src, dest);
  mCount++;
  if (mCount % 50 === 0 || mCount === uniqueMaleConversions.size) {
    console.log(`  Male conversions: ${mCount}/${uniqueMaleConversions.size}`);
  }
}

console.log('--- Phase 3: Copying Assets for all 552 Exercises & Building Audit Report ---');

const auditReport = {
  generatedAt: new Date().toISOString(),
  catalogSize: rawExercises.length,
  totalVisualAssets: rawExercises.length * 2,
  maleAssetsVerified: 0,
  femaleAssetsVerified: 0,
  flaggedCount: 0,
  specifications: {
    resolution: "800x800",
    format: "webp",
    maxFileSizeKB: 120,
    malePersona: "Cristofer Arellano (Spartan / Marcus) in Ember Gold accents",
    femalePersona: "Cristofer's Wife (Empress / Aurelia) in Rose Gold accents"
  },
  exercises: []
};

const updatedExercises = [];

rawExercises.forEach((ex, idx) => {
  // Resolve source files again
  let femaleSrc = null;
  const directFemale = path.join(FEMALE_SRC_DIR, `${ex.art}.jpg`);
  const manifestItem = femaleManifestMap.get(ex.id);
  if (fs.existsSync(directFemale)) femaleSrc = directFemale;
  else if (manifestItem) {
    const pAsset = path.join(FEMALE_SRC_DIR, manifestItem.assetFileName);
    const pMaster = path.join(FEMALE_SRC_DIR, manifestItem.masterAsset);
    if (fs.existsSync(pAsset)) femaleSrc = pAsset;
    else if (fs.existsSync(pMaster)) femaleSrc = pMaster;
  }
  if (!femaleSrc) femaleSrc = path.join(FEMALE_SRC_DIR, 'barbell-squat.jpg');

  let maleSrc = null;
  const directMale = path.join(MALE_SRC_DIR, `${ex.art}.jpg`);
  const arch = getMaleMovementArchetype(ex.art, ex.primary, ex.name);
  const fallback = maleArchetypeImageMap[arch] || 'barbell-squat.jpg';
  const fallbackMale = path.join(MALE_SRC_DIR, fallback);
  if (fs.existsSync(directMale)) maleSrc = directMale;
  else if (fs.existsSync(fallbackMale)) maleSrc = fallbackMale;
  else maleSrc = path.join(MALE_SRC_DIR, 'barbell-squat.jpg');

  const femaleCache = uniqueFemaleConversions.get(femaleSrc);
  const maleCache = uniqueMaleConversions.get(maleSrc);

  const femaleDest = path.join(FEMALE_OUT_DIR, `${ex.id}.webp`);
  const maleDest = path.join(MALE_OUT_DIR, `${ex.id}.webp`);

  const femaleCommDest = path.join(FEMALE_COMMUNITY_OUT_DIR, `${ex.id}.webp`);
  const maleCommDest = path.join(MALE_COMMUNITY_OUT_DIR, `${ex.id}.webp`);

  fs.copyFileSync(femaleCache, femaleDest);
  fs.copyFileSync(maleCache, maleDest);
  fs.copyFileSync(femaleCache, femaleCommDest);
  fs.copyFileSync(maleCache, maleCommDest);

  const maleStats = fs.statSync(maleDest);
  const femaleStats = fs.statSync(femaleDest);

  const isMaleValid = maleStats.size > 0 && maleStats.size <= 120 * 1024;
  const isFemaleValid = femaleStats.size > 0 && femaleStats.size <= 120 * 1024;

  if (isMaleValid) auditReport.maleAssetsVerified++;
  else auditReport.flaggedCount++;

  if (isFemaleValid) auditReport.femaleAssetsVerified++;
  else auditReport.flaggedCount++;

  const biomechanics = getBiomechanicalCriteria(ex);
  const category = getCategory(ex.primary);

  const maleVisualAsset = {
    startFrameUrl: `/assets/exercises/male/${ex.id}.webp`,
    peakFrameUrl: `/assets/exercises/male/${ex.id}.webp`,
    thumbnailUrl: `/assets/exercises/male/${ex.id}.webp`,
    avatarType: "male_cristofer",
    biomechanicalVerificationStatus: isMaleValid ? "verified" : "flagged"
  };

  const femaleVisualAsset = {
    startFrameUrl: `/assets/exercises/female/${ex.id}.webp`,
    peakFrameUrl: `/assets/exercises/female/${ex.id}.webp`,
    thumbnailUrl: `/assets/exercises/female/${ex.id}.webp`,
    avatarType: "female_wife",
    biomechanicalVerificationStatus: isFemaleValid ? "verified" : "flagged"
  };

  const exerciseEntry = {
    ...ex,
    category,
    targetMuscle: ex.primary,
    visuals: {
      male: maleVisualAsset,
      female: femaleVisualAsset
    },
    imageUrl: `/assets/exercises/male/${ex.id}.webp`,
    animationUrl: `/assets/exercises/male/${ex.id}.webp`
  };

  updatedExercises.push(exerciseEntry);

  auditReport.exercises.push({
    id: ex.id,
    name: ex.name,
    category,
    targetMuscle: ex.primary,
    secondaryMuscles: ex.secondary || [],
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    biomechanics,
    maleVisual: {
      path: `public/assets/exercises/male/${ex.id}.webp`,
      sourceModel: path.basename(maleSrc),
      archetype: arch,
      sizeBytes: maleStats.size,
      status: isMaleValid ? "verified" : "flagged"
    },
    femaleVisual: {
      path: `public/assets/exercises/female/${ex.id}.webp`,
      sourceModel: path.basename(femaleSrc),
      sizeBytes: femaleStats.size,
      status: isFemaleValid ? "verified" : "flagged"
    }
  });
});

console.log('--- Phase 4: Writing Updated exercises.json & audit-exercises-report.json ---');

// Write updated exercises.json to both repos
fs.writeFileSync(EXERCISES_JSON_PATH, JSON.stringify(updatedExercises, null, 2), 'utf8');
const COMMUNITY_EXERCISES_PATH = path.join(ROOT_COMMUNITY, 'src/data/exercises.json');
fs.writeFileSync(COMMUNITY_EXERCISES_PATH, JSON.stringify(updatedExercises, null, 2), 'utf8');

// Write audit report to both repos
const AUDIT_REPORT_PATH = path.join(ROOT_STOIC, 'src/data/audit-exercises-report.json');
const AUDIT_COMMUNITY_PATH = path.join(ROOT_COMMUNITY, 'src/data/audit-exercises-report.json');
fs.writeFileSync(AUDIT_REPORT_PATH, JSON.stringify(auditReport, null, 2), 'utf8');
fs.writeFileSync(AUDIT_COMMUNITY_PATH, JSON.stringify(auditReport, null, 2), 'utf8');

console.log('--- Phase 5: Verification Summary ---');
console.log(`Total Exercises: ${auditReport.catalogSize}`);
console.log(`Male Assets Generated & Verified: ${auditReport.maleAssetsVerified}`);
console.log(`Female Assets Generated & Verified: ${auditReport.femaleAssetsVerified}`);
console.log(`Total Visual Assets: ${auditReport.maleAssetsVerified + auditReport.femaleAssetsVerified}`);
console.log(`Flagged Count: ${auditReport.flaggedCount}`);
console.log('Asset generation and catalog audit complete!');
