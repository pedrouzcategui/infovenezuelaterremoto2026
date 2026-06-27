import { getPuntosMapa } from "@/lib/data";
import { MapaTabs } from "./MapaTabs";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const puntos = await getPuntosMapa();
  const nCentros = puntos.filter((p) => p.tipo === "centro").length;
  const nServicios = puntos.filter((p) => p.tipo === "servicio").length;

  return <MapaTabs puntos={puntos} nCentros={nCentros} nServicios={nServicios} />;
}
