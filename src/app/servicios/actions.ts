"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export async function votarServicio(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const tipo = formData.get("tipo") as string; // "up" | "down"
  if (!id || (tipo !== "up" && tipo !== "down")) return;
  await supabaseAdmin().rpc("votar_servicio", { p_id: id, p_tipo: tipo });
  revalidatePath("/servicios");
}

export async function reportarServicio(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  await supabaseAdmin().rpc("reportar_servicio", { p_id: id });
  revalidatePath("/servicios");
  revalidatePath("/admin/servicios");
}
