import React, { useState } from 'react';
import allExercisesData from '../data/exercises.json';
import { getAssetUrl } from '../utils/assets';

interface MaleArtProps {
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

export function getMaleMovementArchetype(slug: string = '', primaryMuscle?: string, name?: string): string {
  const s = slug.toLowerCase();
  const found = exerciseLookup.get(slug);
  const p = (primaryMuscle || found?.primary || '').toLowerCase();
  const n = (name || found?.name || '').toLowerCase();

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

export const maleArchetypeImageMap: Record<string, string> = {
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
  // Legacy aliases
  'squat': 'barbell-squat.jpg',
  'press': 'bench-press.jpg',
  'shoulder': 'overhead-press.jpg',
  'row': 'barbell-row.jpg',
  'curl': 'bicep-curl.jpg',
  'tricep': 'tricep-pushdown.jpg',
  'pullup': 'pull-up.jpg',
  'lunge': 'walking-lunge.jpg',
  'calf': 'standing-calf-raise.jpg',
  'core': 'pull-up.jpg',
};

export const maleArchetypePositionMap: Record<string, string> = {
  'chest-dip': 'center center',
  'dip': 'center center',
  'overhead-press': 'center 15%',
  'shoulder': 'center 15%',
  'lat-pulldown': 'center 20%',
  'pull-up': 'center 20%',
  'lateral-raise': 'center 20%',
  'standing-calf-raise': 'center 80%',
  'calf': 'center 80%',
  'deadlift': 'center 35%',
  'barbell-row': 'center 25%',
  'row': 'center 25%',
  'walking-lunge': 'center 62%',
  'lunge': 'center 62%',
  'barbell-squat': 'center center',
  'squat': 'center center',
  'bench-press': 'center center',
  'press': 'center center',
  'bicep-curl': 'center center',
  'curl': 'center center',
  'tricep-pushdown': 'center center',
  'tricep': 'center center',
};

export const MaleExerciseSVG: React.FC<MaleArtProps> = ({
  slug = '',
  className = '',
  accentColor = '#D9A184',
  exerciseName,
  primaryMuscle,
}) => {
  const archetype = getMaleMovementArchetype(slug, primaryMuscle, exerciseName);
  const [useFallback, setUseFallback] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackFileName = maleArchetypeImageMap[archetype] || 'barbell-squat.jpg';
  const targetFileName = !useFallback && slug ? `${slug}.jpg` : fallbackFileName;
  const imageUrl = getAssetUrl(`assets/male-3d/${targetFileName}`);
  const focalPosition = maleArchetypePositionMap[archetype] || 'center center';

  const handleImageError = () => {
    if (!useFallback && slug) {
      setUseFallback(true);
    } else {
      setImgError(true);
    }
  };

  if (!imgError) {
    return (
      <div className={`w-full h-full relative overflow-hidden flex items-center justify-center bg-[#0d0b0d] group ${className}`}>
        <img
          src={imageUrl}
          alt={exerciseName || archetype}
          onError={handleImageError}
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
    <div className={`w-full h-full flex flex-col items-center justify-center relative select-none bg-[#121110] ${className}`}>
      <span className="text-xs font-mono text-[#D9A184] uppercase font-bold tracking-wider">
        {exerciseName || archetype}
      </span>
    </div>
  );
};
