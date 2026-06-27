import { ImageResponse } from "next/og";

export const alt =
  "Centros de Acopio Verificados — Terremoto Venezuela Junio 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#070a0f",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#34d399",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          ● Sismo Venezuela · Junio 2026
        </div>
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            marginTop: 24,
            textTransform: "uppercase",
          }}
        >
          Centros verificados,
        </div>
        <div
          style={{
            display: "flex",
            color: "#34d399",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            textTransform: "uppercase",
          }}
        >
          Ayuda garantizada
        </div>
        <div
          style={{
            display: "flex",
            color: "#9aa7ba",
            fontSize: 30,
            marginTop: 32,
          }}
        >
          Centros de acopio · servicios gratuitos · emergencias · noticias
        </div>
      </div>
    ),
    { ...size },
  );
}
