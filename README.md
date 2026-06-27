# Centros de Acopio — Altos Mirandinos

Directorio de centros de acopio (Los Teques, Carrizal, San Antonio de los Altos) y
registro comunitario de donaciones, tras el terremoto. Next.js + Supabase, pensado
para desplegar en Vercel.

## Qué hace

Lado público:
- **Inicio (`/`)** — lista de centros por zona, con Instagram, WhatsApp, teléfono,
  cómo llegar y qué necesitan.
- **Mapa (`/mapa`)** — Leaflet + OpenStreetMap (sin API key). Pines de centros y
  servicios, con color/emoji por tipo y leyenda.
- **Servicios (`/servicios`)** — directorio navegable por categoría (farmacias,
  servicios médicos, transporte, etc.). La comunidad puede **votar 👍/👎** y
  **reportar** servicios sospechosos.
- **Anuncios (`/anuncios`)** — avisos y ayudas, etiquetados como **oficial**,
  **extraoficial** o **rumor**. Solo tú los creas/editas.
- **Buenas noticias (`/buenas-noticias`)** — acciones de gobiernos, instituciones y
  empresas que están ayudando. Solo tú las publicas.
- **Centro (`/centros/[id]`)** — detalle de cada centro + **comentarios en vivo**
  donde la gente dice qué necesita (reportables). Cada centro puede mostrar una
  **insignia** (Gobierno, Negocio, Informal, ONG, Comunitario) y un **nivel de
  confianza** (Verificado, Confiable, Por verificar).
- **Registrar donación (`/donar`)** — formulario público con foto opcional. Entra
  como **pendiente**.
- **Muro de donaciones (`/donaciones`)** — solo las **aprobadas**.

Administración (`/admin`, una sola contraseña, sin cuentas):
- **Donaciones** → Aprobar / Rechazar (tu "KYC" liviano: ves nombre, WhatsApp y foto).
- **Centros** → crear/editar (coordenadas, insignia y nivel de confianza), ocultar, eliminar.
- **Servicios** → crear/editar, limpiar reportes, eliminar; ves votos y reportes.
- **Anuncios** → crear/editar, fijar 📌, cambiar categoría, ocultar, eliminar.
- **Buenas noticias** → crear/editar, fijar 📌, ocultar, eliminar.
- **Comentarios** → moderar; los reportados aparecen primero, puedes ocultar o borrar.

### Cómo poner coordenadas en el mapa
En Google Maps, clic derecho sobre el punto → se copian dos números (latitud,
longitud). Pégalos en los campos **Latitud** y **Longitud** del centro o servicio.

## Puesta en marcha (≈15 min)

### 1. Crear el proyecto de Supabase
1. En [supabase.com](https://supabase.com) crea un proyecto (plan gratis sirve).
2. Ve a **SQL Editor → New query**, pega todo el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**. Esto crea las tablas,
   las políticas de seguridad y el bucket público `donaciones` para las fotos.

### 2. Variables de entorno
Copia `.env.local.example` a `.env.local` y complétalo:

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase **Settings → API**.
- `SUPABASE_SERVICE_ROLE_KEY` → misma página, clave `service_role` (¡secreta!).
- `ADMIN_PASSWORD` → la contraseña con la que entrarás a `/admin`.
- `ADMIN_SESSION_SECRET` → genera una con `openssl rand -hex 32`.

### 3. Correr localmente
```bash
pnpm install
pnpm dev
```
Abre http://localhost:3000. Entra a `/admin`, agrega tus centros reales y prueba el
flujo de donación.

### 4. Desplegar en Vercel
1. Sube el repo a GitHub e impórtalo en Vercel.
2. En Vercel, agrega las mismas 5 variables de entorno (**Project → Settings →
   Environment Variables**).
3. Deploy. Listo.

## Notas
- Las fotos se guardan en el bucket público `donaciones` de Supabase Storage.
- La seguridad pública depende de RLS (definido en el schema): el público solo lee
  centros activos y donaciones aprobadas. Todas las escrituras pasan por el servidor.
