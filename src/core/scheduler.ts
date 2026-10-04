export interface PlanningTask {
    id: string;
    revision: number;
    priority: number;
    durationMinutes: number;
    prepMinutes: number;
    travelMinutes: number;
    bufferMinutes: number;
    dependencies: string[];
    earliestAt?: string;
    deadlineAt?: string;
}
export interface ScheduleInput {
    horizonStart: string;
    horizonEnd: string;
    timezone: string;
    policyVersion: 1;
    availability: {
        startAt: string;
        endAt: string;
    }[];
    reserved: {
        id: string;
        startAt: string;
        endAt: string;
        revision: number;
        kind: 'fixed' | 'locked' | 'sleep' | 'family' | 'accepted';
    }[];
    tasks: PlanningTask[];
    completedDependencyIds: string[];
}
export interface Placement {
    taskId: string;
    startAt: string;
    endAt: string;
    occupiedStartAt: string;
    occupiedEndAt: string;
    reason: string;
}
export interface ScheduleProposal {
    policyVersion: 1;
    horizonStart: string;
    horizonEnd: string;
    timezone: string;
    baseRevisions: {
        tasks: Record<string, number>;
        reserved: Record<string, number>;
    };
    placements: Placement[];
    unplaced: {
        taskId: string;
        reason: 'insufficient-capacity' | 'dependency-unplaced';
        requiredMinutes: number;
        largestGapMinutes: number;
        alternatives: string[];
    }[];
    violations: {
        code: string;
        entityIds: string[];
        message: string;
    }[];
}
type Interval = {
    start: number;
    end: number;
};
const minute = 60000;
function timestamp(value: string): number {
    const result = Date.parse(value);
    if (!Number.isFinite(result) || new Date(result).toISOString() !== value) {
        throw new Error('Use explicit valid UTC instants.');
    }
    return result;
}
function interval(startAt: string, endAt: string): Interval {
    const start = timestamp(startAt), end = timestamp(endAt);
    if (end <= start)
        throw new Error('An interval must end after it starts.');
    return { start, end };
}
function whole(value: number, min: number, max: number, field: string) {
    if (!Number.isSafeInteger(value) || value < min || value > max) {
        throw new Error(`Invalid ${field}.`);
    }
}
function validateId(id: string) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id))
        throw new Error('Invalid identifier.');
}
function merge(windows: Interval[]): Interval[] {
    const result: Interval[] = [];
    for (const next of [...windows].sort((a, b) => a.start - b.start || a.end - b.end)) {
        const previous = result.at(-1);
        if (previous && next.start <= previous.end)
            previous.end = Math.max(previous.end, next.end);
        else
            result.push({ ...next });
    }
    return result;
}
function subtract(windows: Interval[], occupied: Interval): Interval[] {
    return windows.flatMap(window => {
        if (occupied.end <= window.start || occupied.start >= window.end)
            return [window];
        const pieces: Interval[] = [];
        if (occupied.start > window.start)
            pieces.push({ start: window.start, end: occupied.start });
        if (occupied.end < window.end)
            pieces.push({ start: occupied.end, end: window.end });
        return pieces;
    });
}
/** Pure proposal only. Availability and reserved blocks must already be expanded to UTC. */
export function proposeSchedule(input: ScheduleInput): ScheduleProposal {
    const horizon = interval(input.horizonStart, input.horizonEnd);
    if (horizon.end - horizon.start > 14 * 24 * 60 * minute)
        throw new Error('Planning horizon exceeds 14 elapsed days.');
    try {
        new Intl.DateTimeFormat('en', { timeZone: input.timezone }).format(0);
    }
    catch {
        throw new Error('Unknown timezone.');
    }
    if (typeof input.timezone !== 'string' || !input.timezone)
        throw new Error('Explicit timezone required.');
    if (input.policyVersion !== 1)
        throw new Error('Unsupported scheduling policy.');
    for (const list of [input.availability, input.reserved, input.tasks, input.completedDependencyIds]) {
        if (!Array.isArray(list) || list.length > 1000)
            throw new Error('Planning inputs must contain at most 1000 records per collection.');
    }
    const tasks = new Map<string, PlanningTask>();
    const completed = new Set(input.completedDependencyIds);
    for (const id of completed)
        validateId(id);
    for (const task of input.tasks) {
        validateId(task.id);
        if (tasks.has(task.id) || completed.has(task.id))
            throw new Error('Duplicate task identifier.');
        whole(task.revision, 1, Number.MAX_SAFE_INTEGER, 'revision');
        whole(task.priority, 0, 10, 'priority');
        whole(task.durationMinutes, 1, 1440, 'duration');
        for (const value of [task.prepMinutes, task.travelMinutes, task.bufferMinutes])
            whole(value, 0, 1440, 'buffer duration');
        if (task.earliestAt !== undefined)
            timestamp(task.earliestAt);
        if (task.deadlineAt !== undefined)
            timestamp(task.deadlineAt);
        if (!Array.isArray(task.dependencies) || task.dependencies.length > 1000 || new Set(task.dependencies).size !== task.dependencies.length) {
            throw new Error('Invalid dependency list.');
        }
        tasks.set(task.id, task);
    }
    const visiting = new Set<string>(), visited = new Set<string>();
    const visit = (task: PlanningTask) => {
        if (visiting.has(task.id))
            throw new Error('Dependency cycle detected.');
        if (visited.has(task.id))
            return;
        visiting.add(task.id);
        for (const dependency of task.dependencies) {
            validateId(dependency);
            const previous = tasks.get(dependency);
            if (previous)
                visit(previous);
            else if (!completed.has(dependency))
                throw new Error('Unknown dependency.');
        }
        visiting.delete(task.id);
        visited.add(task.id);
    };
    for (const task of tasks.values())
        visit(task);
    const reservationIds = new Set<string>();
    const reserved = input.reserved.map(block => {
        validateId(block.id);
        if (reservationIds.has(block.id))
            throw new Error('Duplicate reservation identifier.');
        reservationIds.add(block.id);
        whole(block.revision, 1, Number.MAX_SAFE_INTEGER, 'revision');
        if (!['fixed', 'locked', 'sleep', 'family', 'accepted'].includes(block.kind))
            throw new Error('Unknown reservation kind.');
        return { ...interval(block.startAt, block.endAt), id: block.id };
    });
    const proposal: ScheduleProposal = {
        policyVersion: 1, horizonStart: input.horizonStart, horizonEnd: input.horizonEnd, timezone: input.timezone,
        baseRevisions: {
            tasks: Object.fromEntries(input.tasks.map(t => [t.id, t.revision])),
            reserved: Object.fromEntries(input.reserved.map(r => [r.id, r.revision])),
        },
        placements: [], unplaced: [], violations: [],
    };
    for (let i = 0; i < reserved.length; i++) {
        for (let j = i + 1; j < reserved.length; j++) {
            if (reserved[i].start < reserved[j].end && reserved[j].start < reserved[i].end) {
                proposal.violations.push({ code: 'reserved-overlap', entityIds: [reserved[i].id, reserved[j].id], message: 'Protected blocks overlap. Both remain unchanged for your review.' });
            }
        }
    }
    let free = merge(input.availability.map(w => interval(w.startAt, w.endAt))
        .map(w => ({ start: Math.max(w.start, horizon.start), end: Math.min(w.end, horizon.end) }))
        .filter(w => w.end > w.start));
    for (const block of reserved)
        free = subtract(free, block);
    const pending = [...input.tasks].sort((a, b) => b.priority - a.priority
        || (a.deadlineAt ? timestamp(a.deadlineAt) : Infinity) - (b.deadlineAt ? timestamp(b.deadlineAt) : Infinity)
        || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const finished = new Map<string, number>();
    const unplaced = new Set<string>();
    while (pending.length) {
        const index = pending.findIndex(t => t.dependencies.every(d => completed.has(d) || finished.has(d) || unplaced.has(d)));
        if (index < 0)
            throw new Error('Dependency ordering could not be resolved.');
        const task = pending.splice(index, 1)[0];
        const requiredMinutes = task.durationMinutes + task.prepMinutes + task.travelMinutes + task.bufferMinutes;
        const earliest = Math.max(horizon.start, task.earliestAt ? timestamp(task.earliestAt) : horizon.start, ...task.dependencies.map(d => finished.get(d) ?? horizon.start));
        const latest = Math.min(horizon.end, task.deadlineAt ? timestamp(task.deadlineAt) : horizon.end);
        const candidates = free.map(w => ({ start: Math.max(w.start, earliest), end: Math.min(w.end, latest) })).filter(w => w.end > w.start);
        const dependencyBlocked = task.dependencies.some(d => unplaced.has(d));
        const slot = dependencyBlocked ? undefined : candidates.find(w => w.end - w.start >= requiredMinutes * minute);
        if (!slot) {
            unplaced.add(task.id);
            proposal.unplaced.push({ taskId: task.id, reason: dependencyBlocked ? 'dependency-unplaced' : 'insufficient-capacity',
                requiredMinutes, largestGapMinutes: Math.max(0, ...candidates.map(w => (w.end - w.start) / minute)),
                alternatives: dependencyBlocked ? ['Schedule the prerequisite first'] : ['Reduce scope', 'Revise the deadline', 'Change priority', 'Free available time'],
            });
            continue;
        }
        const start = slot.start + (task.prepMinutes + task.travelMinutes) * minute;
        const end = start + task.durationMinutes * minute;
        const occupiedEnd = end + task.bufferMinutes * minute;
        proposal.placements.push({ taskId: task.id, startAt: new Date(start).toISOString(), endAt: new Date(end).toISOString(),
            occupiedStartAt: new Date(slot.start).toISOString(), occupiedEndAt: new Date(occupiedEnd).toISOString(),
            reason: `Earliest available slot after prerequisites; priority ${task.priority}. Reserves ${requiredMinutes} minutes including preparation, travel and buffer. Protected blocks remain unchanged.`,
        });
        finished.set(task.id, occupiedEnd);
        free = subtract(free, { start: slot.start, end: occupiedEnd });
    }
    return proposal;
}
