import { useEffect, useState } from "react";
import { Link } from "react-router";

import EtiquetaEstado from "../components/EtiquetaEstado";
import VolverAlMapa from "../components/ui/VolverAlMapa";
import { cargarReportesAdmin, infoEstado, LISTA_ESTADOS } from "../lib/reportes";

export default function Admin() {
  const [filtro, setFiltro] = useState(""); // "" = todos
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    cargarReportesAdmin(filtro).then(({ data, error }) => {
      if (cancelado) return;
      if (error) console.error(error);
      setReportes(data ?? []);
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [filtro]);

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <VolverAlMapa />

        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Panel de administración</h1>
          <select
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setCargando(true);
            }}
            className="rounded-lg border border-slate-300 px-2 py-1 text-base sm:text-sm"
          >
            <option value="">Todos</option>
            {LISTA_ESTADOS.map((e) => (
              <option key={e} value={e}>{infoEstado(e).texto}</option>
            ))}
          </select>
        </div>

        {/* TODO: contadores por estado, buscador por título, paginación... */}

        {cargando ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {reportes.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.titulo}</p>
                  <p className="text-xs text-slate-500">{r.categoria?.nombre}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <EtiquetaEstado estado={r.estado} />
                  <Link to={`/reporte/${r.id}`} className="text-sm font-medium text-marca-600 hover:underline">
                    Gestionar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
