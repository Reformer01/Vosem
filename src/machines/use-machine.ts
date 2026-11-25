"use client";

import { useReducer } from "react";
import type { Machine } from "./types";

/** React binding for an explicit machine. Keeps components free of ad-hoc flags. */
export function useMachine<S extends string, E extends string>(machine: Machine<S, E>) {
  return useReducer((state: S, event: E) => machine.transition(state, event), machine.initial);
}
