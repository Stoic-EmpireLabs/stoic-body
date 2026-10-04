export interface WallTimePolicy { source: 'user' | 'imported'; ambiguous?: 'earlier' | 'later' }
export interface WallTimeResolution {
  requestedLocal: string; resolvedLocal: string | null; timezone: string; startAt: string | null;
  status: 'exact' | 'ambiguous-earlier' | 'ambiguous-later' | 'shifted-gap' | 'skipped-gap';
  explanation: string;
}
export function resolveWallTime(local: string, timezone: string, policy: WallTimePolicy): WallTimeResolution {
  if (typeof local !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(local)) throw new Error('Invalid local date.');
  const naive = Date.parse(`${local}:00.000Z`);
  if (!Number.isFinite(naive) || new Date(naive).toISOString().slice(0, 16) !== local || +local.slice(0, 4) < 1970 || +local.slice(0, 4) > 2100) {
    throw new Error('Use a valid local date between 1970 and 2100.');
  }
  if (!policy || !['user', 'imported'].includes(policy.source) || (policy.ambiguous !== undefined && !['earlier', 'later'].includes(policy.ambiguous))) {
    throw new Error('Unsupported wall-time policy.');
  }
  if (policy.source === 'imported' && policy.ambiguous === 'later') throw new Error('Imported recurrence uses the first ambiguous occurrence.');
  if (typeof timezone !== 'string' || !timezone) throw new Error('Explicit timezone required.');
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, calendar: 'iso8601', numberingSystem: 'latn',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  } catch { throw new Error('Unknown timezone; resolve the source timezone explicitly.'); }
  const localAt = (instant: number) => {
    const values = Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.000Z`;
  };
  // Probe both sides of a transition. Offsets are observed, never assumed to be whole hours.
  const offsets = new Set<number>();
  for (let hour = -36; hour <= 36; hour += 6) {
    const sample = naive + hour * 3_600_000;
    offsets.add(Date.parse(localAt(sample)) - sample);
  }
  const candidates = [...offsets].map(offset => naive - offset).sort((a, b) => a - b);
  const matches = candidates.filter(candidate => Date.parse(localAt(candidate)) === naive);
  const result = (start: number | null, status: WallTimeResolution['status'], explanation: string): WallTimeResolution => ({
    requestedLocal: local, resolvedLocal: start === null ? null : localAt(start).slice(0, 16), timezone,
    startAt: start === null ? null : new Date(start).toISOString(), status, explanation,
  });
  if (matches.length === 1) return result(matches[0], 'exact', 'This local time maps to one instant.');
  if (matches.length > 1) {
    const later = policy.ambiguous === 'later';
    return result(later ? matches[matches.length - 1] : matches[0], later ? 'ambiguous-later' : 'ambiguous-earlier',
      `This local time repeats during an offset change. Previewing the ${later ? 'later' : 'earlier'} occurrence.`);
  }
  if (policy.source === 'imported') return result(null, 'skipped-gap', 'This generated recurrence time does not exist and is skipped under the import recurrence policy.');
  const shifted = candidates.filter(candidate => Date.parse(localAt(candidate)) > naive)
    .sort((a, b) => Date.parse(localAt(a)) - Date.parse(localAt(b)))[0];
  if (shifted === undefined) throw new Error('Timezone transition needs manual review.');
  return result(shifted, 'shifted-gap', 'This local time does not exist. Previewing a shift forward by the offset gap; confirm before scheduling.');
}
