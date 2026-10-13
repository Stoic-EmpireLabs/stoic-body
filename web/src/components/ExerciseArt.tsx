import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assets';
import { useGymStore } from '../store/useGymStore';
import { FemaleExerciseSVG } from './FemaleExerciseVisuals';
import { MaleExerciseSVG } from './MaleExerciseVisuals';
import allExercisesData from '../data/exercises.json';
import type { ExerciseVisualAsset } from '../types';

export interface ExerciseArtProps {
  slug?: string;
  exerciseId?: string;
  genderOverride?: 'male' | 'female';
  className?: string;
  height?: number | string;
  loop?: boolean;
  exerciseName?: string;
  primaryMuscle?: string;
  visuals?: {
    male: ExerciseVisualAsset;
    female: ExerciseVisualAsset;
  };
}

const exerciseMapById = new Map<string, any>();
const exerciseMapByArt = new Map<string, any>();
const exerciseMapByName = new Map<string, any>();

allExercisesData.forEach((e: any) => {
  if (e.id) exerciseMapById.set(e.id, e);
  if (e.art) exerciseMapByArt.set(e.art, e);
  if (e.name) exerciseMapByName.set(e.name.toLowerCase(), e);
});

export const ExerciseArt: React.FC<ExerciseArtProps> = ({
  slug,
  exerciseId,
  genderOverride,
  className = '',
  height = 200,
  exerciseName,
  primaryMuscle,
  visuals,
}) => {
  const { profile, settings, coachPersonality } = useGymStore();

  const isFemaleDefault =
    profile?.gender === 'female' ||
    settings?.gender === 'female' ||
    coachPersonality === 'aurelia';

  const activeGender = genderOverride || (isFemaleDefault ? 'female' : 'male');
  const [imgFailed, setImgFailed] = useState(false);

  // Find exercise definition
  const ex =
    (exerciseId ? exerciseMapById.get(exerciseId) : null) ||
    (slug ? exerciseMapById.get(slug) || exerciseMapByArt.get(slug) : null) ||
    (exerciseName ? exerciseMapByName.get(exerciseName.toLowerCase()) : null);

  const matchedId = ex?.id || exerciseId || slug;
  const directVisualUrl = matchedId
    ? getAssetUrl(`assets/exercises/${activeGender}/${matchedId}.webp`)
    : null;

  const accentColor = activeGender === 'female' ? '#E0A899' : '#D9A184';

  return (
    <div
      style={{ height }}
      className={`w-full bg-[#141214] rounded-2xl flex items-center justify-center border border-[#262024] overflow-hidden relative p-0 group ${className}`}
    >
      {!imgFailed && directVisualUrl ? (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#0d0b0d]">
          <img
            key={`${activeGender}-${matchedId}`}
            src={directVisualUrl}
            alt={exerciseName || ex?.name || 'Exercise visual'}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Subtle cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </div>
      ) : activeGender === 'female' ? (
        <FemaleExerciseSVG
          slug={slug || matchedId}
          accentColor={accentColor}
          exerciseName={exerciseName || ex?.name}
          primaryMuscle={primaryMuscle || ex?.primary}
        />
      ) : (
        <MaleExerciseSVG
          slug={slug || matchedId}
          accentColor={accentColor}
          exerciseName={exerciseName || ex?.name}
          primaryMuscle={primaryMuscle || ex?.primary}
        />
      )}
    </div>
  );
};
