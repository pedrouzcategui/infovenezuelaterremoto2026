import { CENTRO_TIPO_META, CONFIANZA_META } from "@/lib/labels";
import type { Centro } from "@/lib/types";

export function CentroBadges({
  tipo,
  confianza,
  patrocinado,
}: {
  tipo: Centro["tipo"];
  confianza: Centro["confianza"];
  patrocinado?: boolean;
}) {
  if (!tipo && !confianza && !patrocinado) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {patrocinado && (
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-300 to-yellow-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_12px_rgba(251,191,36,0.55)]">
          ⭐ Patrocinado
        </span>
      )}
      {confianza && (
        <span
          className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-medium ring-1 ${CONFIANZA_META[confianza].badge}`}
        >
          {CONFIANZA_META[confianza].emoji} {confianza}
        </span>
      )}
      {tipo && (
        <span
          className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-medium ring-1 ${CENTRO_TIPO_META[tipo].badge}`}
        >
          {CENTRO_TIPO_META[tipo].emoji} {tipo}
        </span>
      )}
    </div>
  );
}
