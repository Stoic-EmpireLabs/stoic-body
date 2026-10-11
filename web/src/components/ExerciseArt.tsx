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
  forceGender?: 'male' | 'female';
  exerciseName?: string;
  primaryMuscle?: string;
}

const artCache = new Map<string, string[]>();

export const ExerciseArt: React.FC<ExerciseArtProps> = ({
  slug,
  className = '',
  height = 200,
  loop = true,
  forceGender,
  exerciseName,
  primaryMuscle,
}) => {
  const { profile, settings, coachPersonality } = useGymStore();

  // Automatic female detection based on profile, settings, coach or forceGender
  const isFemaleDefault =
    forceGender === 'female' ||
    profile?.gender === 'female' ||
    settings?.gender === 'female' ||
    coachPersonality === 'aurelia';

  const [activeGender, setActiveGender] = useState<'male' | 'female'>(
    forceGender || (isFemaleDefault ? 'female' : 'male')
  );

  const [frames, setFrames] = useState<string[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Synchronize when active athlete or personality changes
  useEffect(() => {
    if (forceGender) {
      setActiveGender(forceGender);
    } else {
      const female =
        profile?.gender === 'female' ||
        settings?.gender === 'female' ||
        coachPersonality === 'aurelia';
      setActiveGender(female ? 'female' : 'male');
    }
  }, [profile?.gender, settings?.gender, coachPersonality, forceGender]);

  // Load male wireframe frames only if male mode is explicitly active
  useEffect(() => {
    if (!slug || activeGender === 'female') {
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
  }, [slug, activeGender]);

  // Frame animation loop for male vector frames
  useEffect(() => {
    if (activeGender === 'female' || !loop || frames.length <= 1) return;

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
  }, [loop, frames.length, direction, activeGender]);

  const numHeight = typeof height === 'number' ? height : parseInt(height, 10) || 200;
  const isCompactThumbnail = numHeight < 90;
  const accentColor = activeGender === 'female' ? '#E0A899' : '#D9A184';

  return (
    <div
      style={{ height }}
      className={`w-full bg-[#161416] rounded-2xl flex items-center justify-center border border-[#2B2428] overflow-hidden shadow-inner relative group ${
        isCompactThumbnail ? 'p-1' : 'p-3 rounded-3xl'
      } ${className}`}
    >
      {/* 1-Click Interactive Gender Illustration Switcher Pill (only on detailed displays) */}
      {!isCompactThumbnail && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center bg-[#100E10]/85 backdrop-blur-md border border-[#2E282E] rounded-full p-0.5 text-[10px] font-mono shadow-md opacity-85 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGender('female');
            }}
            className={`px-2 py-0.5 rounded-full transition-all ${
              activeGender === 'female'
                ? 'bg-[#E0A899] text-[#140D09] font-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Switch to Female Athletic Visual"
          >
            ♀ Female
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGender('male');
            }}
            className={`px-2 py-0.5 rounded-full transition-all ${
              activeGender === 'male'
                ? 'bg-[#D9A184] text-[#140D09] font-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Switch to Male Tactical Visual"
          >
            ♂ Male
          </button>
        </div>
      )}

      {activeGender === 'female' ? (
        // FEMALE ATHLETIC VISUAL ENGINE - 100% AUTOMATIC ON FEMALE ACCOUNT
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
