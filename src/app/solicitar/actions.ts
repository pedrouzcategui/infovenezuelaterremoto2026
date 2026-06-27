"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendOtpEmail } from "@/lib/email";
import {
  checkSolicitudOtp,
  clearSolicitudOtp,
  generateOtp,
  setSolicitudOtp,
} from "@/lib/auth";
import { SOLICITUD_TIPOS } from "@/lib/types";

export type SolicitudState = {
  error?: string;
  sent?: boolean;
  ok?: boolean;
  email?: string;
};

function field(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim();
  return v ? v : null;
}

function emailValido(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/** Paso 1: valida datos + captcha y envía el código al correo. */
export async function enviarCodigoSolicitud(
  _prev: SolicitudState,
  formData: FormData,
): Promise<SolicitudState> {
  const tipo = field(formData, "tipo");
  const titulo = field(formData, "titulo");
  const nombre = field(formData, "nombre");
  const email = field(formData, "email")?.toLowerCase() ?? null;

  if (!tipo || !(SOLICITUD_TIPOS as readonly string[]).includes(tipo))
    return { error: "Selecciona un tipo de solicitud." };
  if (!titulo) return { error: "Escribe un título para tu solicitud." };
  if (!nombre) return { error: "Indica quién hace la solicitud." };
  if (!email || !emailValido(email))
    return { error: "Escribe un correo electrónico válido." };

  const token = formData.get("cf-turnstile-response") as string | null;
  if (!(await verifyTurnstile(token)))
    return { error: "No pasaste la verificación anti-robots. Intenta de nuevo." };

  const otp = generateOtp();
  await setSolicitudOtp(email, otp);
  const mail = await sendOtpEmail(email, otp);
  if (!mail.ok) return { error: mail.error ?? "No se pudo enviar el código." };

  return { sent: true, email };
}

/** Paso 2: verifica el código y crea la solicitud (queda pendiente de aprobación). */
export async function crearSolicitud(
  _prev: SolicitudState,
  formData: FormData,
): Promise<SolicitudState> {
  const email = field(formData, "email")?.toLowerCase() ?? null;
  const code = ((formData.get("code") as string | null) ?? "").trim();

  if (!email) return { error: "Falta el correo.", sent: true };
  if (!code || !(await checkSolicitudOtp(email, code)))
    return { error: "Código inválido o expirado.", sent: true, email };

  const tipo = field(formData, "tipo");
  const titulo = field(formData, "titulo");
  const nombre = field(formData, "nombre");
  if (!tipo || !titulo || !nombre)
    return { error: "Faltan datos de la solicitud.", sent: true, email };

  const { error } = await supabaseAdmin().from("solicitudes").insert({
    tipo,
    titulo,
    descripcion: field(formData, "descripcion"),
    nombre,
    email,
    telefono: field(formData, "telefono"),
    whatsapp: field(formData, "whatsapp"),
    zona: field(formData, "zona"),
    ubicacion: field(formData, "ubicacion"),
    email_verificado: true,
    estado: "pendiente",
  });
  if (error)
    return { error: `No se pudo enviar: ${error.message}`, sent: true, email };

  await clearSolicitudOtp();
  revalidatePath("/admin/solicitudes");
  return { ok: true };
}
