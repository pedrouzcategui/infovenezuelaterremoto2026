"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export type ComentarioState = { ok: boolean; error?: string };

export async function agregarComentario(
  _prev: ComentarioState,
  formData: FormData,
): Promise<ComentarioState> {
  const centroId = (formData.get("centro_id") as string | null)?.trim() ?? "";
  const autor = (formData.get("autor") as string | null)?.trim() ?? "";
  const contenido = (formData.get("contenido") as string | null)?.trim() ?? "";

  if (!centroId) return { ok: false, error: "Centro inválido." };
  if (!autor) return { ok: false, error: "Pon tu nombre." };
  if (!contenido) return { ok: false, error: "Escribe tu comentario." };
  if (contenido.length > 800) return { ok: false, error: "Comentario muy largo." };

  const { error } = await supabaseAdmin().from("comentarios").insert({
    centro_id: centroId,
    autor: autor.slice(0, 80),
    contenido,
    oculto: true, // queda pendiente hasta que un admin lo apruebe
  });
  if (error) return { ok: false, error: "No se pudo enviar. Intenta de nuevo." };

  revalidatePath("/admin/comentarios");
  return { ok: true };
}

export async function reportarComentario(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const centroId = formData.get("centro_id") as string;
  if (!id) return;
  await supabaseAdmin().rpc("reportar_comentario", { p_id: id });
  if (centroId) revalidatePath(`/centros/${centroId}`);
  revalidatePath("/admin/comentarios");
}
