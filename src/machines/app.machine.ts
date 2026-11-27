import { createMachine } from "./create-machine";

export const adminMachine = createMachine({
  id: "admin-gate",
  description: "Role-gated admin screen access.",
  initial: "no-user",
  states: ["no-user", "loading-role", "not-admin", "admin"] as const,
  events: ["USER_READY", "ROLE_ADMIN", "ROLE_OTHER", "SIGN_OUT"] as const,
  transitions: {
    "no-user": { USER_READY: "loading-role" },
    "loading-role": { ROLE_ADMIN: "admin", ROLE_OTHER: "not-admin", SIGN_OUT: "no-user" },
    "not-admin": { USER_READY: "loading-role", SIGN_OUT: "no-user" },
    admin: { SIGN_OUT: "no-user", ROLE_OTHER: "not-admin" },
  },
});

export const adminCrudMachine = createMachine({
  id: "admin-crud",
  description: "Guards admin writes against duplicate submits and reports failures.",
  initial: "idle",
  states: ["idle", "saving", "deleting", "success", "error"] as const,
  events: ["SUBMIT", "DELETE", "SUCCESS", "FAILURE", "RESET"] as const,
  transitions: {
    idle: { SUBMIT: "saving", DELETE: "deleting" },
    saving: { SUCCESS: "success", FAILURE: "error" },
    deleting: { SUCCESS: "success", FAILURE: "error" },
    success: { RESET: "idle", SUBMIT: "saving", DELETE: "deleting" },
    error: { RESET: "idle", SUBMIT: "saving", DELETE: "deleting" },
  },
});

export const confirmDeleteMachine = createMachine({
  id: "confirm-delete",
  description: "Confirmation and deletion state for table row actions.",
  initial: "closed",
  states: ["closed", "confirming", "deleting"] as const,
  events: ["OPEN", "CANCEL", "CONFIRM", "DONE", "FAILURE"] as const,
  transitions: {
    closed: { OPEN: "confirming" },
    confirming: { CANCEL: "closed", CONFIRM: "deleting" },
    deleting: { DONE: "closed", FAILURE: "confirming" },
  },
});

export const dashboardDataMachine = createMachine({
  id: "dashboard-data",
  description: "Combined auth + Firestore readiness for dashboard screens.",
  initial: "auth-loading",
  states: ["auth-loading", "data-loading", "ready", "empty", "error", "redirecting"] as const,
  events: ["AUTH_READY", "AUTH_MISSING", "DATA_LOADED", "DATA_EMPTY", "DATA_ERROR", "RETRY"] as const,
  transitions: {
    "auth-loading": { AUTH_READY: "data-loading", AUTH_MISSING: "redirecting" },
    "data-loading": { DATA_LOADED: "ready", DATA_EMPTY: "empty", DATA_ERROR: "error", AUTH_MISSING: "redirecting" },
    ready: { DATA_EMPTY: "empty", DATA_ERROR: "error" },
    empty: { DATA_LOADED: "ready", DATA_ERROR: "error" },
    error: { RETRY: "data-loading" },
    redirecting: {},
  },
});

export function createOverlayMachine(id: string) {
  return createMachine({
    id,
    description: "Open/closed state for sheets and dialogs.",
    initial: "closed",
    states: ["closed", "open"] as const,
    events: ["OPEN", "CLOSE", "TOGGLE"] as const,
    transitions: {
      closed: { OPEN: "open", TOGGLE: "open" },
      open: { CLOSE: "closed", TOGGLE: "closed" },
    },
  });
}

export const headerMenuMachine = createOverlayMachine("header-menu");
export const dashboardMenuMachine = createOverlayMachine("dashboard-menu");
export const givingDialogMachine = createOverlayMachine("giving-dialog");
export const deleteAccountDialogMachine = createOverlayMachine("delete-account-dialog");
export const testimonyDialogMachine = createOverlayMachine("testimony-dialog");

export const formMachine = createMachine({
  id: "form",
  description: "Shared react-hook-form lifecycle across all app forms.",
  initial: "pristine",
  states: ["pristine", "dirty", "invalid", "valid", "submitting", "success", "error"] as const,
  events: ["CHANGE", "INVALID", "VALID", "SUBMIT", "SUCCESS", "FAILURE", "RESET"] as const,
  transitions: {
    pristine: { CHANGE: "dirty", INVALID: "invalid", VALID: "valid", SUBMIT: "submitting" },
    dirty: { CHANGE: "dirty", INVALID: "invalid", VALID: "valid", SUBMIT: "submitting" },
    invalid: { CHANGE: "dirty", VALID: "valid", INVALID: "invalid" },
    valid: { CHANGE: "dirty", SUBMIT: "submitting", INVALID: "invalid" },
    submitting: { SUCCESS: "success", FAILURE: "error" },
    success: { RESET: "pristine", SUBMIT: "submitting" },
    error: { SUBMIT: "submitting", RESET: "pristine" },
  },
});
