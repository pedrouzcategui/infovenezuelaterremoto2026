import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Los server actions limitan el body a 1MB por defecto; las fotos
      // (centros, servicios, anuncios) suelen pesar más. Subimos el límite.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
