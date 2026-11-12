//importaciones
import { useEffect, useMemo, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Check } from "lucide-react";
import EtiquetaEstado from "./EtiquetaEstado";
import { urlFoto } from "../lib/reportes";
import { COLOR_SIN_CATEGORIA, iconoCategoria } from "../lib/iconosCategoria";

// Círculo de 30px del color de la categoría con su ícono en blanco adentro.
// Leaflet no sabe dibujar componentes de React, solo HTML en texto, por eso
// renderToStaticMarkup convierte el ícono de lucide a un <svg> en texto.
// El estado se marca en la esquina de arriba a la derecha:
// pendiente = nada | en revisión / en proceso = punto oscuro | resuelto = más transparente + palomita verde
function crearIcono(color, nombreIcono, estado) {
  const Icono = iconoCategoria(nombreIcono);
  const svg = renderToStaticMarkup(<Icono size={16} color="white" strokeWidth={2.5} />);

  // La opacidad va solo en el círculo, así la palomita no se ve deslavada
  const opacidad = estado === "resuelto" ? "opacity:0.55;" : "";

  let indicador = "";
  if (estado === "en_revision" || estado === "en_proceso") {
    indicador = `<span style="position:absolute;top:-2px;right:-2px;box-sizing:border-box;width:10px;height:10px;border-radius:9999px;background:#0f172a;border:2px solid white"></span>`;
  } else if (estado === "resuelto") {
    const palomita = renderToStaticMarkup(<Check size={9} color="white" strokeWidth={4} />);
    indicador = `<span style="position:absolute;top:-3px;right:-3px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:14px;height:14px;border-radius:9999px;background:#16a34a;border:2px solid white">${palomita}</span>`;
  }

  return L.divIcon({
    className: "",
    html: `<span style="position:relative;display:block;width:30px;height:30px"><span style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:30px;height:30px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);${opacidad}">${svg}</span>${indicador}</span>`,
    iconSize: [30, 30],
    // el centro del círculo queda justo en la ubicación del reporte
    iconAnchor: [15, 15],
    // el popup sale desde el borde de arriba del círculo
    popupAnchor: [0, -15],
  });
}

// abrir: abre el popup al montarse (se usa con el reporte recién creado)
export default function MarcadorReporte({ reporte, abrir = false }) {
  const color = reporte.categoria?.color ?? COLOR_SIN_CATEGORIA;
  const nombreIcono = reporte.categoria?.icono;
  const estadoReporte = reporte.estado;
  const icono = useMemo(
    () => crearIcono(color, nombreIcono, estadoReporte),
    [color, nombreIcono, estadoReporte]
  );
  const foto = urlFoto(reporte.foto_path);
  const markerRef = useRef(null);

  useEffect(() => {
    if (abrir) markerRef.current?.openPopup();
  }, [abrir]);

//se dibuja el mapa
  return (
    <Marker position={[reporte.lat, reporte.lng]} icon={icono} ref={markerRef}>
      <Popup>
        <div className="w-56 space-y-1">
          <p className="!m-0 text-xs font-medium" style={{ color }}>
            {reporte.categoria?.nombre}
          </p>
          <p className="!m-0 font-semibold">{reporte.titulo}</p>
          {reporte.descripcion && (
            <p className="!m-0 text-sm text-slate-700">{reporte.descripcion}</p>
          )}
          {foto && (
            <img
              src={foto}
              alt={reporte.titulo}
              loading="lazy"
              className="mt-1 h-32 w-full rounded object-cover"
            />
          )}
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <EtiquetaEstado estado={reporte.estado} />
            {new Date(reporte.created_at).toLocaleDateString("es-MX")}
          </div>
          <Link
            to={`/reporte/${reporte.id}`}
            className="block pt-1 text-sm font-medium !text-marca-600 hover:underline"
          >
            Ver detalle y seguimiento
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
