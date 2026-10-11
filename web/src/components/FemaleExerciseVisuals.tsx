import React, { useState } from 'react';
import allExercisesData from '../data/exercises.json';
import { getAssetUrl } from '../utils/assets';

interface FemaleArtProps {
  slug?: string;
  className?: string;
  accentColor?: string;
  exerciseName?: string;
  primaryMuscle?: string;
}

// Map slug to exercise definition if not provided
const exerciseLookup = new Map<string, { primary: string; name: string }>();
allExercisesData.forEach((e: any) => {
  if (e.art) {
    exerciseLookup.set(e.art, { primary: e.primary || '', name: e.name || '' });
  }
  if (e.id) {
    exerciseLookup.set(e.id, { primary: e.primary || '', name: e.name || '' });
  }
});

export function getMovementArchetype(slug: string = '', primaryMuscle?: string, name?: string): string {
  const s = slug.toLowerCase();
  const found = exerciseLookup.get(slug);
  const p = (primaryMuscle || found?.primary || '').toLowerCase();
  const n = (name || found?.name || '').toLowerCase();

  // 1. Deadlifts & Hamstring Hinges (Highest priority: RDLs, good-mornings, stiff-leg)
  if (
    s.includes('deadlift') ||
    s.includes('rdl') ||
    s.includes('good-morning') ||
    s.includes('leg-curl') ||
    n.includes('deadlift') ||
    n.includes('rdl') ||
    p === 'hamstrings'
  ) {
    return 'deadlift';
  }

  // 2. Lunges, Split Squats, Step-Ups
  if (
    s.includes('lunge') ||
    s.includes('split-squat') ||
    s.includes('step-up') ||
    s.includes('curtsy') ||
    n.includes('lunge') ||
    n.includes('split squat') ||
    n.includes('step up')
  ) {
    return 'lunge';
  }

  // 3. Glutes & Hip Thrust / Abductors
  if (
    s.includes('hip-thrust') ||
    s.includes('glute') ||
    s.includes('kickback') ||
    s.includes('bridge') ||
    s.includes('abductor') ||
    s.includes('frog') ||
    n.includes('thrust') ||
    n.includes('kickback') ||
    p === 'glutes'
  ) {
    return 'hip-thrust';
  }

  // 4. Squats & Quad Hypertrophy
  if (
    s.includes('squat') ||
    s.includes('leg-press') ||
    s.includes('hack') ||
    s.includes('wall-sit') ||
    n.includes('squat') ||
    p === 'quads'
  ) {
    return 'squat';
  }

  // Chest, Bench & Push-Ups
  if (
    s.includes('bench') ||
    s.includes('push-up') ||
    s.includes('chest') ||
    s.includes('fly') ||
    s.includes('crossover') ||
    s.includes('dip') ||
    p === 'chest'
  ) {
    return 'press';
  }

  // Shoulders & Overhead Presses
  if (
    s.includes('shoulder') ||
    s.includes('overhead') ||
    s.includes('lateral-raise') ||
    s.includes('military') ||
    s.includes('arnold') ||
    s.includes('front-raise') ||
    p === 'shoulders'
  ) {
    return 'shoulder';
  }

  // Pull-ups & Lat Pulldowns
  if (
    s.includes('pull-up') ||
    s.includes('lat-pulldown') ||
    s.includes('chin-up') ||
    (p === 'back' && (s.includes('pull') || s.includes('lat')))
  ) {
    return 'pullup';
  }

  // Rows & Upper Back
  if (
    s.includes('row') ||
    s.includes('face-pull') ||
    s.includes('rear-delt') ||
    p === 'back'
  ) {
    return 'row';
  }

  // Bicep Curls
  if (s.includes('curl') || s.includes('bicep') || p === 'biceps') {
    return 'curl';
  }

  // Triceps
  if (
    s.includes('tricep') ||
    s.includes('pushdown') ||
    s.includes('skullcrusher') ||
    s.includes('extension') ||
    p === 'triceps'
  ) {
    return 'tricep';
  }

  // Core & Abdominals
  if (
    s.includes('plank') ||
    s.includes('crunch') ||
    s.includes('ab') ||
    s.includes('core') ||
    s.includes('deadbug') ||
    s.includes('hollow') ||
    s.includes('twist') ||
    s.includes('sit-up') ||
    p === 'abdomen' ||
    p === 'obliques'
  ) {
    return 'core';
  }

  // Calves
  if (p === 'calves' || s.includes('calf')) {
    return 'calf';
  }

  // Traps & Shrugs
  if (p === 'trapezius' || s.includes('shrug')) {
    return 'trap';
  }

  // Forearms
  if (p === 'forearm' || s.includes('wrist')) {
    return 'forearm';
  }

  return 'squat';
}

