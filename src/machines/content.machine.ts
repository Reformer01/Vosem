import { createMachine } from "./create-machine";

const moderationStates = ["draft", "pending", "approved", "rejected", "deleted"] as const;
const moderationEvents = ["SUBMIT", "APPROVE", "REJECT", "DELETE", "RESUBMIT"] as const;

export const testimonyMachine = createMachine({
  id: "testimony",
  description: "Member testimony submission and moderation.",
  initial: "draft",
  states: moderationStates,
  events: moderationEvents,
  transitions: {
    draft: { SUBMIT: "pending" },
    pending: { APPROVE: "approved", REJECT: "rejected", DELETE: "deleted" },
    rejected: { RESUBMIT: "pending", DELETE: "deleted" },
    approved: { DELETE: "deleted" },
    deleted: {},
  },
});

export const prayerMachine = createMachine({
  id: "prayer-request",
  description: "Prayer request submission and public wall moderation.",
  initial: "draft",
  states: moderationStates,
  events: moderationEvents,
  transitions: {
    draft: { SUBMIT: "pending" },
    pending: { APPROVE: "approved", REJECT: "rejected" },
    rejected: { RESUBMIT: "pending" },
    approved: {},
    deleted: {},
  },
});

export const testimonySubmissionMachine = createMachine({
  id: "testimony-submission",
  description: "Submitting a member testimony before moderation.",
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

export const rsvpMachine = createMachine({
  id: "rsvp",
  description: "Event attendance intent.",
  initial: "not-going",
  states: ["not-going", "going", "orphaned"] as const,
  events: ["RSVP", "CANCEL", "EVENT_DELETED"] as const,
  transitions: {
    "not-going": { RSVP: "going" },
    going: { CANCEL: "not-going", EVENT_DELETED: "orphaned" },
    orphaned: { CANCEL: "not-going" },
  },
});
