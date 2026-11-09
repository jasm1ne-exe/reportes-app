import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";

// Botones del mapa: GPS arriba y +/− agrupados abajo (los +/− solo desde sm).
// El contenedor está pegado por abajo (bottom-28 en celular), así que al ocultar +/−
// el GPS baja a ese lugar y queda justo encima del botón "Reportar un problema".
// Va dentro de <MapContainer> para poder usar useMap().
// onGps: función para volver a buscar la ubicación | buscando: true mientras se busca
export default function ControlesMapa({ onGps, buscando }) {
  const map = useMap();
  const contenedorRef = useRef(null);

  // Si no se hace esto, el clic en un botón también le llega al mapa
  // y con el formulario abierto movería el pin a ese punto
  useEffect(() => {
    if (contenedorRef.current) {
      L.DomEvent.disableClickPropagation(contenedorRef.current);
    }
  }, []);

  const claseBoton =
    "flex h-12 w-12 items-center justify-center text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 focus-visible:ring-inset lg:h-[52px] lg:w-[52px]";

  return (
    <div
      ref={contenedorRef}
      className="absolute right-3 bottom-28 z-[1000] flex flex-col gap-2.5 sm:right-5 sm:bottom-11"
    >
      <button
        type="button"
        onClick={onGps}
        disabled={buscando}
        title="Ir a mi ubicación"
        aria-label="Ir a mi ubicación"
        className={`${claseBoton} flex-col gap-0.5 rounded-xl bg-white shadow-md disabled:cursor-wait disabled:opacity-60`}
      >
        <LocateFixed className="h-5 w-5" />
        <span className="text-[10px] leading-none font-semibold">
          {buscando ? "..." : "GPS"}
        </span>
      </button>

      {/* + y − solo desde sm: en celular se hace zoom con los dedos */}
      <div className="hidden flex-col overflow-hidden rounded-xl bg-white shadow-md sm:flex">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          title="Acercar"
          aria-label="Acercar"
          className={claseBoton}
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          title="Alejar"
          aria-label="Alejar"
          className={`${claseBoton} border-t border-slate-200`}
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
