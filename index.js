export const name = 'dsh-session-completion';
export const inject = ['sessionProjections'];
export const KEY = 'local.sessionCompletion';

// A scalar is sufficient: timestamp of the latest successful own turn, or null.
const timestampSchema = {
  parse(value) {
    if (value === null || (Number.isSafeInteger(value) && value > 0)) return value;
    throw new TypeError('Expected a completion timestamp or null');
  },
};

export const projection = {
  key: KEY,
  stateVersion: 1,
  stateSchema: {
    parse(value) {
      if (value === null) return value;
      if (value === undefined || !Number.isSafeInteger(value.ownFrom) || value.ownFrom < 0) {
        throw new TypeError('Expected a session completion state');
      }
      return { ownFrom: value.ownFrom, completedAt: timestampSchema.parse(value.completedAt) };
    },
  },
  init(header, inheritedEventCount) {
    return header.origin === 'subagent' ? null : { ownFrom: inheritedEventCount, completedAt: null };
  },
  apply(state, event) {
    if (state === null || event.seq < state.ownFrom) return state;
    if (event.type !== 'turn/start' && event.type !== 'turn/end') return state;
    const completedAt = event.type === 'turn/end' && event.data.reason.kind === 'completed'
      ? event.time
      : null;
    return completedAt === state.completedAt ? state : { ...state, completedAt };
  },
  wire: { viewSchema: timestampSchema, view: (state) => state?.completedAt ?? null },
};

export async function apply(ctx) {
  await ctx.sessionProjections.register(projection);
}
