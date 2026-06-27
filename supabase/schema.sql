-- =============================================================
-- Centros de Acopio — esquema de base de datos (Supabase / Postgres)
-- Ejecuta todo esto en: Supabase > SQL Editor > New query > Run
-- =============================================================

-- --- Tabla: centros de acopio ---
create table if not exists public.centros (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  zona         text not null check (zona in ('Los Teques', 'Carrizal', 'San Antonio de los Altos')),
  direccion    text,
  instagram    text,          -- handle sin @, ej: "centroacopio.lt"
  whatsapp     text,          -- solo dígitos con código país, ej: "584141234567"
  telefono     text,
  necesidades  text,          -- texto libre: "Agua, medicinas, pañales..."
  maps_url     text,          -- link de Google Maps (opcional)
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- --- Tabla: donaciones registradas ---
create table if not exists public.donaciones (
  id               uuid primary key default gen_random_uuid(),
  centro_id        uuid not null references public.centros(id) on delete cascade,
  donante_nombre   text not null,
  donante_whatsapp text,
  items            text not null,        -- qué donó: "10 litros de agua, ropa..."
  foto_url         text,                 -- foto de la donación (prueba)
  estado           text not null default 'pendiente'
                     check (estado in ('pendiente', 'aprobada', 'rechazada')),
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz
);

create index if not exists donaciones_estado_idx on public.donaciones (estado);
create index if not exists donaciones_centro_idx on public.donaciones (centro_id);

-- =============================================================
-- Row Level Security
-- El público (anon key) solo puede LEER centros activos y donaciones aprobadas.
-- Todas las escrituras pasan por el service_role (servidor), que ignora RLS.
-- =============================================================
alter table public.centros    enable row level security;
alter table public.donaciones enable row level security;

drop policy if exists "centros: lectura pública" on public.centros;
create policy "centros: lectura pública"
  on public.centros for select
  using (activo = true);

drop policy if exists "donaciones: lectura pública aprobadas" on public.donaciones;
create policy "donaciones: lectura pública aprobadas"
  on public.donaciones for select
  using (estado = 'aprobada');

-- =============================================================
-- Storage: bucket público para las fotos de las donaciones
-- =============================================================
insert into storage.buckets (id, name, public)
values ('donaciones', 'donaciones', true)
on conflict (id) do nothing;

drop policy if exists "donaciones bucket: lectura pública" on storage.objects;
create policy "donaciones bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'donaciones');

-- =============================================================
-- v2: coordenadas para el mapa, servicios, anuncios y comentarios
-- (idempotente: puedes correr este bloque aunque ya hayas corrido lo de arriba)
-- =============================================================

-- --- Coordenadas en centros (para el mapa) ---
alter table public.centros add column if not exists latitud  double precision;
alter table public.centros add column if not exists longitud double precision;

-- --- Directorio de servicios (curado por el admin) ---
create table if not exists public.servicios (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,
  categoria        text not null,        -- Farmacia, Servicios médicos, Ferretería, Transporte, etc.
  descripcion      text,
  zona             text,
  direccion        text,
  instagram        text,
  whatsapp         text,
  telefono         text,
  maps_url         text,
  latitud          double precision,
  longitud         double precision,
  votos_positivos  integer not null default 0,
  votos_negativos  integer not null default 0,
  reportes         integer not null default 0,
  activo           boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists servicios_categoria_idx on public.servicios (categoria);

-- --- Anuncios (solo el admin los crea/edita) ---
create table if not exists public.anuncios (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  contenido   text not null,
  categoria   text not null check (categoria in ('oficial', 'extraoficial', 'rumor')),
  fuente      text,                       -- link o fuente (opcional)
  fijado      boolean not null default false,
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists anuncios_categoria_idx on public.anuncios (categoria);

-- --- Comentarios en centros (públicos, en vivo, reportables) ---
create table if not exists public.comentarios (
  id          uuid primary key default gen_random_uuid(),
  centro_id   uuid not null references public.centros(id) on delete cascade,
  autor       text not null,
  contenido   text not null,
  reportes    integer not null default 0,
  oculto      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists comentarios_centro_idx on public.comentarios (centro_id);

-- --- RLS de las tablas nuevas ---
alter table public.servicios   enable row level security;
alter table public.anuncios    enable row level security;
alter table public.comentarios enable row level security;

drop policy if exists "servicios: lectura pública" on public.servicios;
create policy "servicios: lectura pública"
  on public.servicios for select using (activo = true);

drop policy if exists "anuncios: lectura pública" on public.anuncios;
create policy "anuncios: lectura pública"
  on public.anuncios for select using (activo = true);

drop policy if exists "comentarios: lectura pública" on public.comentarios;
create policy "comentarios: lectura pública"
  on public.comentarios for select using (oculto = false);

-- =============================================================
-- Funciones atómicas para votos y reportes (se llaman desde el servidor)
-- =============================================================
create or replace function public.votar_servicio(p_id uuid, p_tipo text)
returns void language sql as $$
  update public.servicios
  set votos_positivos = votos_positivos + (case when p_tipo = 'up'   then 1 else 0 end),
      votos_negativos = votos_negativos + (case when p_tipo = 'down' then 1 else 0 end)
  where id = p_id and activo = true;
$$;

create or replace function public.reportar_servicio(p_id uuid)
returns void language sql as $$
  update public.servicios set reportes = reportes + 1 where id = p_id;
$$;

create or replace function public.reportar_comentario(p_id uuid)
returns void language sql as $$
  update public.comentarios set reportes = reportes + 1 where id = p_id;
$$;

-- =============================================================
-- v3: insignia (tipo), nivel de confianza y sección de buenas noticias
-- (idempotente)
-- =============================================================

-- Insignia del centro (Gobierno / Negocio / Informal / ONG / Comunitario) y
-- nivel de confianza (Verificado / Confiable / Por verificar). Ambos opcionales.
alter table public.centros add column if not exists tipo      text;
alter table public.centros add column if not exists confianza text;

create table if not exists public.buenas_noticias (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  contenido   text not null,
  institucion text,                       -- gobierno / institución / empresa
  fuente      text,                       -- link (opcional)
  fijado      boolean not null default false,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.buenas_noticias enable row level security;

drop policy if exists "buenas_noticias: lectura pública" on public.buenas_noticias;
create policy "buenas_noticias: lectura pública"
  on public.buenas_noticias for select using (activo = true);

-- =============================================================
-- v4: agregar Caracas como zona válida (idempotente)
-- =============================================================
alter table public.centros drop constraint if exists centros_zona_check;
alter table public.centros add constraint centros_zona_check
  check (zona in ('Los Teques', 'Carrizal', 'San Antonio de los Altos', 'Caracas'));

-- =============================================================
-- v5: países / instituciones internacionales que han ayudado (idempotente)
-- =============================================================
create table if not exists public.paises_ayuda (
  id          uuid primary key default gen_random_uuid(),
  pais        text not null,
  bandera     text,                       -- emoji de bandera, ej: 🇪🇸
  descripcion text not null,              -- en qué consiste la ayuda
  monto       text,                       -- ej: "$3.000.000" (opcional)
  fuente      text,                       -- link (opcional)
  fijado      boolean not null default false,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.paises_ayuda enable row level security;

drop policy if exists "paises_ayuda: lectura pública" on public.paises_ayuda;
create policy "paises_ayuda: lectura pública"
  on public.paises_ayuda for select using (activo = true);

-- =============================================================
-- v6: categoría para noticias (idempotente)
-- =============================================================
alter table public.buenas_noticias add column if not exists categoria text;

-- =============================================================
-- v7: ¿el servicio es gratis o tiene costo? (idempotente)
-- =============================================================
alter table public.servicios add column if not exists costo text;

-- =============================================================
-- v8: foto de portada de los centros + bucket de almacenamiento
-- =============================================================
alter table public.centros add column if not exists foto_url text;

insert into storage.buckets (id, name, public)
values ('centros', 'centros', true)
on conflict (id) do nothing;

drop policy if exists "centros bucket: lectura pública" on storage.objects;
create policy "centros bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'centros');

-- =============================================================
-- v9: KYC — cédula del donante (bucket PRIVADO, solo admin via service_role)
-- =============================================================
alter table public.donaciones add column if not exists cedula_path text;

-- Bucket privado: SIN política de lectura pública. El admin lo ve con URLs firmadas.
insert into storage.buckets (id, name, public)
values ('cedulas', 'cedulas', false)
on conflict (id) do nothing;

-- =============================================================
-- v10: descripción de necesidades del centro + foto de servicios
-- =============================================================
alter table public.centros add column if not exists necesidades_detalle text;
alter table public.servicios add column if not exists foto_url text;

insert into storage.buckets (id, name, public)
values ('servicios', 'servicios', true)
on conflict (id) do nothing;

drop policy if exists "servicios bucket: lectura pública" on storage.objects;
create policy "servicios bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'servicios');

-- =============================================================
-- v11: cuentas y roles (Supabase Auth + Google)
-- Cada usuario que inicia sesión obtiene un perfil. pedro@... = admin;
-- el resto = colaborador PENDIENTE hasta que el admin lo apruebe.
-- =============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  nombre     text,
  role       text not null default 'colaborador' check (role in ('admin', 'colaborador')),
  estado     text not null default 'pendiente'  check (estado in ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada quien puede leer SU propio perfil (el admin usa service_role).
drop policy if exists "profiles: leer propio" on public.profiles;
create policy "profiles: leer propio"
  on public.profiles for select using (auth.uid() = id);

-- Crea el perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nombre, role, estado)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when new.email = 'pedro@pedrouzcategui.com' then 'admin' else 'colaborador' end,
    case when new.email = 'pedro@pedrouzcategui.com' then 'aprobado' else 'pendiente' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- v12: "patrocinado" — destacar marcas grandes (Yummy, Ridery, etc.)
-- =============================================================
alter table public.centros add column if not exists patrocinado boolean not null default false;

-- =============================================================
-- v13: logo + nombre del patrocinador (se guarda en el bucket 'centros')
-- =============================================================
alter table public.centros add column if not exists patrocinador_nombre text;
alter table public.centros add column if not exists patrocinador_logo text;

-- =============================================================
-- v14: instituciones oficiales para donar dinero (lo muestra /donaciones)
-- =============================================================
create table if not exists public.instituciones (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  logo        text,        -- URL en el bucket 'instituciones'
  enlace      text,        -- sitio o link para donar
  categoria   text,        -- opcional (ONG, gobierno, etc.)
  fijado      boolean not null default false,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.instituciones enable row level security;

drop policy if exists "instituciones: lectura pública" on public.instituciones;
create policy "instituciones: lectura pública"
  on public.instituciones for select using (activo = true);

insert into storage.buckets (id, name, public)
values ('instituciones', 'instituciones', true)
on conflict (id) do nothing;

drop policy if exists "instituciones bucket: lectura pública" on storage.objects;
create policy "instituciones bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'instituciones');

-- =============================================================
-- v15: imágenes en anuncios — logo (si es negocio) + imagen de portada
-- =============================================================
alter table public.anuncios add column if not exists logo_url   text;
alter table public.anuncios add column if not exists imagen_url text;

insert into storage.buckets (id, name, public)
values ('anuncios', 'anuncios', true)
on conflict (id) do nothing;

drop policy if exists "anuncios bucket: lectura pública" on storage.objects;
create policy "anuncios bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'anuncios');

-- =============================================================
-- v16: solicitudes públicas (pedidos de ayuda).
-- Cualquiera las envía (form público con captcha + verificación por
-- correo); el admin las aprueba antes de publicarlas.
-- =============================================================
create table if not exists public.solicitudes (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null,            -- p.ej. 'Donantes de sangre', 'Comida'
  titulo           text not null,
  descripcion      text,
  nombre           text not null,            -- quién hace la solicitud
  email            text not null,            -- verificado por código (OTP)
  telefono         text,
  whatsapp         text,
  zona             text,
  ubicacion        text,
  email_verificado boolean not null default false,
  estado           text not null default 'pendiente'
                     check (estado in ('pendiente', 'aprobada', 'rechazada', 'completada')),
  created_at       timestamptz not null default now()
);
create index if not exists solicitudes_estado_idx on public.solicitudes (estado);

-- v17: estado 'completada' para archivar solicitudes ya resueltas.
-- (Para bases que ya crearon la tabla con el check anterior.)
alter table public.solicitudes drop constraint if exists solicitudes_estado_check;
alter table public.solicitudes add constraint solicitudes_estado_check
  check (estado in ('pendiente', 'aprobada', 'rechazada', 'completada'));

alter table public.solicitudes enable row level security;

-- Lectura pública SOLO de las aprobadas. La inserción la hace el servidor
-- con service_role (tras captcha + OTP), por eso no hay política de insert.
drop policy if exists "solicitudes: lectura pública" on public.solicitudes;
create policy "solicitudes: lectura pública"
  on public.solicitudes for select using (estado = 'aprobada');

-- v18: el correo es opcional (el admin puede publicar solicitudes
-- directamente, sin el proceso de verificación por correo).
alter table public.solicitudes alter column email drop not null;
