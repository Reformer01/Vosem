import { createMachine } from "./create-machine";

/** The submit half of prayerMachine: a request is sent once, then replaced on the next submission. */
export const prayerSubmissionMachine = createMachine({
  id: "prayer-submission",
  description: "Sending a prayer request, from draft through submit to success or failure.",
  initial: "idle",
  states: ["idle", "submitting", "success", "error"] as const,
  events: ["SUBMIT", "SUCCESS", "FAILURE", "RESET"] as const,
  transitions: {
    idle: { SUBMIT: "submitting" },
    submitting: { SUCCESS: "success", FAILURE: "error" },
    success: { SUBMIT: "submitting", RESET: "idle" },
    error: { SUBMIT: "submitting", RESET: "idle" },
  },
});
