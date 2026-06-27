/** Normaliza un número a solo dígitos (para wa.me). */
export function digits(n: string | null | undefined): string {
  return (n ?? "").replace(/\D/g, "");
}

export function whatsappLink(n: string | null | undefined): string | null {
  const d = digits(n);
  return d ? `https://wa.me/${d}` : null;
}

export function instagramLink(handle: string | null | undefined): string | null {
  if (!handle) return null;
  const clean = handle.trim().replace(/^@/, "").replace(/\s+/g, "");
  return clean ? `https://instagram.com/${clean}` : null;
}

/** Texto de horario a partir de días y horas (cualquiera opcional). */
export function formatHorario(
  dias: string | null | undefined,
  inicio: string | null | undefined,
  fin: string | null | undefined,
): string | null {
  const horas = inicio && fin ? `${inicio}–${fin}` : inicio || fin || "";
  const partes = [dias?.trim(), horas].filter(Boolean);
  return partes.length ? partes.join(" · ") : null;
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
