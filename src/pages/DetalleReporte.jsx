import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { LoaderCircle, MapPin } from "lucide-react";

import EtiquetaEstado from "../components/EtiquetaEstado";
import FormularioActualizacion from "../components/FormularioActualizacion";
import HistorialReporte from "../components/HistorialReporte";
import VolverAlMapa from "../components/ui/VolverAlMapa";
import { useAuth } from "../context/useAuth";
import { cargarReporte, formatearFecha, urlFoto } from "../lib/reportes";
import { COLOR_SIN_CATEGORIA } from "../lib/iconosCategoria";

// Mensaje centrado para los estados de carga, error y no encontrado
function Mensaje({ children }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center text-sm text-slate-600">
      {children}
      <Link to="/" className="font-medium text-marca-600 hover:underline">
        Volver al mapa
      </Link>
    </div>
  );
}

export default function DetalleReporte() {
  const { id } = useParams();
  // undefined = cargando, null = no existe
  const [reporte, setReporte] = useState(undefined);
  const [error, setError] = useState(false);
  // Se incrementa tras publicar una actualización para volver a cargar el reporte
  const [version, setVersion] = useState(0);
  const { esAdmin } = useAuth();

  useEffect(() => {
    let cancelado = false;
    cargarReporte(id, esAdmin).then(({ data, error }) => {
      if (cancelado) return;
      if (error?.code === "22P02") return setReporte(null); // id que no es uuid
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
  }, [id, version, esAdmin]);

  if (error) return <Mensaje>No se pudo cargar el reporte.</Mensaje>;
  if (reporte === undefined) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (reporte === null) return <Mensaje>Reporte no encontrado.</Mensaje>;

  const foto = urlFoto(reporte.foto_path);
  const color = reporte.categoria?.color ?? COLOR_SIN_CATEGORIA;

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-xl">
        <VolverAlMapa className="mb-3" />

        <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <header className="space-y-1">
            <p className="text-sm font-medium" style={{ color }}>
              {reporte.categoria?.nombre}
            </p>
            <h1 className="text-xl font-bold">{reporte.titulo}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <EtiquetaEstado estado={reporte.estado} />
              {formatearFecha(reporte.created_at)}
              {reporte.folio && (
                <span className="font-mono font-semibold text-slate-700">
                  Folio {reporte.folio}
                </span>
              )}
            </div>
          </header>

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
            pasos={reporte.actualizaciones}
            titulo="Seguimiento"
          />

          {esAdmin && (
            <FormularioActualizacion
              reporte={reporte}
              onPublicado={() => setVersion((v) => v + 1)}
            />
          )}
        </article>
      </div>
    </div>
  );
}
