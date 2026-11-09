//importaciones necesarias
import { useEffect, useMemo, useRef, useState } from "react";
//importaciones de react-leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { CircleCheck, LoaderCircle, X } from "lucide-react";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Pin en forma de gota para marcar dónde se hará el reporte.
// Es un SVG propio (ya no se usa el pin azul de Leaflet, que era grande y tapaba
// los reportes de alrededor). La punta de la gota está en (14, 36) del viewBox;
// a 24px de ancho eso queda en (12, 31), y ahí va el anclaje.
const PIN_UBICACION = L.divIcon({
  className: "",
  html: `<svg width="24" height="33" viewBox="0 0 28 38" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">
    <path d="M14 2C7.4 2 2 7.4 2 14c0 9.5 12 22 12 22s12-12.5 12-22C26 7.4 20.6 2 14 2z" fill="#1e3fae" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="14" cy="14" r="4.5" fill="white"/>
  </svg>`,
  iconSize: [24, 33],
  // la punta de abajo es la que señala el lugar exacto
  iconAnchor: [12, 31],
  // el popup sale arriba de la gota
  popupAnchor: [0, -30],
});
//el formulario, que se muestra encima del mapa.
import FormularioReporte from "./formularioReportes";
import MarcadorReporte from "./MarcadorReporte";
import ControlesMapa from "./ControlesMapa";
import AvisoFolio from "./AvisoFolio";
import { cargarReportesMapa } from "../lib/reportes";

// Coordenadas de magdalena, Jalisco, México. Se usan mientras llega la ubicacion real o si falla.
const DEFAULT_POSITION = [20.9086744, -103.9815141];

// Componente encargado de mover el mapa
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, {
      animate: true,
      duration: 1,
    });
  }, [position, map]);

  return null;
}

