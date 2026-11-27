import { createMachine } from "./create-machine";

/** Shared lifecycle of a Firestore snapshot subscription. */
export const dataLoadMachine = createMachine({
  id: "data-load",
  description: "Loading, populated, empty and failed states for live Firestore reads.",
  initial: "idle",
  states: ["idle", "loading", "data", "empty", "error"] as const,
  events: ["LOAD", "DATA", "EMPTY", "ERROR", "RESET"] as const,
  transitions: {
    idle: { LOAD: "loading", RESET: "idle" },
    loading: { DATA: "data", EMPTY: "empty", ERROR: "error", RESET: "idle" },
    data: { DATA: "data", EMPTY: "empty", ERROR: "error", LOAD: "loading", RESET: "idle" },
    empty: { DATA: "data", EMPTY: "empty", ERROR: "error", LOAD: "loading", RESET: "idle" },
    error: { LOAD: "loading", RESET: "idle" },
  },
});
