import { NextResponse } from "next/server";

// Límite: 100 solicitudes por minuto por IP (ventana fija, en memoria).
// Nota: en serverless el estado no se comparte entre instancias, así que el
// límite es aproximado pero suficiente como protección básica.
const WINDOW_MS = 60_000;
const LIMIT = 100;

type Entry = { count: number; reset: number };
const hits = new Map<string, Entry>();

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();

  // Limpieza oportunista para no crecer sin límite.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }

  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, remaining: LIMIT - 1, reset: now + WINDOW_MS };
  }
  entry.count += 1;
  return {
    ok: entry.count <= LIMIT,
    remaining: Math.max(0, LIMIT - entry.count),
    reset: entry.reset,
  };
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Maneja un endpoint público: rate limit + CORS + JSON. */
export async function apiHandler<T>(
  req: Request,
  fetcher: () => Promise<T>,
): Promise<NextResponse> {
  const rl = checkRateLimit(req);
  const headers: Record<string, string> = {
    ...CORS,
    "X-RateLimit-Limit": String(LIMIT),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
    "Cache-Control": "public, max-age=30",
  };

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Límite: 100 por minuto." },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      },
    );
  }

  try {
    const data = await fetcher();
    return NextResponse.json({ data }, { headers });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron obtener los datos." },
      { status: 500, headers },
    );
  }
}

/** Respuesta para preflight CORS. */
export function corsOptions(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS });
}
