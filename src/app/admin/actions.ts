"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import {
  adminEmail,
  checkOtp,
  clearOtpChallenge,
  endAdminSession,
  generateOtp,
  passwordOk,
  requireAdmin,
  requireAprobado,
  setOtpChallenge,
  startAdminSession,
} from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { supabaseServerAuth } from "@/lib/supabase-auth";
import {
  CATEGORIAS_ANUNCIO,
  CATEGORIAS_SERVICIO,
  NIVELES_CONFIANZA,
  SOLICITUD_TIPOS,
  TIPOS_CENTRO,
  ZONAS,
  type CategoriaAnuncio,
  type CategoriaServicio,
  type Zona,
} from "@/lib/types";

// ---------- Auth ----------

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = (formData.get("password") as string | null) ?? "";
  if (!password || !passwordOk(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  try {
    const supabase = await supabaseServerAuth();
    await supabase.auth.signOut();
  } catch {
    /* sin sesión de Supabase */
  }
  redirect("/admin/login");
}

// ---------- Login por código (OTP) al correo del admin ----------

export type OtpState = { sent?: boolean; error?: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function enviarCodigo(_prev: OtpState): Promise<OtpState> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "Falta configurar RESEND_API_KEY." };

  const otp = generateOtp();
  await setOtpChallenge(otp);

  const from =
    process.env.EMAIL_FROM ?? "Info Venezuela Terremoto <onboarding@resend.dev>";
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: adminEmail(),
      subject: `Tu código de acceso: ${otp}`,
      text: `Tu código para entrar a la administración de Info Venezuela Terremoto es:\n\n${otp}\n\nVence en 10 minutos. Si no fuiste tú, ignora este correo.`,
    });
    if (error) return { error: "No se pudo enviar el correo. Revisa la configuración." };
  } catch {
    return { error: "No se pudo enviar el correo. Intenta de nuevo." };
  }
  return { sent: true };
}

export async function verificarCodigo(
  _prev: OtpState,
  formData: FormData,
): Promise<OtpState> {
  const code = ((formData.get("code") as string | null) ?? "").trim();
  if (!code || !(await checkOtp(code))) {
    return { sent: true, error: "Código inválido o expirado." };
  }
  await startAdminSession();
  await clearOtpChallenge();
  redirect("/admin");
}

// ---------- Helpers ----------

function str(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim();
  return v ? v : null;
}

function num(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string | null)?.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

