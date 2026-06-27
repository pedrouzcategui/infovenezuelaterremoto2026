import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServerAuth } from "./supabase-auth";
import type { Profile } from "./types";

const COOKIE = "admin_session";
const OTP_COOKIE = "otp_challenge";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutos

/** Correo al que se envía el código de acceso. */
export function adminEmail(): string {
  return process.env.ADMIN_EMAIL ?? "pedro@pedrouzcategui.com";
}

/** ¿Está habilitado el login por código (OTP) por correo? */
export function otpEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Falta ADMIN_SESSION_SECRET");
  return secret;
}

/** ¿La contraseña ingresada es correcta? */
export function passwordOk(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Falta ADMIN_PASSWORD");
  // Comparación de longitud constante para evitar timing attacks básicos.
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** Perfil del usuario autenticado (vía Supabase Auth + Google), o null. */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await supabaseServerAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

/** Contraseña de respaldo (cookie) — acceso de emergencia del admin. */
async function hasPasswordSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return !!token && token === sessionSecret();
}

export async function isAdmin(): Promise<boolean> {
  if (await hasPasswordSession()) return true;
  const profile = await getCurrentProfile();
  return profile?.role === "admin" && profile.estado === "aprobado";
}

/** Envía a un usuario sin permiso al lugar correcto según su estado. */
async function redirectByEstado(): Promise<never> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login"); // sin sesión
  if (profile.estado === "aprobado") redirect("/admin"); // aprobado pero sin permiso suficiente
  redirect("/pendiente"); // pendiente o rechazado
}

/** Solo administradores (rol admin aprobado o contraseña de respaldo). */
export async function requireAdmin(): Promise<void> {
  if (await isAdmin()) return;
  await redirectByEstado();
}

/** Admin o colaborador APROBADO. Para el panel de gestión de contenido. */
export async function requireAprobado(): Promise<Profile> {
  if (await hasPasswordSession()) {
    return { id: "", email: null, nombre: "Admin", role: "admin", estado: "aprobado", created_at: "" };
  }
  const profile = await getCurrentProfile();
  if (profile && profile.estado === "aprobado") return profile;
  await redirectByEstado();
  throw new Error("unreachable");
}

/** Alias histórico. */
export const requireColaborador = requireAprobado;

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, sessionSecret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

// ---------- Código de un solo uso (OTP) por correo ----------

function sign(data: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(data).digest("hex");
}

export function generateOtp(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Guarda el reto del OTP en una cookie firmada (no almacena el código en claro). */
export async function setOtpChallenge(otp: string): Promise<void> {
  const exp = Date.now() + OTP_TTL_MS;
  const value = `${exp}.${sign(`${otp}.${exp}`)}`;
  const store = await cookies();
  store.set(OTP_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OTP_TTL_MS / 1000,
  });
}

export async function checkOtp(input: string): Promise<boolean> {
  const store = await cookies();
  const v = store.get(OTP_COOKIE)?.value;
  if (!v) return false;
  const idx = v.indexOf(".");
  if (idx < 0) return false;
  const exp = Number(v.slice(0, idx));
  const sig = v.slice(idx + 1);
  if (!exp || Date.now() > exp) return false;
  const expected = sign(`${input}.${exp}`);
  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export async function clearOtpChallenge(): Promise<void> {
  const store = await cookies();
  store.delete(OTP_COOKIE);
}

// ---------- OTP del formulario público de solicitudes ----------
// Igual que el OTP del admin, pero el reto va ligado al correo que el
// usuario escribe (para que el código solo sirva para ese correo).

const SOL_OTP_COOKIE = "sol_otp";

export async function setSolicitudOtp(email: string, otp: string): Promise<void> {
  const exp = Date.now() + OTP_TTL_MS;
  const sig = sign(`${otp}.${email.toLowerCase()}.${exp}`);
  const store = await cookies();
  store.set(SOL_OTP_COOKIE, `${exp}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OTP_TTL_MS / 1000,
  });
}

export async function checkSolicitudOtp(
  email: string,
  code: string,
): Promise<boolean> {
  const store = await cookies();
  const v = store.get(SOL_OTP_COOKIE)?.value;
  if (!v) return false;
  const idx = v.indexOf(".");
  if (idx < 0) return false;
  const exp = Number(v.slice(0, idx));
  const sig = v.slice(idx + 1);
  if (!exp || Date.now() > exp) return false;
  const expected = sign(`${code}.${email.toLowerCase()}.${exp}`);
  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export async function clearSolicitudOtp(): Promise<void> {
  const store = await cookies();
  store.delete(SOL_OTP_COOKIE);
}
