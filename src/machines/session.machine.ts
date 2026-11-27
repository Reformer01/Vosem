import { createMachine } from "./create-machine";

/** The dashboard/admin session guard: a checked cookie plus a live Firestore record. */
export const sessionGuardMachine = createMachine({
  id: "session-guard",
  description: "Validation of the DB-backed session before protected pages render.",
  initial: "checking",
  states: ["checking", "valid", "invalid"] as const,
  events: ["VALID", "INVALID", "RESET"] as const,
  transitions: {
    checking: { VALID: "valid", INVALID: "invalid", RESET: "checking" },
    valid: { INVALID: "invalid", RESET: "checking" },
    invalid: { RESET: "checking" },
  },
});
