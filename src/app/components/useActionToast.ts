"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Muestra un toast cuando cambia el estado de un server action
 * (useActionState): éxito si `state.ok`, error si `state.error`.
 */
export function useActionToast(
  state: { ok?: boolean; error?: string },
  okMsg: string,
) {
  const last = useRef<unknown>(null);
  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.ok) toast.success(okMsg);
    else if (state.error) toast.error(state.error);
  }, [state, okMsg]);
}
