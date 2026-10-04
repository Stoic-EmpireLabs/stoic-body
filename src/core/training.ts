import { object, keys, integer, text, id } from './validation';
import type { HealthRecord } from './health-store';
import { healthSources } from './health-content';
export const trainingStyles = { 'full-body': 'Full-body basics', upper: 'Upper-body session', lower: 'Lower-body session', push: 'Push session', pull: 'Pull session', legs: 'Leg session', calisthenics: 'Calisthenics foundations', walk: 'Treadmill walk', boxing: 'Shadowboxing and footwork', recovery: 'Mobility and recovery', heavy: 'Heavy lifting — coached setup', hiit: 'HIIT — suitability review', hit: 'High-intensity resistance — suitability review', sprints: 'Sprints — suitability review' };
export interface Exercise { name: string; prescription: string; cue: string; alternative: string; minutes: number }
export interface Routine { eligible: boolean; reasons: string[]; title: string; style: string; minutes: number; kind: 'workout' | 'recovery'; exercises: Exercise[]; warmup: string; cooldown: string; intensity: string; progression: string; recovery: string; stop: string; rationale: string; sources: typeof healthSources.resistance[]; goalId: string | null; input: Record<string, unknown> }
export function buildRoutine(input: unknown): Routine {
  const p = object(input); keys(p, ['adult', 'restrictions', 'equipment', 'style', 'minutes', 'preference', 'goalId']);
  if (typeof p.adult !== 'boolean' || !['none', 'yes', 'unknown'].includes(String(p.restrictions))) throw new Error('Complete the adult and restriction questions.');
  const style = text(p.style, 30); if (!Object.hasOwn(trainingStyles, style)) throw new Error('Choose a listed session style.');
  const minutes = integer(p.minutes, 20, 90), preference = text(p.preference, 30);
  if (!['balanced', 'higher-reps'].includes(preference)) throw new Error('Choose your repetition preference.');
  if (!Array.isArray(p.equipment) || p.equipment.some(e => !['cables', 'bench', 'barbell', 'pullup', 'treadmill', 'bag'].includes(e)) || new Set(p.equipment).size !== p.equipment.length) throw new Error('Confirm available equipment.');
  const equipment = p.equipment as string[], reasons: string[] = [];
  if (!p.adult || p.restrictions !== 'none') reasons.push('Starter generation is for adults reporting no relevant restrictions. Keep logging and review exercise suitability with a qualified professional.');
  if (['heavy', 'hiit', 'hit', 'sprints'].includes(style)) reasons.push('This method needs a fuller ability and safety assessment. Choose a moderate starter session or record a professionally supplied plan as a task. HIIT means intervals; HIT resistance is a different method.');
  if (style === 'walk' && !equipment.includes('treadmill')) reasons.push('A treadmill is required for this selection. An outdoor walk can be entered as an ordinary task.');
  const reps = preference === 'higher-reps' ? '2 sets of 12–20 controlled repetitions' : '2 sets of 8–12 controlled repetitions';
  const block = preference === 'higher-reps' ? 6 : 5;
  const strength = (name: string, cue: string, alternative: string): Exercise => ({ name, cue, alternative, minutes: block, prescription: `${reps}; rest 60–90 seconds between sets. Start with an easy load; stop before technique changes.` });
  const push = strength('Incline push-up', 'Use a stable fixed surface. Keep your body aligned and lower only through a comfortable range.', 'Use a higher stable surface or a wall.');
  const pull = equipment.includes('cables') ? strength('Cable row', 'Set a light load. Keep your torso quiet and draw your elbows back without shrugging or jerking.', 'Prone W raise for light control work; it is not an equivalent loaded pull.') : strength('Prone W raise', 'Lie face down with elbows bent into a W. Lift the hands slightly without forcing your back or neck.', 'A light cable row when equipment and technique are available.');
  const squat = strength('Bodyweight squat', 'Keep feet supported, bend at hips and knees, and use a comfortable depth. Hold a fixed support if needed.', 'Sit-to-stand from a stable seat.');
  const bridge = strength('Glute bridge', 'Lie on your back with knees bent. Lift through the hips without arching your lower back.', 'Use a smaller comfortable range.');
  const core = strength('Dead bug', 'Move one opposite arm and leg slowly while keeping your trunk steady. Stop before your back arches.', 'Move arms only or shorten the reach.');
  const calf = strength('Supported calf raise', 'Use fixed support for balance and lift heels slowly without bouncing.', 'Seated calf raise.');
  const candidates = style === 'upper' ? [push, pull, core] : style === 'push' ? [push, core] : style === 'pull' ? [pull, core] : ['lower', 'legs'].includes(style) ? [squat, bridge, calf] : style === 'calisthenics' ? [push, squat, core, bridge] : [push, pull, squat, bridge, core];
  let exercises = candidates.slice(0, Math.floor((minutes - 8) / block));
  if (style === 'boxing') exercises = [{ name: 'Shadowboxing and footwork', minutes: minutes - 8, prescription: `Easy 1-minute practice rounds with 1-minute relaxed recovery, for up to ${minutes - 8} minutes including rests. No sparring or contact.`, cue: 'Start balanced. Practice small steps and relaxed straight punches; do not lock elbows or punch with hand weights.', alternative: 'Footwork only, or an easy walk. Bag work needs separate equipment and technique instruction.' }];
  if (style === 'walk') exercises = [{ name: 'Treadmill walk', minutes: minutes - 8, prescription: `${minutes - 8} minutes at a comfortable conversational pace; speed and incline are your choice, not a target.`, cue: 'Learn the stop control and safety clip before starting. Begin slowly and use the machine as directed.', alternative: 'Shorten the walk or choose recovery if fatigued.' }];
  if (style === 'recovery') exercises = [{ name: 'Gentle mobility', minutes: minutes - 8, prescription: `Up to ${minutes - 8} minutes of comfortable shoulder, ankle and hip movement with frequent pauses.`, cue: 'Use slow pain-free ranges. Avoid forcing stretches or holding your breath.', alternative: 'Quiet rest is a valid recovery choice.' }];
  const goalId = p.goalId === undefined || p.goalId === null ? null : id(p.goalId);
  return { eligible: reasons.length === 0, reasons, title: trainingStyles[style as keyof typeof trainingStyles], style, minutes, kind: style === 'recovery' ? 'recovery' : 'workout', exercises: reasons.length ? [] : exercises,
    warmup: '5 minutes: easy walking or marching, then unloaded practice of the session movements.', cooldown: '3 minutes: slow down gradually, breathe normally, and use gentle comfortable movement.',
    intensity: 'Keep the effort moderate and technique controlled. For resistance work, leave about 3 repetitions in reserve; do not train to failure.',
    progression: 'Repeat a comfortable session before adding difficulty. Review three comparable sessions before considering a small increase; change one variable at a time. No automatic load changes.',
    recovery: 'Allow recovery between hard sessions for the same muscles. When sleep, energy or technique deteriorates, shorten the session, reduce sets or take recovery; do not make up missed volume.',
    stop: 'Stop for sharp pain, dizziness or unusual breathlessness. Seek urgent medical help for chest pain, fainting or severe symptoms.',
    rationale: `A ${minutes}-minute starter using confirmed equipment and ${preference === 'higher-reps' ? 'lighter resistance with more repetitions' : 'moderate repetition ranges'}. Warm-up and cooldown are included. ${!equipment.includes('cables') ? 'Loaded pulling is not included; the W raise is light control work.' : ''} A split session is one part of a balanced week; review frequency before repeating.`,
    sources: [healthSources.resistance, style === 'boxing' ? healthSources.boxing : healthSources.activity], goalId, input: { ...p, goalId } };
}
export function progressionAdvice(records: HealthRecord[], routineId: string, exercise: string) {
  const logs = records.filter(r => r.kind === 'workout' && !r.archived && r.data.routineId === routineId && r.data.exercise === exercise).sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));
  const recent = logs.slice(0, 3);
  if (recent.some(r => r.data.pain === true || Number(r.data.effort) >= 9)) return { action: 'recover', text: 'Recent discomfort or very high effort: do not add load. Review technique, recovery and appropriate professional help.' };
  if (recent.length < 3 || new Set(recent.map(r => r.data.date)).size < 3 || recent.some(r => r.data.effort === null || Number(r.data.effort) > 7)) return { action: 'hold', text: 'Keep the plan steady. A useful progression review needs three comparable days with recorded effort and no discomfort.' };
  const signatures = recent.map(r => JSON.stringify((r.data.sets as { reps: number; load: number; unit: string }[]).map(s => [Math.round(s.load * (s.unit === 'lb' ? .45359237 : 1) * 100) / 100, s.reps])));
  if (!signatures[0] || signatures[0] === '[]' || signatures.some(s => s !== signatures[0])) return { action: 'hold', text: 'Sessions differ in sets, load or repetitions. Review the history before changing difficulty.' };
  return { action: 'review', text: 'Three comparable comfortable sessions: consider a small progression if technique is sound and recovery is good. Review it yourself; your saved plan has not changed.' };
}
