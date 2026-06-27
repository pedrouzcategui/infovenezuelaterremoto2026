import type { MetadataRoute } from "next";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://infovenezuelaterremoto.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/mapa",
    "/servicios",
    "/anuncios",
    "/paises",
    "/donaciones",
  ];
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "daily" as const,
    priority: r === "" ? 1 : 0.7,
  }));
}
