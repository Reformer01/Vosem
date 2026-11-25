/** Minimal explicit state-machine contract used across the app. */
export interface Machine<S extends string, E extends string> {
  id: string;
  description: string;
  initial: S;
  states: readonly S[];
  events: readonly E[];
  transition: (state: S, event: E) => S;
}

export type TransitionMap<S extends string, E extends string> = Record<S, Partial<Record<E, S>>>;
