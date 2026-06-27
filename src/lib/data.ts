import { supabasePublic } from "./supabase";
import { servicioMeta } from "./labels";
import type {
  Anuncio,
  Centro,
  Comentario,
  Donacion,
  Institucion,
  PaisAyuda,
  Servicio,
  Solicitud,
} from "./types";
import type { PuntoMapa } from "@/app/mapa/MapaView";

/** Centros activos, ordenados por zona y nombre (lectura pública). */
export async function getCentros(): Promise<Centro[]> {
  const { data, error } = await supabasePublic()
    .from("centros")
    .select("*")
    .eq("activo", true)
    .order("zona", { ascending: true })
    .order("nombre", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as Centro[];
  // Patrocinados primero (orden estable; resiliente si la columna aún no existe).
  return rows.sort((a, b) => Number(!!b.patrocinado) - Number(!!a.patrocinado));
}

/** Un centro por id (lectura pública). */
export async function getCentro(id: string): Promise<Centro | null> {
  const { data } = await supabasePublic()
    .from("centros")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();
  return (data as Centro) ?? null;
}

/** Donaciones aprobadas, más recientes primero (lectura pública). */
export async function getDonacionesAprobadas(): Promise<Donacion[]> {
  const { data, error } = await supabasePublic()
    .from("donaciones")
    .select("*, centros(nombre, zona)")
    .eq("estado", "aprobada")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Donacion[];
}

/** Servicios activos (lectura pública). */
export async function getServicios(): Promise<Servicio[]> {
  const { data, error } = await supabasePublic()
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Servicio[];
}

/** Anuncios activos: fijados primero, luego más recientes (lectura pública). */
export async function getAnuncios(): Promise<Anuncio[]> {
  const { data, error } = await supabasePublic()
    .from("anuncios")
    .select("*")
    .eq("activo", true)
    .order("fijado", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Anuncio[];
}

/** Un anuncio por id (lectura pública). */
export async function getAnuncio(id: string): Promise<Anuncio | null> {
  const { data } = await supabasePublic()
    .from("anuncios")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();
  return (data as Anuncio) ?? null;
}

/** Instituciones oficiales para donar dinero (lectura pública). */
export async function getInstituciones(): Promise<Institucion[]> {
  const { data, error } = await supabasePublic()
    .from("instituciones")
    .select("*")
    .eq("activo", true)
    .order("fijado", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return []; // resiliente: la tabla puede no existir aún
  return (data ?? []) as Institucion[];
}

/** Solicitudes aprobadas, más recientes primero (lectura pública). */
export async function getSolicitudesAprobadas(): Promise<Solicitud[]> {
  const { data, error } = await supabasePublic()
    .from("solicitudes")
    .select("*")
    .eq("estado", "aprobada")
    .order("created_at", { ascending: false });
  if (error) return []; // resiliente: la tabla puede no existir aún
  return (data ?? []) as Solicitud[];
}

/** Países / instituciones que han ayudado (lectura pública). */
export async function getPaisesAyuda(): Promise<PaisAyuda[]> {
  const { data, error } = await supabasePublic()
    .from("paises_ayuda")
    .select("*")
    .eq("activo", true)
    .order("fijado", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaisAyuda[];
}

/** Comentarios visibles de un centro, más recientes primero (lectura pública). */
export async function getComentarios(centroId: string): Promise<Comentario[]> {
  const { data, error } = await supabasePublic()
    .from("comentarios")
    .select("*")
    .eq("centro_id", centroId)
    .eq("oculto", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Comentario[];
}

/** Puntos para el mapa: centros + servicios que tengan coordenadas. */
export async function getPuntosMapa(): Promise<PuntoMapa[]> {
  const [centros, servicios] = await Promise.all([getCentros(), getServicios()]);
  const puntos: PuntoMapa[] = [];

  for (const c of centros) {
    if (c.latitud == null || c.longitud == null) continue;
    puntos.push({
      id: c.id,
      tipo: "centro",
      grupo: "Centros de acopio",
      nombre: c.nombre,
      lat: c.latitud,
      lng: c.longitud,
      color: "#10b981",
      emoji: "🤝",
      foto: c.foto_url,
      detalle: [
        "Centro de acopio",
        c.tipo,
        c.confianza ? `Confianza: ${c.confianza}` : null,
        c.zona,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/centros/${c.id}`,
      hrefLabel: "Ver centro",
    });
  }

  for (const s of servicios) {
    if (s.latitud == null || s.longitud == null) continue;
    const meta = servicioMeta(s.categoria);
    puntos.push({
      id: s.id,
      tipo: "servicio",
      grupo: s.categoria,
      nombre: s.nombre,
      lat: s.latitud,
      lng: s.longitud,
      color: meta.color,
      emoji: meta.emoji,
      foto: s.foto_url,
      detalle: s.costo ? `${s.categoria} · ${s.costo}` : s.categoria,
      href: "/servicios",
      hrefLabel: "Ver servicios",
    });
  }

  return puntos;
}
