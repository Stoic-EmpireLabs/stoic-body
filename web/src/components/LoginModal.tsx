import React, { useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import {
  Shield,
  Sparkles,
  Compass,
  ArrowRight,
  UserCheck,
  Plus,
  X,
  Lock,
  Flame,
  Check,
  Dumbbell,
  Calendar,
} from 'lucide-react';
import type { CoachPersonality, AthleteAccount } from '../types';

export const LoginModal: React.FC = () => {
  const {
    showLoginModal,
    dismissLoginModal,
    activeProfileId,
    athleteAccounts,
    switchAthlete,
    saveAthlete,
    openOnboarding,
    profile,
  } = useGymStore();

  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [athleteName, setAthleteName] = useState('');
  const [athleteCallsign, setAthleteCallsign] = useState('');
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');

  if (!showLoginModal) return null;

  const handleSelectAthlete = (id: string) => {
    switchAthlete(id);
    dismissLoginModal();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName.trim()) return;

    const existing = athleteAccounts.find(
      (a) => a.name.toLowerCase() === athleteName.trim().toLowerCase()
    );

    if (existing) {
      switchAthlete(existing.id);
      dismissLoginModal();
      return;
    }

    const newAcc: AthleteAccount = {
      id: `athlete-${Date.now()}`,
      name: athleteName.trim(),
      callsign: athleteCallsign.trim() || (selectedGender === 'female' ? 'Aurelia' : 'Spartan'),
      role: selectedGender === 'female' ? 'Empress Athlete' : 'Tactical Athlete',
      personality: selectedGender === 'female' ? 'aurelia' : 'marine',
      gender: selectedGender,
      createdDate: new Date().toISOString(),
    };

    saveAthlete(newAcc);
    switchAthlete(newAcc.id);
    dismissLoginModal();
    // Launch onboarding for new athlete
    openOnboarding();
  };

  const handleStartQuestionnaire = () => {
    dismissLoginModal();
    openOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#161414] border border-[#2B2625] rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 border-b border-[#24201F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D9A184]/20 to-[#E0A899]/10 border border-[#D9A184]/40 flex items-center justify-center text-[#D9A184]">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                STOIC BODY · ATHLETE ACCESS
              </span>
              <h3 className="text-lg font-black text-white tracking-tight">
                Athlete Sign-In & Profile Portal
              </h3>
            </div>
          </div>

          <button
            onClick={dismissLoginModal}
            className="p-2 rounded-xl bg-[#201D1C] hover:bg-[#2A2624] text-neutral-400 hover:text-white transition-colors"
            title="Continue as Guest"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
          {/* Subtitle Banner */}
          <div className="p-3.5 rounded-2xl bg-[#1C1918] border border-[#2B2624] flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#D9A184] flex-shrink-0" />
            <p className="text-xs text-neutral-300 leading-relaxed">
              Your workouts, routines, and biometric logs are encrypted and stored 100% locally on your device with zero cloud tracking.
            </p>
          </div>

          {/* Quick Sign-In Profile Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                Select Athlete Profile
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Active: {profile?.name || 'Sophia'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Aurelia Profile */}
              <div
                onClick={() => handleSelectAthlete('athlete-female')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 relative ${
                  activeProfileId === 'athlete-female'
                    ? 'bg-[#261E22] border-[#E0A899] shadow-lg shadow-[#E0A899]/15'
                    : 'bg-[#141214] border-[#262024] hover:border-[#3E343A]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1C161A] border border-[#E0A899]/30 flex items-center justify-center text-[#E0A899] text-base font-black">
                    ♀
                  </div>
                  {activeProfileId === 'athlete-female' ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#E0A899] text-[#140D09]">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono">Sign In →</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-white">Sophia</span>
                    <span className="text-[10px] text-[#E0A899] font-mono font-bold">/ Aurelia</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    Female 3D library · Rose gold aesthetic · Glute & posture periodization
                  </p>
                </div>
              </div>

              {/* Spartan Profile */}
              <div
                onClick={() => handleSelectAthlete('athlete-male')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 relative ${
                  activeProfileId === 'athlete-male'
                    ? 'bg-[#221C18] border-[#D9A184] shadow-lg shadow-[#D9A184]/15'
                    : 'bg-[#141214] border-[#262024] hover:border-[#3E343A]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1C1A18] border border-[#D9A184]/30 flex items-center justify-center text-[#D9A184] text-base font-black">
                    ♂
                  </div>
                  {activeProfileId === 'athlete-male' ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#D9A184] text-[#140D09]">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono">Sign In →</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-white">Marcus</span>
                    <span className="text-[10px] text-[#D9A184] font-mono font-bold">/ Spartan</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    Male athletic wireframes · Ember aesthetic · Tactical combat conditioning
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Athlete Accounts List */}
            {athleteAccounts.filter((a) => a.id !== 'athlete-female' && a.id !== 'athlete-male').length > 0 && (
              <div className="mt-3 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Other Registered Athletes
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {athleteAccounts
                    .filter((a) => a.id !== 'athlete-female' && a.id !== 'athlete-male')
                    .map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectAthlete(acc.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                          activeProfileId === acc.id
                            ? 'bg-[#221C18] border-[#D9A184] text-white font-bold'
                            : 'bg-[#121110] border-[#22201E] text-neutral-300 hover:border-[#383430]'
                        }`}
                      >
                        <span className="font-bold">{acc.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {acc.gender === 'female' ? '♀ Aurelia' : '♂ Spartan'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#24201F] w-full" />
            <span className="bg-[#161414] px-3 text-[10px] font-black uppercase text-neutral-500 font-mono absolute">
              OR
            </span>
          </div>

          {/* New Athlete Assessment Card (Primary Action) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#241E1C] via-[#1C1817] to-[#141212] border border-[#3E3430] relative overflow-hidden shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9A184]/20 border border-[#D9A184]/40 flex items-center justify-center text-[#D9A184]">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#D9A184]/15 text-[#D9A184] border border-[#D9A184]/30">
                RECOMMENDED
              </span>
            </div>

            <h4 className="text-base font-black text-white tracking-tight">
              Create New Athlete & Build Custom Protocol
            </h4>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Take the 6-step assessment to automatically generate tailored workout routines, a weekly training split, a 14-day calendar schedule, and macro nutrition targets.
            </p>

            <button
              onClick={handleStartQuestionnaire}
              className="mt-4 w-full py-3 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all"
            >
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
              Start 6-Step Protocol Assessment
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Custom Name Sign-In Form (Toggleable) */}
          {mode === 'custom' ? (
            <form onSubmit={handleCustomLogin} className="p-4 rounded-2xl bg-[#121110] border border-[#242220] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">Manual Athlete Login</span>
                <button
                  type="button"
                  onClick={() => setMode('quick')}
                  className="text-[10px] text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Athlete Name
                  </label>
                  <input
                    type="text"
                    required
                    value={athleteName}
                    onChange={(e) => setAthleteName(e.target.value)}
                    placeholder="e.g. Aurelia"
                    className="w-full bg-[#181615] border border-[#2B2724] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9A184]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Callsign / Title
                  </label>
                  <input
                    type="text"
                    value={athleteCallsign}
                    onChange={(e) => setAthleteCallsign(e.target.value)}
                    placeholder="e.g. Empress"
                    className="w-full bg-[#181615] border border-[#2B2724] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9A184]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                  Archetype Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGender('female')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedGender === 'female'
                        ? 'bg-[#261E22] border-[#E0A899] text-[#E0A899]'
                        : 'bg-[#181615] border-[#282422] text-neutral-400'
                    }`}
                  >
                    ♀ Female / Empress
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('male')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedGender === 'male'
                        ? 'bg-[#221C18] border-[#D9A184] text-[#D9A184]'
                        : 'bg-[#181615] border-[#282422] text-neutral-400'
                    }`}
                  >
                    ♂ Male / Spartan
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#140D09] font-black text-xs transition-all active:scale-98 shadow"
              >
                Sign In to Athlete Profile
              </button>
            </form>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('custom')}
                className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 font-mono transition-colors"
              >
                Sign in with custom athlete name or ID →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#24201F] bg-[#121010] flex items-center justify-between text-xs text-neutral-500">
          <span>Stoic Body v2.4 · Offline First</span>
          <button
            onClick={dismissLoginModal}
            className="text-neutral-400 hover:text-white font-bold transition-colors"
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
};
