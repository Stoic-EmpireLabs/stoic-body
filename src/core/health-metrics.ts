import type { HealthRecord } from './health-store';
import { healthDate } from './health-store';
export function summarizeHealth(records: HealthRecord[], date: string, unit: 'kg' | 'lb') {
  healthDate(date); if (!['kg', 'lb'].includes(unit)) throw new Error('Choose weight units.');
  const active = records.filter(r => !r.archived), daily = active.filter(r => r.data.date === date), foods = daily.filter(r => r.kind === 'food');
  const nutrients = Object.fromEntries(['calories', 'protein', 'carbs', 'fat', 'fiber'].map(key => {
    const known = foods.filter(r => typeof r.data[key] === 'number');
    return [key, { total: known.reduce((s, r) => s + Number(r.data[key]), 0), known: known.length, entries: foods.length }];
  }));
  const grouped = new Map<string, number[]>();
  for (const r of active.filter(r => r.kind === 'measurement' && r.data.metric === 'weight' && String(r.data.date) <= date)) {
    const day = String(r.data.date), kg = Number(r.data.value) * (r.data.unit === 'lb' ? .45359237 : 1);
    grouped.set(day, [...(grouped.get(day) ?? []), kg]);
  }
  const points = [...grouped].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, value: values.reduce((a, b) => a + b, 0) / values.length / (unit === 'lb' ? .45359237 : 1) }));
  const age = (day: string) => (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`)) / 86400000;
  const recent = points.filter(p => age(p.date) < 7), prior = points.filter(p => age(p.date) >= 7 && age(p.date) < 14);
  const mean = (v: typeof points) => v.length ? v.reduce((s, p) => s + p.value, 0) / v.length : null;
  const average = mean(recent), previous = mean(prior);
  return { nutrients, waterMl: daily.filter(r => r.kind === 'water').reduce((s, r) => s + Number(r.data.ml), 0), weight: { unit, points, days: recent.length, mean: average, change: recent.length >= 3 && prior.length >= 3 ? average! - previous! : null,
    explanation: 'Mean of measured daily averages over seven calendar days. Missing days are not filled in. Week comparison needs three measured days in each window. This is not a body-fat estimate or goal-date forecast.' } };
}
