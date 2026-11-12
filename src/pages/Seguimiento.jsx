import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { LoaderCircle, MapPin, Search } from "lucide-react";

import EtiquetaEstado from "../components/EtiquetaEstado";
import HistorialReporte from "../components/HistorialReporte";
import Boton from "../components/ui/Boton";
import VolverAlMapa from "../components/ui/VolverAlMapa";
import { claseControl } from "../components/ui/clases";
import { COLOR_SIN_CATEGORIA } from "../lib/iconosCategoria";
import {
  consultarFolio,
  formatearFecha,
  normalizarFolio,
  urlFoto,
} from "../lib/reportes";

// Página pública: cualquiera escribe su folio y ve cómo va su reporte.
// El folio va en la URL (?folio=MGD-0007) para poder compartir el enlace.
export default function Seguimiento() {
  const [searchParams, setSearchParams] = useSearchParams();
  const folioUrl = searchParams.get("folio") ?? "";

  const [texto, setTexto] = useState(folioUrl);
  // undefined = todavía no se busca o cargando, null = no existe
  const [reporte, setReporte] = useState(undefined);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  // Cada vez que cambia el folio de la URL se vuelve a consultar
  useEffect(() => {
    if (!folioUrl) return;
    let cancelado = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setError(false);
    consultarFolio(folioUrl).then(({ data, error }) => {
      if (cancelado) return;
      setCargando(false);
      if (error) {
        console.error(error);
        setError(true);
        return;
      }
      setReporte(data);
    });

    return () => {
      cancelado = true;
    };
  }, [folioUrl]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!texto.trim()) return;
    const folio = normalizarFolio(texto);
    setTexto(folio);
    setSearchParams({ folio });
  }

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-xl space-y-4">
        <VolverAlMapa />

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-bold">Seguimiento de reporte</h1>
          <p className="mt-1 text-sm text-slate-600">
            Escribe el folio que recibiste al enviar tu reporte (por ejemplo MGD-0007).
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <label htmlFor="folio" className="sr-only">
              Folio
            </label>
            <input
              id="folio"
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="MGD-0007"
              autoComplete="off"
              maxLength={20}
              className={`${claseControl} font-mono uppercase`}
            />
            <div className="shrink-0">
              <Boton type="submit" icono={Search} cargando={cargando}>
                Buscar
              </Boton>
            </div>
          </form>
        </section>

        {cargando && (
          <div className="flex justify-center py-8">
            <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {!cargando && error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            No se pudo consultar el folio. Intenta de nuevo.
          </p>
        )}

        {!cargando && !error && folioUrl && reporte === null && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            No encontramos ningún reporte con el folio <b>{folioUrl}</b>. Revisa que esté bien escrito.
          </p>
        )}

        {!cargando && !error && folioUrl && reporte && (
          <ResultadoFolio reporte={reporte} />
        )}
      </div>
    </div>
  );
}

function ResultadoFolio({ reporte }) {
  const rechazado = reporte.estado === "rechazado";
  const foto = urlFoto(reporte.foto_path);
  const color = reporte.categoria?.color ?? COLOR_SIN_CATEGORIA;

  return (
    <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <header className="space-y-1">
        <p className="font-mono text-sm font-semibold text-slate-700">
          Folio {reporte.folio}
        </p>
        {reporte.categoria?.nombre && (
          <p className="text-sm font-medium" style={{ color }}>
            {reporte.categoria.nombre}
          </p>
        )}
        {reporte.titulo && <h2 className="text-xl font-bold">{reporte.titulo}</h2>}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <EtiquetaEstado estado={reporte.estado} />
          Enviado el {formatearFecha(reporte.created_at)}
        </div>
      </header>

      {rechazado && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Este reporte fue rechazado por el municipio, por eso no aparece en el mapa.
        </p>
      )}

      {foto && (
        <img
          src={foto}
          alt={reporte.titulo}
          className="max-h-80 w-full rounded-lg object-cover"
        />
      )}

      {reporte.descripcion && (
        <p className="whitespace-pre-line text-sm text-slate-700">
          {reporte.descripcion}
        </p>
      )}

      {reporte.direccion && (
        <p className="flex items-center gap-1 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0" />
          {reporte.direccion}
        </p>
      )}

      <HistorialReporte
        reporte={reporte}
        pasos={reporte.historial}
        titulo="Historial"
        Encabezado="h3"
      />
    </article>
  );
}
