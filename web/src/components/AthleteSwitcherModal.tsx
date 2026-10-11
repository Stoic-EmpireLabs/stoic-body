import React, { useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import { User, Shield, Compass, Sparkles, Check, Plus, X, UserCheck } from 'lucide-react';
import type { CoachPersonality, AthleteAccount } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AthleteSwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    activeProfileId,
    athleteAccounts,
    switchAthlete,
    saveAthlete,
  } = useGymStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCallsign, setNewCallsign] = useState('');
  const [newPersonality, setNewPersonality] = useState<CoachPersonality>('marine');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newAcc: AthleteAccount = {
      id: `athlete-${Date.now()}`,
      name: newName.trim(),
      callsign: newCallsign.trim() || 'Warrior',
      role: newPersonality === 'marine' ? 'USMC Conditioning' : newPersonality === 'stoic' ? 'Stoic Athlete' : newPersonality === 'aurelia' ? 'Empress Performance' : 'Performance Lifter',
      personality: newPersonality,
      gender: newPersonality === 'aurelia' ? 'female' : 'male',
      createdDate: new Date().toISOString(),
    };

    saveAthlete(newAcc);
    switchAthlete(newAcc.id);
    setShowAddForm(false);
    setNewName('');
    setNewCallsign('');
    onClose();
  };

  const personalityIcons: Record<CoachPersonality, React.ReactNode> = {
    marine: <Shield className="w-4 h-4 text-red-400" />,
    stoic: <Compass className="w-4 h-4 text-[#D9A184]" />,
    coach: <Sparkles className="w-4 h-4 text-emerald-400" />,
    aurelia: <Sparkles className="w-4 h-4 text-rose-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#161514] border border-[#2B2724] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242220]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#28221D] text-[#D9A184] flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Athlete Switcher</h3>
              <p className="text-[11px] text-neutral-400">1-click profile login & coaching voice</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account List */}
        {!showAddForm ? (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {athleteAccounts.map((acc) => {
              const isSelected = activeProfileId === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    switchAthlete(acc.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                    isSelected
                      ? 'bg-[#221C18] border-[#D9A184] text-white shadow-md'
                      : 'bg-[#121110] border-[#242220] hover:border-[#383430] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1C1A18] border border-[#282624] flex items-center justify-center flex-shrink-0">
                      {personalityIcons[acc.personality] || <User className="w-4 h-4 text-neutral-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-white">{acc.name}</span>
                        {acc.id === 'stoic1712' && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {acc.role} · <span className="text-[#D9A184] font-semibold">{acc.callsign}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[#D9A184] text-[#140D09]' : 'border border-[#383430]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl bg-[#1C1A18] hover:bg-[#22201E] border border-dashed border-[#383430] text-neutral-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 mt-2"
            >
              <Plus className="w-4 h-4 text-[#D9A184]" /> Add Another Profile
            </button>
          </div>
        ) : (
          /* Add Profile Form */
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-400 block mb-1">
                Athlete Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Stoic Marine 03"
                className="w-full bg-[#121110] border border-[#2B2826] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A184]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-400 block mb-1">
                Callsign / Nickname
              </label>
              <input
                type="text"
                value={newCallsign}
                onChange={(e) => setNewCallsign(e.target.value)}
                placeholder="e.g. Iron Gunny"
                className="w-full bg-[#121110] border border-[#2B2826] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A184]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-400 block mb-1">
                Coaching Persona
              </label>
              <select
                value={newPersonality}
                onChange={(e) => setNewPersonality(e.target.value as CoachPersonality)}
                className="w-full bg-[#121110] border border-[#2B2826] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D9A184]"
              >
                <option value="aurelia">Empress Aurelia (Female Athletic Wisdom)</option>
                <option value="marine">Marine Combat Conditioning (USMC)</option>
                <option value="stoic">Classical Stoic (Marcus Aurelius)</option>
                <option value="coach">High-Performance Specialist</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#242220] text-neutral-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#D9A184] text-[#140D09] font-black text-xs shadow-md"
              >
                Create & Switch
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
