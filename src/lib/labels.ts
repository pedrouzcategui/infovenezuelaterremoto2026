import type {
  CategoriaAnuncio,
  CategoriaServicio,
  NivelConfianza,
  TipoCentro,
} from "./types";

/** Emoji + color por categoría de servicio (para badges y pines del mapa). */
export const SERVICIO_META: Record<
  CategoriaServicio,
  { emoji: string; color: string }
> = {
  Hospital: { emoji: "🏥", color: "#ef4444" },
  "Servicios médicos": { emoji: "🩺", color: "#dc2626" },
  Farmacia: { emoji: "💊", color: "#16a34a" },
  Veterinaria: { emoji: "🐾", color: "#84cc16" },
  Negocio: { emoji: "🏢", color: "#8b5cf6" },
  "Hotel/Albergue": { emoji: "🏨", color: "#0ea5e9" },
  Refugio: { emoji: "🏠", color: "#7c3aed" },
  Transporte: { emoji: "🚗", color: "#2563eb" },
  Comida: { emoji: "🍲", color: "#d97706" },
  Agua: { emoji: "💧", color: "#0891b2" },
  Combustible: { emoji: "⛽", color: "#f59e0b" },
  Ferretería: { emoji: "🔧", color: "#ea580c" },
  Conectividad: { emoji: "📶", color: "#0d9488" },
  "Apoyo psicológico": { emoji: "🧠", color: "#ec4899" },
  Legal: { emoji: "⚖️", color: "#6366f1" },
  Otros: { emoji: "📍", color: "#64748b" },
};

export function servicioMeta(cat: string) {
  return SERVICIO_META[cat as CategoriaServicio] ?? SERVICIO_META.Otros;
}

/** Insignia visual por tipo de centro. */
export const CENTRO_TIPO_META: Record<
  TipoCentro,
  { emoji: string; badge: string }
> = {
  Gobierno: {
    emoji: "🏛️",
    badge:
      "bg-gradient-to-b from-slate-100 to-slate-400 text-slate-900 ring-white/50 shadow-[0_0_12px_rgba(226,232,240,0.4)]",
  },
  Hospital: { emoji: "🏥", badge: "bg-rose-100 text-rose-800 ring-rose-200" },
  Negocio: { emoji: "🏢", badge: "bg-violet-100 text-violet-800 ring-violet-200" },
  Informal: { emoji: "🤲", badge: "bg-amber-100 text-amber-800 ring-amber-200" },
  ONG: { emoji: "🎗️", badge: "bg-teal-100 text-teal-800 ring-teal-200" },
  Comunitario: {
    emoji: "🏘️",
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
};

/** Insignia visual por nivel de confianza. */
export const CONFIANZA_META: Record<
  NivelConfianza,
  { emoji: string; badge: string }
> = {
  Verificado: {
    emoji: "✅",
    badge:
      "bg-emerald-500 text-black ring-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.55)]",
  },
  Confiable: { emoji: "👍", badge: "bg-sky-100 text-sky-800 ring-sky-200" },
  "Por verificar": {
    emoji: "⚠️",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

/** Estilo visual por categoría de anuncio. `card` = estilo del recuadro. */
export const ANUNCIO_META: Record<
  CategoriaAnuncio,
  { label: string; badge: string; emoji: string; card: string }
> = {
  oficial: {
    label: "Oficial",
    emoji: "✅",
    badge: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30",
    card: "border border-emerald-500/40 bg-emerald-500/5",
  },
  extraoficial: {
    label: "Extraoficial",
    emoji: "📣",
    badge: "bg-white/10 text-faint ring-white/15",
    card: "border border-border bg-surface-2",
  },
  rumor: {
    label: "Rumor",
    emoji: "❓",
    badge: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
    card: "border border-dashed border-faint/50 bg-transparent",
  },
};
