export type ObjectValue = Record<string, unknown>;
export function object(value: unknown): ObjectValue { if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected an object.'); return value as ObjectValue; }
export function keys(value: ObjectValue, allowed: string[]) { for (const key of Object.keys(value))
    if (!allowed.includes(key))
        throw new Error(`Unexpected field: ${key}`); }
export function id(value: unknown): string { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value))
    throw new Error('Invalid identifier.'); return value; }
export function number(value: unknown, min: number, max: number): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    throw new Error('Invalid number.'); return value; }
export function integer(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): number { const n = number(value, min, max); if (!Number.isSafeInteger(n))
    throw new Error('Expected a whole number.'); return n; }
export function text(value: unknown, max = 160): string { if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new Error('Invalid text.'); return value.trim(); }
export function canonical(value: unknown, depth = 0): string {
    if (depth > 32) throw new Error('Command JSON exceeds maximum depth.');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
    if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + Array.from(value, v => canonical(v, depth + 1)).join(',') + ']';
    if (value && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value))) {
        const o = value as ObjectValue;
        return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canonical(o[k], depth + 1)).join(',') + '}';
    }
    throw new Error('Command must contain only finite JSON data.');
}
export function instant(value: unknown): string { if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value)
    throw new Error('Use an explicit valid UTC instant.'); return value; }
export function zone(value: unknown): string { const z = text(value, 100); try {
    new Intl.DateTimeFormat('en', { timeZone: z }).format(0);
}
catch {
    throw new Error('Unknown timezone.');
} return z; }
