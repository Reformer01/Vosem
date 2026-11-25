import type { Machine, TransitionMap } from "./types";

/**
 * Pure, dependency-free machine builder. Unknown events are no-ops so an
 * unexpected UI event can never corrupt a flow (safe-by-default transitions).
 */
export function createMachine<
  S extends string,
  E extends string,
  T extends TransitionMap<S, E>
>(config: {
  id: string;
  description: string;
  initial: S;
  states: readonly S[];
  events: readonly E[];
  transitions: T;
}): Machine<S, E> {
  return {
    id: config.id,
    description: config.description,
    initial: config.initial,
    states: config.states,
    events: config.events,
    transition: (state, event) => config.transitions[state]?.[event] ?? state,
  };
}