// Al abrir el formulario en móvil, sube el pin para que no quede tapado por la hoja inferior
function EnfocarPin({ position, activo }) {
  const map = useMap();

  useEffect(() => {
    // Al abrir/cerrar el formulario el panel de arriba cambia de alto y el mapa de tamaño.
    // Leaflet no se da cuenta solo, así que se le avisa para que no queden franjas grises.
    map.invalidateSize();

    if (!activo || window.innerWidth >= 640) return;
    const zoom = map.getZoom();
    const punto = map.project(position, zoom);
    // Mueve el centro hacia abajo para que el pin quede en la parte de arriba
    // que no tapa el formulario (el formulario ocupa hasta el 70% de abajo)
    punto.y += map.getSize().y * 0.35;
    map.panTo(map.unproject(punto, zoom));
    // Solo al abrir; no se quiere mover el mapa cada vez que cambia el pin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, map]);

  return null;
}

// Con el formulario abierto, tocar el mapa mueve el pin a ese punto
function SelectorUbicacion({ activo, onSeleccionar }) {
  useMapEvents({
    click(evento) {
      if (activo) onSeleccionar([evento.latlng.lat, evento.latlng.lng]);
    },
  });

  return null;
}

// Aviso pequeño que flota sobre el mapa
function Aviso({ tono = "info", children }) {
  const tonos = {
    info: "bg-white text-slate-700",
    exito: "bg-green-600 text-white",
    alerta: "bg-amber-50 text-amber-800",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-fit max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${tonos[tono]}`}
    >
      {children}
    </div>
  );
}

// Las categorías, el filtro y si el formulario está abierto vienen de Inicio.jsx
export default function MapView({
  categorias,
  cargandoCategorias,
  errorCategorias,
  filtro,
  onCambiarFiltro,
  formAbierto,
  onCambiarFormAbierto,
}) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  // Centro del mapa: solo cambia con la geolocalización, no al arrastrar el marcador
  const [center, setCenter] = useState(DEFAULT_POSITION);
  // Si el navegador no soporta geolocalización, se empieza directamente en "fallback"
  const [status, setStatus] = useState(() =>
    navigator.geolocation ? "loading" : "fallback"
  );
  // El aviso de "ubicación detectada" se oculta solo después de unos segundos
  const [avisoUbicacionVisible, setAvisoUbicacionVisible] = useState(true);
  // true cuando el usuario cierra con la X el aviso de "no pudimos usar tu ubicación"
  const [avisoErrorCerrado, setAvisoErrorCerrado] = useState(false);
  const [moved, setMoved] = useState(false);
  const markerRef = useRef(null);
  // Reportes ya guardados, cada uno se dibuja con su marcador
  const [reportes, setReportes] = useState([]);
  const [errorReportes, setErrorReportes] = useState(false);
  // id del reporte recién creado, para abrir su popup
  const [reporteNuevoId, setReporteNuevoId] = useState(null);
  // false = sin aviso, true = aviso corto, o el folio del reporte (ej: "MGD-0007")
  const [mensajeExito, setMensajeExito] = useState(false);
  const temporizadores = useRef([]);

  // Ejecuta una función después de unos segundos; se cancela al desmontar
  const despues = (ms, fn) => {
    temporizadores.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => pendientes.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let cancelado = false;

    cargarReportesMapa().then(({ data, error }) => {
        if (cancelado) return;
        if (error) {
          console.error(error);
          setErrorReportes(true);
          return;
        }
        setReportes(data);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const reportesVisibles =
    filtro === null
      ? reportes
      : reportes.filter((reporte) => reporte.categoria_id === filtro);

  // El formulario llama a esto con el reporte recién insertado
  const agregarReporte = (reporte) => {
    setReportes((anteriores) => [reporte, ...anteriores]);
    setReporteNuevoId(reporte.id);
    onCambiarFiltro(null);
    onCambiarFormAbierto(false);
    if (reporte.folio) {
      // Con folio el aviso se queda hasta que el usuario lo cierre
      setMensajeExito(reporte.folio);
    } else {
      setMensajeExito(true);
      despues(4000, () => setMensajeExito(false));
    }
  };

  const seleccionarUbicacion = (nueva) => {
    setPosition(nueva);
    setMoved(true);
  };

  //eventos del marcador, para actualizar la posición cuando se arrastra
  const markerEvents = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          setMoved(true);
        }
      },
    }),
    []
  );
  //funcion para obtener la ubicacion del dispositivo.
  //Solo actualiza el estado dentro de los callbacks (cuando llega la respuesta del navegador).
  const obtenerUbicacion = (opciones = {}) => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const { latitude, longitude } = location.coords;

        setPosition([latitude, longitude]);
        setCenter([latitude, longitude]);
        setMoved(false);
        setStatus("success");
        setAvisoUbicacionVisible(true);
        despues(3000, () => setAvisoUbicacionVisible(false));
      },
      () => {
        // Si falla, se mantienen las coordenadas predeterminadas
        setStatus("fallback");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
        ...opciones
      }
    );
  };
  //pide la ubicacion al cargar, se ejecuta solo una vez, por eso el vacio []
  useEffect(() => {
    if (navigator.geolocation) obtenerUbicacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reintentarUbicacion = () => {
    if (!navigator.geolocation) return;
    // Si vuelve a fallar, el aviso se tiene que ver otra vez
    setAvisoErrorCerrado(false);
    setStatus("loading");
    obtenerUbicacion({ maximumAge: 0 });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT_POSITION}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* GPS y +/−; van aquí dentro porque usan useMap() */}
        <ControlesMapa
          onGps={reintentarUbicacion}
          buscando={status === "loading"}
        />

        <MapUpdater position={center} />
        <EnfocarPin position={position} activo={formAbierto} />
        <SelectorUbicacion
          activo={formAbierto}
          onSeleccionar={seleccionarUbicacion}
        />

        {reportesVisibles.map((reporte) => (
          <MarcadorReporte
            key={reporte.id}
            reporte={reporte}
            abrir={reporte.id === reporteNuevoId}
          />
        ))}

        {/* zIndexOffset: con el formulario abierto el pin va encima de todos los reportes
            para poder arrastrarlo; cerrado se va hasta abajo para no tapar ninguno */}
        <Marker
          position={position}
          icon={PIN_UBICACION}
          zIndexOffset={formAbierto ? 1000 : -1000}
          draggable={true}
          eventHandlers={markerEvents}
          ref={markerRef}
        >
          <Popup>
            {moved
              ? "Ubicación seleccionada"
              : status === "success"
              ? "Ubicación actual del dispositivo. Puedes arrastrar el marcador para ajustar la ubicación" 
              :" Ubicación predeterminada (Magdalena, Jalisco, México). Puedes arrastrar el marcador para ajustar la ubicación  "}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Avisos arriba del mapa. pointer-events-none deja pasar los toques al mapa entre los avisos. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] space-y-2 p-3">
        {status === "loading" && (
          <Aviso>
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Buscando tu ubicación...
          </Aviso>
        )}

        {status === "success" && avisoUbicacionVisible && (
          <Aviso>
            <CircleCheck className="h-3.5 w-3.5 text-green-600" />
            Ubicación detectada
          </Aviso>
        )}

        {/* Tocar el mapa solo mueve el pin con el formulario abierto;
            con el formulario cerrado lo que funciona es arrastrar el pin */}
        {status === "fallback" && !avisoErrorCerrado && (
          <Aviso tono="alerta">
            <span>
              No pudimos usar tu ubicación.{" "}
              {formAbierto
                ? "Toca el mapa para marcar el lugar."
                : "Arrastra el pin azul al lugar del problema."}
            </span>
            <button
              type="button"
              onClick={reintentarUbicacion}
              className="shrink-0 underline hover:no-underline"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => setAvisoErrorCerrado(true)}
              aria-label="Cerrar aviso"
              title="Cerrar aviso"
              className="-my-1 -mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-amber-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Aviso>
        )}

        {errorReportes && (
          <Aviso tono="error">No se pudieron cargar los reportes.</Aviso>
        )}

        {typeof mensajeExito === "string" && !formAbierto && (
          <AvisoFolio
            folio={mensajeExito}
            onCerrar={() => setMensajeExito(false)}
          />
        )}

        {mensajeExito === true && (
          <Aviso tono="exito">
            <CircleCheck className="h-3.5 w-3.5" />
            ¡Reporte enviado! Gracias.
          </Aviso>
        )}
      </div>

      {/* Le pasa la posición del marcador, no la del centro, para que el reporte se guarde donde está el pin. */}
      <FormularioReporte
        position={position}
        categorias={categorias}
        cargandoCategorias={cargandoCategorias}
        errorCategorias={errorCategorias}
        abierto={formAbierto}
        onCerrar={() => onCambiarFormAbierto(false)}
        onReporteCreado={agregarReporte}
      />
    </div>
  );
}
