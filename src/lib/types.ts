export const ZONAS = [
  "Los Teques",
  "Carrizal",
  "San Antonio de los Altos",
  "San Pedro de los Altos",
  "San Diego de los Altos",
  "Caracas",
  "La Guaira",
  "El Junquito",
] as const;

export type Zona = (typeof ZONAS)[number];

export type EstadoDonacion = "pendiente" | "aprobada" | "rechazada";

export const CATEGORIAS_SERVICIO = [
  "Hospital",
  "Servicios médicos",
  "Farmacia",
  "Veterinaria",
  "Negocio",
  "Hotel/Albergue",
  "Refugio",
  "Transporte",
  "Comida",
  "Agua",
  "Combustible",
  "Ferretería",
  "Conectividad",
  "Apoyo psicológico",
  "Legal",
  "Otros",
] as const;

export type CategoriaServicio = (typeof CATEGORIAS_SERVICIO)[number];

// ¿El servicio es gratuito o tiene costo?
export const COSTOS = ["Gratis", "Pago"] as const;
export type Costo = (typeof COSTOS)[number];

export const CATEGORIAS_ANUNCIO = ["oficial", "extraoficial", "rumor"] as const;
export type CategoriaAnuncio = (typeof CATEGORIAS_ANUNCIO)[number];

// Tipos de solicitud / pedido de ayuda (form público).
export const SOLICITUD_TIPOS = [
  "Donantes de sangre",
  "Inspección / Ingeniería",
  "Rescate",
  "Comida",
  "Agua",
  "Medicinas",
  "Voluntarios",
  "Transporte",
  "Refugio / Albergue",
  "Ropa",
  "Apoyo psicológico",
  "Mascotas",
  "Otro",
] as const;
export type SolicitudTipo = (typeof SOLICITUD_TIPOS)[number];


// Insignia / tipo de centro de acopio.
export const TIPOS_CENTRO = [
  "Gobierno",
  "Hospital",
  "Negocio",
  "Informal",
  "ONG",
  "Comunitario",
] as const;
export type TipoCentro = (typeof TIPOS_CENTRO)[number];

// Nivel de confianza (qué tan verificado está el centro).
export const NIVELES_CONFIANZA = [
  "Verificado",
  "Confiable",
  "Por verificar",
] as const;
export type NivelConfianza = (typeof NIVELES_CONFIANZA)[number];

export interface Centro {
  id: string;
  nombre: string;
  zona: Zona;
  direccion: string | null;
  instagram: string | null;
  whatsapp: string | null;
  telefono: string | null;
  necesidades: string | null;
  necesidades_detalle: string | null;
  maps_url: string | null;
  latitud: number | null;
  longitud: number | null;
  tipo: TipoCentro | null;
  confianza: NivelConfianza | null;
  foto_url: string | null;
  patrocinado: boolean;
  patrocinador_nombre: string | null;
  patrocinador_logo: string | null;
  contribuido_por: string | null;
  activo: boolean;
  created_at: string;
}

export interface Donacion {
  id: string;
  centro_id: string;
  donante_nombre: string;
  donante_whatsapp: string | null;
  items: string;
  foto_url: string | null;
  cedula_path: string | null;
  estado: EstadoDonacion;
  created_at: string;
  reviewed_at: string | null;
  centros?: Pick<Centro, "nombre" | "zona"> | null;
}

export interface Servicio {
  id: string;
  nombre: string;
  categoria: CategoriaServicio;
  descripcion: string | null;
  zona: Zona | null;
  direccion: string | null;
  instagram: string | null;
  whatsapp: string | null;
  telefono: string | null;
  maps_url: string | null;
  latitud: number | null;
  longitud: number | null;
  costo: Costo | null;
  foto_url: string | null;
  votos_positivos: number;
  votos_negativos: number;
  reportes: number;
  contribuido_por: string | null;
  activo: boolean;
  created_at: string;
}

export interface Anuncio {
  id: string;
  titulo: string;
  contenido: string;
  categoria: CategoriaAnuncio;
  fuente: string | null;
  logo_url: string | null;
  imagen_url: string | null;
  fijado: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Solicitud {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  nombre: string;
  email: string;
  telefono: string | null;
  whatsapp: string | null;
  zona: string | null;
  ubicacion: string | null;
  email_verificado: boolean;
  estado: "pendiente" | "aprobada" | "rechazada" | "completada";
  created_at: string;
}

export interface Comentario {
  id: string;
  centro_id: string;
  autor: string;
  contenido: string;
  reportes: number;
  oculto: boolean;
  created_at: string;
}

export type Rol = "admin" | "colaborador";
export type EstadoPerfil = "pendiente" | "aprobado" | "rechazado";

export interface Profile {
  id: string;
  email: string | null;
  nombre: string | null;
  role: Rol;
  estado: EstadoPerfil;
  created_at: string;
}

export interface Institucion {
  id: string;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  enlace: string | null;
  categoria: string | null;
  fijado: boolean;
  activo: boolean;
  created_at: string;
}

export interface PaisAyuda {
  id: string;
  pais: string;
  bandera: string | null;
  descripcion: string;
  monto: string | null;
  fuente: string | null;
  fijado: boolean;
  activo: boolean;
  created_at: string;
}

