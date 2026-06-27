"use client";

import { useTransition } from "react";
import { toast } from "sonner";

/**
 * Form que ejecuta un server action (que no devuelve estado) y muestra un
 * toast de éxito o error. Úsalo para acciones de editar / eliminar.
 * `confirm` muestra un confirm() antes de ejecutar.
 */
export function ToastForm({
  action,
  successMsg,
  confirm,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  successMsg: string;
  confirm?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [, start] = useTransition();

  return (
    <form
      className={className}
      action={(fd) => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          try {
            await action(fd);
            toast.success(successMsg);
          } catch (e) {
            // Re-lanza los redirects de Next (p. ej. sesión expirada).
            const digest = (e as { digest?: string })?.digest;
            if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))
              throw e;
            toast.error(
              e instanceof Error ? e.message : "Ocurrió un error.",
            );
          }
        });
      }}
    >
      {children}
    </form>
  );
}
