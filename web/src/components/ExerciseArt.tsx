import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { useGymStore } from '../store/useGymStore';
import { FemaleExerciseSVG } from './FemaleExerciseVisuals';

interface ExerciseArtProps {
  slug?: string;
  className?: string;
  height?: number | string;
  loop?: boolean;
  exerciseName?: string;
  primaryMuscle?: string;
}

const artCache = new Map<string, string[]>();

export const ExerciseArt: React.FC<ExerciseArtProps> = ({
  slug,
  className = '',
  height = 200,
  loop = true,
  exerciseName,
  primaryMuscle,
}) => {
  const { profile, settings, coachPersonality } = useGymStore();

  // Strict athlete gender resolution - no toggles, no overlapping pills
  const isFemale =
    profile?.gender === 'female' ||
    settings?.gender === 'female' ||
    coachPersonality === 'aurelia';

  const [frames, setFrames] = useState<string[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load male wireframe frames only if male mode is active
  useEffect(() => {
    if (!slug || isFemale) {
      return;
    }

    if (artCache.has(slug)) {
      setFrames(artCache.get(slug)!);
      setFrameIndex(0);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(getAssetUrl(`assets/art/${slug}.txt`))
      .then((res) => {
        if (!res.ok) throw new Error('Art not found');
        return res.text();
      })
      .then((text) => {
        if (!isMounted) return;
        const validFrames = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (validFrames.length > 0) {
          artCache.set(slug, validFrames);
          setFrames(validFrames);
          setFrameIndex(0);
        }
      })
      .catch(() => {
        if (isMounted) setFrames([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, isFemale]);

  // Frame animation loop for male vector frames
  useEffect(() => {
    if (isFemale || !loop || frames.length <= 1) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => {
        let next = prev + direction;
        if (next >= frames.length) {
          setDirection(-1);
          next = frames.length - 2;
        } else if (next < 0) {
          setDirection(1);
          next = 1;
        }
        return Math.max(0, Math.min(frames.length - 1, next));
      });
    }, 120);

    return () => clearInterval(interval);
  }, [loop, frames.length, direction, isFemale]);

  const numHeight = typeof height === 'number' ? height : parseInt(height, 10) || 200;
  const isCompactThumbnail = numHeight < 90;
  const accentColor = isFemale ? '#E0A899' : '#D9A184';

  return (
    <div
      style={{ height }}
      className={`w-full bg-[#141214] rounded-2xl flex items-center justify-center border border-[#262024] overflow-hidden relative ${
        isCompactThumbnail ? 'p-1' : 'p-2.5 rounded-3xl'
      } ${className}`}
    >
      {isFemale ? (
        // FEMALE ATHLETIC VISUAL ENGINE - Clean, centered vector art without any overlay clutter
        <FemaleExerciseSVG
          slug={slug}
          accentColor={accentColor}
          exerciseName={exerciseName}
          primaryMuscle={primaryMuscle}
        />
      ) : frames.length === 0 || loading ? (
        // LOADING / FALLBACK
        <div className="flex flex-col items-center justify-center text-neutral-600">
          <Dumbbell className="w-8 h-8 mb-1 opacity-40 animate-pulse text-[#D9A184]" />
          {!isCompactThumbnail && (
            <span className="text-[11px] font-mono tracking-wider uppercase opacity-40">
              {loading ? 'Loading Motion...' : 'Exercise Visual'}
            </span>
          )}
        </div>
      ) : (
        // MALE VECTOR FRAMES
        <svg
          viewBox="-50 -50 600 600"
          className="w-full h-full text-white fill-current transition-all duration-75"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
        >
          <path d={frames[frameIndex] || frames[0]} fillRule="evenodd" />
        </svg>
      )}
    </div>
  );
};
