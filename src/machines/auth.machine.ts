import { createMachine } from "./create-machine";

/** Firebase session. Replaces implicit combinations of user / isUserLoading / userError. */
export const authSessionMachine = createMachine({
  id: "auth-session",
  description: "Signed-in state of the member portal.",
  initial: "init",
  states: ["init", "loading", "authenticated", "anonymous", "error", "missing-config"] as const,
  events: ["INIT", "MISSING_CONFIG", "SIGNED_IN", "SIGNED_OUT", "ERROR", "RETRY"] as const,
  transitions: {
    init: { INIT: "loading", MISSING_CONFIG: "missing-config" },
    loading: { SIGNED_IN: "authenticated", SIGNED_OUT: "anonymous", ERROR: "error" },
    authenticated: { SIGNED_OUT: "anonymous", ERROR: "error" },
    anonymous: { SIGNED_IN: "authenticated" },
    error: { RETRY: "loading" },
    "missing-config": { RETRY: "loading" },
  },
});

export const loginMachine = createMachine({
  id: "login",
  description: "Sign-in form lifecycle.",
  initial: "checking-auth",
  states: ["checking-auth", "ready", "submitting", "error", "redirecting"] as const,
  events: ["AUTH_RESOLVED", "SIGNED_IN", "SUBMIT", "SUCCESS", "FAILURE", "RESET"] as const,
  transitions: {
    "checking-auth": { AUTH_RESOLVED: "ready", SIGNED_IN: "redirecting" },
    ready: { SUBMIT: "submitting" },
    submitting: { SUCCESS: "redirecting", FAILURE: "error" },
    error: { SUBMIT: "submitting", RESET: "ready" },
    redirecting: {},
  },
});

export const signupMachine = createMachine({
  id: "signup",
  description: "Registration lifecycle, including the post-auth profile write.",
  initial: "checking-auth",
  states: ["checking-auth", "ready", "submitting", "creating-profile", "error", "redirecting"] as const,
  events: ["AUTH_RESOLVED", "SIGNED_IN", "SUBMIT", "AUTH_CREATED", "PROFILE_SAVED", "FAILURE", "RESET"] as const,
  transitions: {
    "checking-auth": { AUTH_RESOLVED: "ready", SIGNED_IN: "redirecting" },
    ready: { SUBMIT: "submitting" },
    submitting: { AUTH_CREATED: "creating-profile", FAILURE: "error" },
    "creating-profile": { PROFILE_SAVED: "redirecting", FAILURE: "error" },
    error: { SUBMIT: "submitting", RESET: "ready" },
    redirecting: {},
  },
});