/** Sube una imagen al bucket dado y devuelve su URL pública (o null). */
async function uploadImagen(
  fd: FormData,
  field: string,
  bucket: string,
): Promise<string | null> {
  const file = fd.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const supabase = supabaseAdmin();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// ---------- Donaciones ----------

export async function aprobarDonacion(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("donaciones")
    .update({ estado: "aprobada", reviewed_at: new Date().toISOString() })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin");
  revalidatePath("/donaciones");
}

export async function rechazarDonacion(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("donaciones")
    .update({ estado: "rechazada", reviewed_at: new Date().toISOString() })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin");
  revalidatePath("/donaciones");
}

// ---------- Centros ----------

export type FormState = { error?: string; ok?: boolean };

function centroFields(fd: FormData) {
  const tipo = str(fd, "tipo");
  const confianza = str(fd, "confianza");
  return {
    nombre: str(fd, "nombre"),
    direccion: str(fd, "direccion"),
    instagram: str(fd, "instagram"),
    whatsapp: str(fd, "whatsapp"),
    telefono: str(fd, "telefono"),
    necesidades: str(fd, "necesidades"),
    necesidades_detalle: str(fd, "necesidades_detalle"),
    maps_url: str(fd, "maps_url"),
    latitud: num(fd, "latitud"),
    longitud: num(fd, "longitud"),
    tipo: TIPOS_CENTRO.includes(tipo as never) ? tipo : null,
    confianza: NIVELES_CONFIANZA.includes(confianza as never) ? confianza : null,
    patrocinado: bool(fd, "patrocinado"),
    patrocinador_nombre: str(fd, "patrocinador_nombre"),
    dias: str(fd, "dias"),
    hora_inicio: str(fd, "hora_inicio"),
    hora_fin: str(fd, "hora_fin"),
  };
}

export async function crearCentro(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const perfil = await requireAprobado();
  const f = centroFields(formData);
  const zona = (str(formData, "zona") ?? "") as Zona;
  if (!f.nombre) return { error: "El nombre es obligatorio." };
  if (!ZONAS.includes(zona)) return { error: "Selecciona una zona válida." };

  const foto_url = await uploadImagen(formData, "foto", "centros");
  const patrocinador_logo = await uploadImagen(formData, "patrocinador_logo", "centros");
  const { error } = await supabaseAdmin()
    .from("centros")
    .insert({
      ...f,
      zona,
      ...(foto_url ? { foto_url } : {}),
      ...(patrocinador_logo ? { patrocinador_logo } : {}),
      contribuido_por: perfil.nombre ?? perfil.email ?? "Equipo",
      activo: true,
    });
  if (error) return { error: `No se pudo crear: ${error.message}` };
  revalidatePath("/admin/centros");
  revalidatePath("/");
  revalidatePath("/centros");
  return { ok: true };
}

export async function actualizarCentro(formData: FormData): Promise<void> {
  await requireAprobado();
  const id = formData.get("id") as string;
  const zona = (str(formData, "zona") ?? "") as Zona;
  const foto_url = await uploadImagen(formData, "foto", "centros");
  const patrocinador_logo = await uploadImagen(formData, "patrocinador_logo", "centros");
  const { error } = await supabaseAdmin()
    .from("centros")
    .update({
      ...centroFields(formData),
      ...(ZONAS.includes(zona) ? { zona } : {}),
      ...(foto_url ? { foto_url } : {}),
      ...(patrocinador_logo ? { patrocinador_logo } : {}),
      activo: bool(formData, "activo"),
    })
    .eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el centro: ${error.message}`);
  revalidatePath("/admin/centros");
  revalidatePath("/");
  revalidatePath("/centros");
  revalidatePath(`/centros/${id}`);
}

export async function eliminarCentro(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin().from("centros").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/centros");
  revalidatePath("/");
  revalidatePath("/centros");
}

// ---------- Servicios ----------

function servicioFields(fd: FormData) {
  return {
    nombre: str(fd, "nombre"),
    descripcion: str(fd, "descripcion"),
    zona: str(fd, "zona"),
    direccion: str(fd, "direccion"),
    instagram: str(fd, "instagram"),
    whatsapp: str(fd, "whatsapp"),
    telefono: str(fd, "telefono"),
    maps_url: str(fd, "maps_url"),
    latitud: num(fd, "latitud"),
    longitud: num(fd, "longitud"),
    costo: str(fd, "costo"),
  };
}

export async function crearServicio(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const perfil = await requireAprobado();
  const f = servicioFields(formData);
  const categoria = (str(formData, "categoria") ?? "") as CategoriaServicio;
  if (!f.nombre) return { error: "El nombre es obligatorio." };
  if (!CATEGORIAS_SERVICIO.includes(categoria))
    return { error: "Selecciona una categoría válida." };

  const foto_url = await uploadImagen(formData, "foto", "servicios");
  const { error } = await supabaseAdmin()
    .from("servicios")
    .insert({
      ...f,
      categoria,
      ...(foto_url ? { foto_url } : {}),
      contribuido_por: perfil.nombre ?? perfil.email ?? "Equipo",
      activo: true,
    });
  if (error) return { error: `No se pudo crear: ${error.message}` };
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
  return { ok: true };
}

export async function actualizarServicio(formData: FormData): Promise<void> {
  await requireAprobado();
  const id = formData.get("id") as string;
  const categoria = (str(formData, "categoria") ?? "") as CategoriaServicio;
  const foto_url = await uploadImagen(formData, "foto", "servicios");
  await supabaseAdmin()
    .from("servicios")
    .update({
      ...servicioFields(formData),
      ...(CATEGORIAS_SERVICIO.includes(categoria) ? { categoria } : {}),
      ...(foto_url ? { foto_url } : {}),
      activo: bool(formData, "activo"),
    })
    .eq("id", id);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

export async function eliminarServicio(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin().from("servicios").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

// ---------- Anuncios ----------

export async function crearAnuncio(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAprobado();
  const titulo = str(formData, "titulo");
  const contenido = str(formData, "contenido");
  const categoria = (str(formData, "categoria") ?? "") as CategoriaAnuncio;
  if (!titulo || !contenido) return { error: "Título y contenido son obligatorios." };
  if (!CATEGORIAS_ANUNCIO.includes(categoria))
    return { error: "Selecciona una categoría." };

  const logo_url = await uploadImagen(formData, "logo", "anuncios");
  const imagen_url = await uploadImagen(formData, "imagen", "anuncios");
  const { error } = await supabaseAdmin().from("anuncios").insert({
    titulo,
    contenido,
    categoria,
    fuente: str(formData, "fuente"),
    ...(logo_url ? { logo_url } : {}),
    ...(imagen_url ? { imagen_url } : {}),
    fijado: bool(formData, "fijado"),
    activo: true,
  });
  if (error) return { error: `No se pudo crear: ${error.message}` };
  revalidatePath("/admin/anuncios");
  revalidatePath("/anuncios");
  return { ok: true };
}

export async function actualizarAnuncio(formData: FormData): Promise<void> {
  await requireAprobado();
  const categoria = (str(formData, "categoria") ?? "") as CategoriaAnuncio;
  const logo_url = await uploadImagen(formData, "logo", "anuncios");
  const imagen_url = await uploadImagen(formData, "imagen", "anuncios");
  await supabaseAdmin()
    .from("anuncios")
    .update({
      titulo: str(formData, "titulo"),
      contenido: str(formData, "contenido"),
      ...(CATEGORIAS_ANUNCIO.includes(categoria) ? { categoria } : {}),
      fuente: str(formData, "fuente"),
      ...(logo_url ? { logo_url } : {}),
      ...(imagen_url ? { imagen_url } : {}),
      fijado: bool(formData, "fijado"),
      activo: bool(formData, "activo"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/anuncios");
  revalidatePath("/anuncios");
}

export async function eliminarAnuncio(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin().from("anuncios").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/anuncios");
  revalidatePath("/anuncios");
}

// ---------- Instituciones para donar dinero ----------

export async function crearInstitucion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAprobado();
  const nombre = str(formData, "nombre");
  if (!nombre) return { error: "El nombre es obligatorio." };
  const logo = await uploadImagen(formData, "logo", "instituciones");
  const { error } = await supabaseAdmin().from("instituciones").insert({
    nombre,
    descripcion: str(formData, "descripcion"),
    enlace: str(formData, "enlace"),
    categoria: str(formData, "categoria"),
    ...(logo ? { logo } : {}),
    fijado: bool(formData, "fijado"),
    activo: true,
  });
  if (error) return { error: `No se pudo crear: ${error.message}` };
  revalidatePath("/admin");
  revalidatePath("/donaciones");
  return { ok: true };
}

export async function actualizarInstitucion(formData: FormData): Promise<void> {
  await requireAprobado();
  const logo = await uploadImagen(formData, "logo", "instituciones");
  await supabaseAdmin()
    .from("instituciones")
    .update({
      nombre: str(formData, "nombre"),
      descripcion: str(formData, "descripcion"),
      enlace: str(formData, "enlace"),
      categoria: str(formData, "categoria"),
      ...(logo ? { logo } : {}),
      fijado: bool(formData, "fijado"),
      activo: bool(formData, "activo"),
    })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin");
  revalidatePath("/donaciones");
}

export async function eliminarInstitucion(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("instituciones")
    .delete()
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin");
  revalidatePath("/donaciones");
}

// ---------- Países que ayudan ----------

export async function crearPais(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAprobado();
  const pais = str(formData, "pais");
  const descripcion = str(formData, "descripcion");
  if (!pais || !descripcion)
    return { error: "País y descripción son obligatorios." };

  const { error } = await supabaseAdmin().from("paises_ayuda").insert({
    pais,
    bandera: str(formData, "bandera"),
    descripcion,
    monto: str(formData, "monto"),
    fuente: str(formData, "fuente"),
    fijado: bool(formData, "fijado"),
    activo: true,
  });
  if (error) return { error: `No se pudo guardar: ${error.message}` };
  revalidatePath("/admin/paises");
  revalidatePath("/paises");
  return { ok: true };
}

export async function actualizarPais(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("paises_ayuda")
    .update({
      pais: str(formData, "pais"),
      bandera: str(formData, "bandera"),
      descripcion: str(formData, "descripcion"),
      monto: str(formData, "monto"),
      fuente: str(formData, "fuente"),
      fijado: bool(formData, "fijado"),
      activo: bool(formData, "activo"),
    })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/paises");
  revalidatePath("/paises");
}

export async function eliminarPais(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("paises_ayuda")
    .delete()
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/paises");
  revalidatePath("/paises");
}

// ---------- Usuarios y roles ----------

export async function aprobarUsuario(formData: FormData): Promise<void> {
  await requireAdmin();
  await supabaseAdmin()
    .from("profiles")
    .update({ estado: "aprobado" })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/usuarios");
}

export async function rechazarUsuario(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const supabase = supabaseAdmin();
  // Elimina la cuenta de Auth; el perfil se borra en cascada.
  const { error } = await supabase.auth.admin.deleteUser(id);
  // Respaldo: si no se pudo borrar el usuario de Auth, al menos quita el perfil.
  if (error) await supabase.from("profiles").delete().eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function cambiarRol(formData: FormData): Promise<void> {
  await requireAdmin();
  const rol = formData.get("rol") === "admin" ? "admin" : "colaborador";
  await supabaseAdmin()
    .from("profiles")
    .update({ role: rol })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/usuarios");
}

// ---------- Solicitudes públicas ----------

/** El admin crea y publica una solicitud directamente (sin captcha ni OTP). */
export async function crearSolicitudAdmin(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAprobado();
  const tipo = str(formData, "tipo");
  const titulo = str(formData, "titulo");
  const nombre = str(formData, "nombre");
  if (!tipo || !(SOLICITUD_TIPOS as readonly string[]).includes(tipo))
    return { error: "Selecciona un tipo de solicitud." };
  if (!titulo) return { error: "El título es obligatorio." };
  if (!nombre) return { error: "Indica quién hace la solicitud." };

  const { error } = await supabaseAdmin().from("solicitudes").insert({
    tipo,
    titulo,
    descripcion: str(formData, "descripcion"),
    nombre,
    email: str(formData, "email"),
    telefono: str(formData, "telefono"),
    whatsapp: str(formData, "whatsapp"),
    zona: str(formData, "zona"),
    ubicacion: str(formData, "ubicacion"),
    email_verificado: true,
    estado: "aprobada",
  });
  if (error) return { error: `No se pudo crear: ${error.message}` };
  revalidatePath("/admin/solicitudes");
  revalidatePath("/solicitudes");
  return { ok: true };
}

export async function aprobarSolicitud(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("solicitudes")
    .update({ estado: "aprobada" })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/solicitudes");
}

/** Archiva una solicitud ya resuelta (sale de la lista pública). */
export async function completarSolicitud(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("solicitudes")
    .update({ estado: "completada" })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/solicitudes");
}

/** Reabre una solicitud (vuelve a aparecer en la lista pública). */
export async function reabrirSolicitud(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("solicitudes")
    .update({ estado: "aprobada" })
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/solicitudes");
}

export async function eliminarSolicitud(formData: FormData): Promise<void> {
  await requireAprobado();
  await supabaseAdmin()
    .from("solicitudes")
    .delete()
    .eq("id", formData.get("id") as string);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/solicitudes");
}

// ---------- Comentarios (moderación) ----------

export async function ocultarComentario(formData: FormData): Promise<void> {
  await requireAprobado();
  const id = formData.get("id") as string;
  const oculto = bool(formData, "oculto");
  await supabaseAdmin().from("comentarios").update({ oculto: !oculto }).eq("id", id);
  revalidatePath("/admin/comentarios");
  const centroId = formData.get("centro_id") as string | null;
  if (centroId) revalidatePath(`/centros/${centroId}`);
}

export async function eliminarComentario(formData: FormData): Promise<void> {
  await requireAprobado();
  const id = formData.get("id") as string;
  await supabaseAdmin().from("comentarios").delete().eq("id", id);
  revalidatePath("/admin/comentarios");
  const centroId = formData.get("centro_id") as string | null;
  if (centroId) revalidatePath(`/centros/${centroId}`);
}
