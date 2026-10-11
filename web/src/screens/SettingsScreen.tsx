import React, { useRef, useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import { sound } from '../services/sound';
import {
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trash2,
  Info,
  Check,
  Scale,
  Sparkles,
  Shield,
  Compass,
  ClipboardList,
  RotateCcw,
  Users,
} from 'lucide-react';
import { AthleteSwitcherModal } from '../components/AthleteSwitcherModal';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    pushRoute,
    coachPersonality,
    setCoachPersonality,
    openOnboarding,
    onboardingAnswers,
    activeProfileId,
    profile,
  } = useGymStore();

  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = importDataJSON(text);
        if (ok) {
          alert('Backup restored successfully!');
        } else {
          alert('Failed to parse backup file. Please ensure it is valid JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  const coaches = [
    {
      id: 'marine' as const,
      name: 'USMC Combat Conditioning',
      callsign: 'Gunny / Marine Veteran',
      desc: 'High-discipline, combat readiness, pain tolerance, Semper Fi standards.',
      icon: Shield,
      accent: 'text-red-400',
      badge: 'USMC',
    },
    {
      id: 'stoic' as const,
      name: 'Classical Stoic Philosophy',
      callsign: 'Marcus Aurelius & Epictetus',
      desc: 'Mastery of self, dichotomy of control, virtue over comfort.',
      icon: Compass,
      accent: 'text-[#D9A184]',
      badge: 'STOIC',
    },
    {
      id: 'coach' as const,
      name: 'High-Performance Coach',
      callsign: 'Data & Hypertrophy',
      desc: 'Progressive overload science, RPE precision, data-driven stimulus.',
      icon: Sparkles,
      accent: 'text-emerald-400',
      badge: 'PRO',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Settings & Privacy</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Customize coaching voice, assessment questions, appearance and local offline data
        </p>
      </div>

      {/* Active Athlete Account Card */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Active Athlete Profile
            </h3>
            <span className="text-[11px] text-neutral-500">
              Offline-first account • No passwords or cloud tracking required
            </span>
          </div>
          <button
            onClick={() => setShowAthleteModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#222] hover:bg-[#2A2A2A] border border-[#333] text-xs font-bold text-neutral-200 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#D9A184]" />
            Switch Profile
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#121212] border border-[#242424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#201D1A] border border-[#3E3832] flex items-center justify-center font-black text-[#D9A184] text-sm">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{profile.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1C1A18] text-[#D9A184] border border-[#3E3832]">
                  {activeProfileId}
                </span>
                {profile.serviceBranch && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/40 text-red-400 border border-red-900/40">
                    {profile.serviceBranch}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-400">
                Callsign: <strong className="text-white font-mono">{profile.callsign || 'Gunny'}</strong> • {profile.bio}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Coaching Voice & Philosophy */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Coaching Voice & Quotes Personality
          </h3>
          <span className="text-[10px] uppercase font-mono font-black text-[#D9A184] px-2 py-0.5 rounded bg-[#201D1A] border border-[#3E3832]">
            Active: {coachPersonality.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-neutral-400">
          Select which coach guides your workout rest timers, victory reflections, and daily Stoic wisdom cards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {coaches.map((c) => {
            const isSelected = coachPersonality === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCoachPersonality(c.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#D9A184] bg-[#221F1C] text-white shadow'
                    : 'border-[#2E2E2E] bg-[#141414] text-neutral-400 hover:border-[#444]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${c.accent}`} />
                      <span className="text-[10px] font-mono font-black uppercase text-neutral-400 tracking-wider">
                        {c.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#D9A184] text-[#140D09] flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-white">{c.name}</h4>
                  <p className="text-[10px] font-mono text-[#D9A184] mt-0.5">{c.callsign}</p>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">{c.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stoic Body Assessment */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#D9A184]" />
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Stoic Body Assessment Questionnaire
            </h3>
          </div>
          <button
            onClick={() => openOnboarding()}
            className="px-3 py-1.5 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            Retake Assessment
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          Your initial assessment tailors exercise selections, coaching cadences, and progression targets.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#242424]">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Primary Focus</span>
            <span className="text-xs font-bold text-white capitalize mt-0.5 block">
              {onboardingAnswers?.focus || 'Combat Conditioning'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#242424]">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Experience</span>
            <span className="text-xs font-bold text-white capitalize mt-0.5 block">
              {onboardingAnswers?.experience || 'USMC Veteran'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#242424]">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Gear Tier</span>
            <span className="text-xs font-bold text-white capitalize mt-0.5 block">
              {onboardingAnswers?.equipment || 'Full Barbell & Rack'}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Appearance Theme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'dark', label: 'Dark Charcoal', color: 'bg-[#121212]' },
            { id: 'amoled', label: 'OLED Pure Black', color: 'bg-[#000000]' },
            { id: 'warm', label: 'Warm Terracotta', color: 'bg-[#18120E]' },
            { id: 'light', label: 'Clean Paper Light', color: 'bg-[#F5F2EB] text-black' },
          ].map((th) => {
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => updateSettings({ theme: th.id as any })}
                className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#D9A184] bg-[#221F1C] text-white shadow'
                    : 'border-[#2E2E2E] bg-[#141414] text-neutral-400'
                }`}
              >
                <span>{th.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#D9A184]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Tone & Cursor Interaction */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Accent Tone & Cursor Interaction
        </h3>
        <p className="text-[11px] text-neutral-400">
          Personalize interface highlights, buttons, and mouse hover effects.
        </p>

        {/* Heat Tone Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {[
            { id: 'rose', label: 'Rose Gold', hex: '#E0A899' },
            { id: 'ember', label: 'Spartan Amber', hex: '#D9A184' },
            { id: 'green', label: 'Sage Green', hex: '#8FA377' },
            { id: 'blue', label: 'Slate Blue', hex: '#7FA8C9' },
            { id: 'mono', label: 'Apple Silver', hex: '#E5E5E5' },
          ].map((tone) => {
            const isSelected = settings.heatTone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => updateSettings({ heatTone: tone.id as any })}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'border-white bg-[#222] text-white shadow-md'
                    : 'border-[#2E2E2E] bg-[#141414] text-neutral-400 hover:text-white'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: tone.hex }}
                />
                <span className="text-xs font-bold">{tone.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cursor Glow Toggle */}
        <div className="flex items-center justify-between py-2 pt-3 border-t border-[#242424]">
          <div>
            <span className="text-xs font-bold text-white block">Mouse Ambient Spotlight</span>
            <span className="text-[11px] text-neutral-500">
              Zero-lag spotlight matching your accent tone (Turn off for 100% clean Apple feel)
            </span>
          </div>
          <button
            onClick={() => updateSettings({ cursorAuraEnabled: !settings.cursorAuraEnabled })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              settings.cursorAuraEnabled
                ? 'bg-[#D9A184] text-[#140D09] border-[#D9A184]'
                : 'bg-[#141414] text-neutral-400 border-[#2E2E2E]'
            }`}
          >
            {settings.cursorAuraEnabled ? 'Enabled' : 'Disabled (Clean)'}
          </button>
        </div>
      </div>

      {/* Units & Audio */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Units & Feedback
        </h3>

        {/* Units toggle */}
        <div className="flex items-center justify-between py-2 border-b border-[#242424]">
          <div>
            <span className="text-xs font-bold text-white block">Weight Units</span>
            <span className="text-[11px] text-neutral-500">Currently using {settings.units.toUpperCase()}</span>
          </div>
          <div className="flex bg-[#121212] p-1 rounded-xl border border-[#2A2A2A]">
            <button
              onClick={() => updateSettings({ units: 'kg' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.units === 'kg' ? 'bg-[#D9A184] text-[#140D09]' : 'text-neutral-400'
              }`}
            >
              KG
            </button>
            <button
              onClick={() => updateSettings({ units: 'lb' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                settings.units === 'lb' ? 'bg-[#D9A184] text-[#140D09]' : 'text-neutral-400'
              }`}
            >
              LB
            </button>
          </div>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between py-2 border-b border-[#242424]">
          <div>
            <span className="text-xs font-bold text-white block">Audio Sound Effects</span>
            <span className="text-[11px] text-neutral-500">Rest timer alerts & set ticks</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playBeepBell();
              }}
              className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 rounded-lg bg-[#222]"
            >
              Test Bell
            </button>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`p-2 rounded-xl border transition-all ${
                settings.soundEnabled
                  ? 'bg-[#D9A184]/20 border-[#D9A184]/50 text-[#D9A184]'
                  : 'bg-[#222] border-[#333] text-neutral-500'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Default Rest Duration */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-bold text-white block">Default Rest Countdown</span>
            <span className="text-[11px] text-neutral-500">Auto-triggers upon set completion</span>
          </div>
          <select
            value={settings.defaultRestSec}
            onChange={(e) => updateSettings({ defaultRestSec: parseInt(e.target.value) || 90 })}
            className="bg-[#121212] border border-[#2B2B2B] rounded-xl px-3 py-1.5 text-xs font-bold text-white"
          >
            <option value={45}>45 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>2 minutes</option>
            <option value={180}>3 minutes</option>
          </select>
        </div>
      </div>

      {/* Data Backup & Portability */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Offline Privacy & Data Portability
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Stoic Body has no cloud tracking, no cookies, and no third-party servers. Your data is your own.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={exportDataJSON}
            className="p-3 rounded-xl bg-[#222] hover:bg-[#2A2A2A] border border-[#333] text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-[#D9A184]" />
            Export Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-[#222] hover:bg-[#2A2A2A] border border-[#333] text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4 text-[#8FA377]" />
            Restore Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="pt-2 border-t border-[#242424]">
          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to permanently erase all workouts, routines and records? This cannot be undone.'
                )
              ) {
                resetAllData();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Wipe Local Data
          </button>
        </div>
      </div>

      {/* About Link */}
      <div
        onClick={() => pushRoute('about')}
        className="bg-[#181818] hover:bg-[#222] border border-[#282828] rounded-2xl p-4 cursor-pointer flex items-center justify-between text-xs text-neutral-300 font-bold transition-all"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#D9A184]" />
          <span>About Stoic Body & Credits</span>
        </div>
        <span className="text-neutral-500 font-mono">v1.3.0 →</span>
      </div>

      <AthleteSwitcherModal
        isOpen={showAthleteModal}
        onClose={() => setShowAthleteModal(false)}
      />
    </div>
  );
};