export const archetypeImageMap: Record<string, string> = {
  'squat': 'squat.jpg',
  'hip-thrust': 'hip-thrust.jpg',
  'press': 'press.jpg',
  'deadlift': 'deadlift.jpg',
  'lunge': 'lunge.jpg',
  'shoulder': 'shoulder.jpg',
  'pullup': 'pullup.jpg',
  'row': 'row.jpg',
  'curl': 'curl.jpg',
  'tricep': 'tricep.jpg',
  'core': 'core.jpg',
  'calf': 'calf.jpg',
  'trap': 'row.jpg',
  'forearm': 'curl.jpg',
  'cardio': 'lunge.jpg',
};

export const archetypePositionMap: Record<string, string> = {
  'shoulder': 'center 15%',
  'tricep': 'center 20%',
  'calf': 'center 80%',
  'deadlift': 'center 35%',
  'row': 'center 25%',
  'lunge': 'center 62%',
  'squat': 'center center',
  'hip-thrust': 'center center',
  'press': 'center center',
  'pullup': 'center center',
  'curl': 'center center',
  'core': 'center center',
};

export const FemaleExerciseSVG: React.FC<FemaleArtProps> = ({
  slug = '',
  className = '',
  accentColor = '#E0A899',
  exerciseName,
  primaryMuscle,
}) => {
  const archetype = getMovementArchetype(slug, primaryMuscle, exerciseName);
  const [imgError, setImgError] = useState(false);
  const imageFileName = archetypeImageMap[archetype] || 'squat.jpg';
  const imageUrl = getAssetUrl(`assets/female-3d/${imageFileName}`);
  const focalPosition = archetypePositionMap[archetype] || 'center center';

  if (!imgError) {
    return (
      <div className={`w-full h-full relative overflow-hidden flex items-center justify-center bg-[#0d0b0d] group ${className}`}>
        <img
          src={imageUrl}
          alt={exerciseName || archetype}
          onError={() => setImgError(true)}
          style={{ objectPosition: focalPosition }}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Subtle obsidian cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center relative select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-h-[300px] transition-transform duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="femaleSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7D8CE" />
            <stop offset="100%" stopColor="#DCA896" />
          </linearGradient>
          <linearGradient id="femaleAthleticWear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2429" />
            <stop offset="100%" stopColor="#181418" />
          </linearGradient>
          <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Halo Ring */}
        <circle cx="200" cy="200" r="140" fill="url(#accentGlow)" />
        <circle cx="200" cy="200" r="160" stroke={accentColor} strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />

        {/* ========================================================
            1. SQUAT (Deep Parallel Squat with Barbell)
        ======================================================== */}
        {archetype === 'squat' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="350" rx="90" ry="12" fill="#0D0C0C" opacity="0.6" />
            {/* Barbell Across Traps */}
            <line x1="80" y1="135" x2="320" y2="135" stroke="#A39E98" strokeWidth="6" strokeLinecap="round" />
            <rect x="70" y="115" width="16" height="40" rx="3" fill={accentColor} />
            <rect x="314" y="115" width="16" height="40" rx="3" fill={accentColor} />

            {/* Female Head & Ponytail */}
            <circle cx="190" cy="115" r="18" fill="url(#femaleSkin)" />
            <path d="M 180 110 Q 150 115 140 145 Q 155 138 175 125 Z" fill="#3D2B1F" />
            <path d="M 175 105 Q 190 95 205 105 Q 200 125 180 125 Z" fill="#3D2B1F" />

            {/* Torso & Sports Bra with contoured waist */}
            <path d="M 185 130 Q 170 180 160 215 L 195 220 Q 205 175 198 130 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 188 135 L 175 170 L 202 170 L 196 135 Z" fill={accentColor} opacity="0.25" />

            {/* Toned Glutes & High-Waist Athletic Leggings */}
            <path d="M 160 215 Q 140 240 145 260 Q 170 270 210 245 L 195 220 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />

            {/* Loaded Parallel Thighs */}
            <path d="M 145 255 Q 210 265 240 260 L 235 295 Q 175 300 140 270 Z" fill="#282228" stroke={accentColor} strokeWidth="1.5" />

            {/* Lower Legs & Cross-training Sneaker */}
            <path d="M 240 260 L 225 335 L 205 335 L 225 285 Z" fill="#1F1B1F" />
            <path d="M 200 335 L 245 335 Q 250 345 235 348 L 195 348 Z" fill="#EAE5E0" />
            <path d="M 195 135 Q 175 145 165 135" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* ========================================================
            2. HIP THRUST / GLUTE BRIDGE
        ======================================================== */}
        {archetype === 'hip-thrust' && (
          <g filter="url(#glow)">
            {/* Padded Thrust Bench */}
            <rect x="80" y="210" width="70" height="90" rx="8" fill="#1E1C1A" stroke="#3E3832" strokeWidth="2" />
            <line x1="85" y1="210" x2="85" y2="340" stroke="#332E29" strokeWidth="4" />
            <line x1="145" y1="210" x2="145" y2="340" stroke="#332E29" strokeWidth="4" />

            {/* Barbell across pelvis */}
            <line x1="180" y1="130" x2="280" y2="230" stroke="#9E9893" strokeWidth="8" strokeLinecap="round" />
            <circle cx="230" cy="180" r="14" fill={accentColor} />

            {/* Female Head & Ponytail over bench */}
            <circle cx="120" cy="195" r="17" fill="url(#femaleSkin)" />
            <path d="M 108 190 Q 90 205 85 235 Q 100 220 115 205 Z" fill="#3D2B1F" />

            {/* Torso Bridge in extension */}
            <path d="M 130 205 Q 175 200 215 190 L 225 215 Q 175 225 135 220 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />

            {/* Glute Lockout & Pelvic Peak */}
            <path d="M 215 190 Q 245 180 260 210 Q 240 240 220 220 Z" fill="#302630" stroke={accentColor} strokeWidth="2" />

            {/* 90-degree Knees & Shins */}
            <path d="M 260 205 L 305 255 L 285 270 L 245 225 Z" fill="#201C20" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 305 255 L 305 335 L 285 335 L 285 270 Z" fill="#1C181C" />
            <path d="M 280 335 L 320 335 Q 325 345 310 348 L 275 348 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            3. BENCH PRESS & PUSH-UPS
        ======================================================== */}
        {archetype === 'press' && (
          <g filter="url(#glow)">
            {/* Flat Gym Bench */}
            <rect x="70" y="240" width="220" height="20" rx="4" fill="#221F22" stroke="#3A333A" strokeWidth="2" />
            <line x1="100" y1="260" x2="100" y2="345" stroke="#332E33" strokeWidth="6" />
            <line x1="260" y1="260" x2="260" y2="345" stroke="#332E33" strokeWidth="6" />

            {/* Barbell Pressed Overhead */}
            <line x1="90" y1="110" x2="270" y2="110" stroke="#9E9893" strokeWidth="6" strokeLinecap="round" />
            <rect x="80" y="95" width="14" height="30" rx="3" fill={accentColor} />
            <rect x="266" y="95" width="14" height="30" rx="3" fill={accentColor} />

            {/* Female Head & Ponytail Resting on Bench */}
            <circle cx="110" cy="225" r="16" fill="url(#femaleSkin)" />
            <path d="M 100 225 Q 75 228 65 245 Q 85 242 105 235 Z" fill="#3D2B1F" />

            {/* Arched Athletic Torso with Sports Bra */}
            <path d="M 125 232 Q 170 215 210 235 L 210 248 L 125 248 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 140 223 L 185 223 L 180 238 L 145 238 Z" fill={accentColor} opacity="0.3" />

            {/* Vertical Press Arms */}
            <path d="M 150 225 L 140 165 L 145 110" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 185 225 L 195 165 L 190 110" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />

            {/* Hips & Legs Planted on Floor */}
            <path d="M 210 235 Q 240 235 255 260 L 250 335 L 235 335 L 235 270 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 230 335 L 265 335 Q 270 345 255 348 L 225 348 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            4. DEADLIFT / ROMANIAN HINGE
        ======================================================== */}
        {archetype === 'deadlift' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="350" rx="90" ry="12" fill="#0D0C0C" opacity="0.6" />
            {/* Barbell below knees */}
            <line x1="120" y1="260" x2="310" y2="260" stroke="#9E9893" strokeWidth="6" strokeLinecap="round" />
            <circle cx="120" cy="260" r="24" fill="#2C2825" stroke={accentColor} strokeWidth="2" />
            <circle cx="310" cy="260" r="24" fill="#2C2825" stroke={accentColor} strokeWidth="2" />

            {/* Head & Ponytail */}
            <circle cx="160" cy="145" r="17" fill="url(#femaleSkin)" />
            <path d="M 148 140 Q 120 135 110 160 Q 130 155 150 152 Z" fill="#3D2B1F" />

            {/* Neutral Spine Torso at 45-degree hinge */}
            <path d="M 172 155 L 245 205 L 230 230 L 160 175 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />

            {/* Pelvis & Loaded Glutes */}
            <path d="M 245 205 Q 280 215 275 245 Q 245 265 225 240 Z" fill="#302630" stroke={accentColor} strokeWidth="2" />

            {/* Hamstrings loaded */}
            <path d="M 270 240 L 245 295 L 225 290 L 235 240 Z" fill="#201C20" stroke={accentColor} strokeWidth="1.5" />

            {/* Vertical Shins to Ground */}
            <path d="M 245 295 L 235 340 L 215 340 L 225 290 Z" fill="#1C181C" />
            <path d="M 210 340 L 250 340 Q 255 348 240 350 L 205 350 Z" fill="#EAE5E0" />
            <line x1="175" y1="170" x2="215" y2="260" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* ========================================================
            5. LUNGES / BULGARIAN SPLIT SQUAT
        ======================================================== */}
        {archetype === 'lunge' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="350" rx="90" ry="12" fill="#0D0C0C" opacity="0.6" />

            {/* Head & Ponytail */}
            <circle cx="180" cy="110" r="18" fill="url(#femaleSkin)" />
            <path d="M 170 105 Q 140 105 130 130 Q 150 125 168 115 Z" fill="#3D2B1F" />
            <path d="M 165 100 Q 180 90 195 100 Q 190 120 175 120 Z" fill="#3D2B1F" />

            {/* Upright Athletic Torso & Sports Bra */}
            <path d="M 175 128 L 165 185 L 195 190 L 190 128 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 175 135 L 188 135 L 185 165 L 170 165 Z" fill={accentColor} opacity="0.25" />

            {/* Arms holding Dumbbells at Sides */}
            <line x1="170" y1="135" x2="160" y2="210" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
            <rect x="152" y="205" width="16" height="24" rx="4" fill={accentColor} />

            {/* Front Leg at 90-degree Angle */}
            <path d="M 180 190 L 235 220 L 235 285 L 215 285 L 215 235 L 170 205 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 210 285 L 245 285 Q 250 295 235 298 L 205 298 Z" fill="#EAE5E0" />

            {/* Rear Leg Dropping Down in Lunge */}
            <path d="M 170 205 L 125 255 L 120 325 L 105 325 L 110 255 Z" fill="#262026" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 98 320 L 122 325 Q 124 332 112 334 L 95 330 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            6. SHOULDERS / LATERAL RAISE / OVERHEAD PRESS
        ======================================================== */}
        {archetype === 'shoulder' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="355" rx="70" ry="10" fill="#0D0C0C" opacity="0.6" />

            {/* Head & High Ponytail */}
            <circle cx="200" cy="95" r="18" fill="url(#femaleSkin)" />
            <path d="M 195 78 Q 200 55 215 60 Q 210 75 205 82 Z" fill="#3D2B1F" />
            <path d="M 188 88 Q 200 78 212 88 Q 208 105 192 105 Z" fill="#3D2B1F" />

            {/* Toned Deltoids & Arms in Lateral Fly */}
            <path d="M 200 115 L 140 135 L 90 145" stroke="url(#femaleSkin)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 200 115 L 260 135 L 310 145" stroke="url(#femaleSkin)" strokeWidth="8" strokeLinecap="round" />
            <rect x="75" y="132" width="16" height="26" rx="4" fill={accentColor} />
            <rect x="309" y="132" width="16" height="26" rx="4" fill={accentColor} />

            {/* Tapered Waist & Sports Bra */}
            <path d="M 180 120 L 175 165 Q 200 170 225 165 L 220 120 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 175 165 L 180 200 Q 200 203 220 200 L 225 165 Z" fill="url(#femaleSkin)" />

            {/* High-Waisted Athletic Leggings & Toned Hips */}
            <path d="M 180 200 Q 165 240 185 285 L 200 285 L 200 215 L 200 285 L 215 285 Q 235 240 220 200 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 185 285 L 185 345 L 170 345 L 175 285 Z" fill="#242024" />
            <path d="M 215 285 L 215 345 L 230 345 L 225 285 Z" fill="#242024" />
            <path d="M 165 345 L 190 345 Q 192 352 180 354 L 162 354 Z" fill="#EAE5E0" />
            <path d="M 210 345 L 235 345 Q 238 352 225 354 L 208 354 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            7. PULL-UP / LAT PULLDOWN
        ======================================================== */}
        {archetype === 'pullup' && (
          <g filter="url(#glow)">
            <line x1="60" y1="70" x2="340" y2="70" stroke="#7A7570" strokeWidth="6" strokeLinecap="round" />
            <circle cx="110" cy="70" r="6" fill="url(#femaleSkin)" />
            <circle cx="290" cy="70" r="6" fill="url(#femaleSkin)" />

            {/* Arms Pulling Body Up */}
            <path d="M 110 70 L 150 120 L 175 140" stroke="url(#femaleSkin)" strokeWidth="7" strokeLinecap="round" />
            <path d="M 290 70 L 250 120 L 225 140" stroke="url(#femaleSkin)" strokeWidth="7" strokeLinecap="round" />

            {/* Head & Ponytail */}
            <circle cx="200" cy="115" r="17" fill="url(#femaleSkin)" />
            <path d="M 194 110 Q 170 125 160 160 Q 185 145 198 125 Z" fill="#3D2B1F" />

            {/* Back V-Taper (Sculpted Lats & Racerback Bra) */}
            <path d="M 170 140 Q 200 145 230 140 L 215 195 Q 200 198 185 195 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 190 142 L 200 160 L 210 142 Z" fill="url(#femaleSkin)" />

            {/* Tapered Waist to Glutes */}
            <path d="M 185 195 Q 165 235 180 270 Q 200 280 220 270 Q 235 235 215 195 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 180 270 L 195 330 L 205 330 L 220 270 Z" fill="#242024" />
          </g>
        )}

        {/* ========================================================
            8. ROWS & UPPER BACK
        ======================================================== */}
        {archetype === 'row' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="350" rx="80" ry="12" fill="#0D0C0C" opacity="0.6" />

            {/* Head & Ponytail at 45 degree angle */}
            <circle cx="150" cy="135" r="17" fill="url(#femaleSkin)" />
            <path d="M 140 130 Q 115 130 105 155 Q 125 150 142 142 Z" fill="#3D2B1F" />

            {/* Neutral Spine Torso */}
            <path d="M 160 145 L 235 195 L 220 220 L 150 165 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />

            {/* Elbow Driven Back in Row */}
            <path d="M 165 155 L 180 215 L 195 180" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
            <rect x="188" y="168" width="18" height="24" rx="4" fill={accentColor} />

            {/* Loaded Glutes & Hamstrings */}
            <path d="M 235 195 Q 270 205 265 235 Q 235 255 215 230 Z" fill="#302630" stroke={accentColor} strokeWidth="2" />
            <path d="M 260 230 L 235 295 L 215 290 L 225 230 Z" fill="#201C20" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 235 295 L 225 340 L 205 340 L 215 290 Z" fill="#1C181C" />
            <path d="M 200 340 L 240 340 Q 245 348 230 350 L 195 350 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            9. BICEP CURLS
        ======================================================== */}
        {archetype === 'curl' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="355" rx="70" ry="10" fill="#0D0C0C" opacity="0.6" />

            {/* Head & Ponytail */}
            <circle cx="190" cy="95" r="18" fill="url(#femaleSkin)" />
            <path d="M 180 90 Q 150 95 135 120 Q 155 115 175 105 Z" fill="#3D2B1F" />
            <path d="M 180 85 Q 195 75 205 85 Q 200 105 185 105 Z" fill="#3D2B1F" />

            {/* Upright Athletic Torso */}
            <path d="M 185 115 L 175 170 L 205 170 L 198 115 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />

            {/* Bicep Curl Contraction */}
            <path d="M 180 125 L 175 180 L 160 140" stroke="url(#femaleSkin)" strokeWidth="7" strokeLinecap="round" />
            <rect x="148" y="128" width="22" height="16" rx="4" fill={accentColor} />

            {/* Other Arm at Side */}
            <path d="M 198 125 L 205 175 L 200 195" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
            <rect x="192" y="195" width="16" height="18" rx="3" fill={accentColor} />

            {/* Athletic Leggings & Shoes */}
            <path d="M 175 170 Q 160 215 175 280 L 190 280 L 190 190 L 205 280 Q 220 215 205 170 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 175 280 L 175 345 L 160 345 L 165 280 Z" fill="#242024" />
            <path d="M 205 280 L 205 345 L 220 345 L 215 280 Z" fill="#242024" />
            <path d="M 155 345 L 180 345 Q 182 352 170 354 L 152 354 Z" fill="#EAE5E0" />
            <path d="M 200 345 L 225 345 Q 228 352 215 354 L 198 354 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            10. TRICEPS / DIP / PUSHDOWN
        ======================================================== */}
        {archetype === 'tricep' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="355" rx="70" ry="10" fill="#0D0C0C" opacity="0.6" />

            {/* Head & Ponytail */}
            <circle cx="180" cy="95" r="18" fill="url(#femaleSkin)" />
            <path d="M 170 90 Q 140 95 130 120 Q 150 115 165 105 Z" fill="#3D2B1F" />

            {/* Athletic Torso with slight forward lean */}
            <path d="M 175 115 L 165 175 L 195 180 L 188 115 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />

            {/* Tricep Extension (Elbow pinned, forearm extending down) */}
            <path d="M 175 125 L 165 165 L 160 220" stroke="url(#femaleSkin)" strokeWidth="7" strokeLinecap="round" />
            <rect x="150" y="215" width="20" height="12" rx="3" fill={accentColor} />

            {/* High-Waisted Leggings */}
            <path d="M 165 175 Q 150 220 165 285 L 180 285 L 185 195 L 195 285 Q 210 220 195 180 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 165 285 L 165 345 L 150 345 L 155 285 Z" fill="#242024" />
            <path d="M 195 285 L 195 345 L 210 345 L 205 285 Z" fill="#242024" />
            <path d="M 145 345 L 170 345 Q 172 352 160 354 L 142 354 Z" fill="#EAE5E0" />
            <path d="M 190 345 L 215 345 Q 218 352 205 354 L 188 354 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            11. CORE & PLANK
        ======================================================== */}
        {archetype === 'core' && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="275" rx="140" ry="10" fill="#0D0C0C" opacity="0.6" />

            {/* Forearm on mat */}
            <line x1="120" y1="260" x2="160" y2="260" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="260" x2="135" y2="215" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />

            {/* Head looking down with ponytail draped */}
            <circle cx="115" cy="195" r="16" fill="url(#femaleSkin)" />
            <path d="M 105 190 Q 85 200 80 225 Q 100 215 110 205 Z" fill="#3D2B1F" />

            {/* Clean Horizontal Plank Line */}
            <path d="M 135 215 L 280 235 L 275 255 L 140 240 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 280 235 L 340 255 L 335 265 L 275 255 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 335 255 L 350 265 L 330 268 Z" fill="#EAE5E0" />
          </g>
        )}

        {/* ========================================================
            12. CALF RAISE / TRAP / FOREARM / CARDIO
        ======================================================== */}
        {(archetype === 'calf' || archetype === 'trap' || archetype === 'forearm' || archetype === 'cardio') && (
          <g filter="url(#glow)">
            <ellipse cx="200" cy="350" rx="80" ry="10" fill="#0D0C0C" opacity="0.6" />

            {/* Head & Ponytail */}
            <circle cx="190" cy="100" r="18" fill="url(#femaleSkin)" />
            <path d="M 180 95 Q 150 100 135 125 Q 155 120 175 110 Z" fill="#3D2B1F" />
            <path d="M 180 90 Q 195 80 205 90 Q 200 110 185 110 Z" fill="#3D2B1F" />

            {/* Toned Athletic Figure Stride */}
            <path d="M 185 118 Q 170 155 165 190 L 195 195 Q 205 155 198 118 Z" fill="#242024" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 165 190 Q 145 225 150 255 Q 185 265 210 240 L 195 195 Z" fill="#1C181C" stroke={accentColor} strokeWidth="1.5" />

            {/* High Calf Extension & Athletic Stride */}
            <path d="M 150 255 L 120 330 L 138 335 L 180 270 Z" fill="#201C20" stroke={accentColor} strokeWidth="1.5" />
            <path d="M 195 245 L 245 315 L 235 330 L 175 265 Z" fill="#282228" stroke={accentColor} strokeWidth="1.5" />

            {/* Sneakers */}
            <path d="M 115 330 L 140 335 Q 142 342 130 344 L 110 340 Z" fill="#EAE5E0" />
            <path d="M 235 325 L 260 335 Q 262 342 250 344 L 230 335 Z" fill="#EAE5E0" />

            {/* Dynamic Arm Drive */}
            <path d="M 190 125 L 225 155 L 215 185" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 180 125 L 155 155 L 165 180" stroke="url(#femaleSkin)" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
