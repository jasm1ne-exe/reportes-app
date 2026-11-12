import EtiquetaEstado from "./EtiquetaEstado";
import { formatearFecha } from "../lib/reportes";

// Línea de tiempo con los pasos del reporte. La usan DetalleReporte y Seguimiento.
// reporte: para la fecha de creación | pasos: las actualizaciones guardadas
// titulo: texto de arriba | Encabezado: "h2" o "h3" según la página
export default function HistorialReporte({ reporte, pasos, titulo, Encabezado = "h2" }) {
  // El primer paso no existe en la base de datos: es la creación del reporte
  const historial = [
    { id: "creado", estado: "pendiente", comentario: "Reporte recibido", created_at: reporte.created_at },
    ...pasos,
  ];

  return (
    <section className="border-t border-slate-200 pt-4">
      <Encabezado className="mb-3 text-sm font-semibold">{titulo}</Encabezado>
      <ol className="space-y-4 border-l-2 border-slate-200 pl-4">
        {historial.map((paso) => (
          <li key={paso.id} className="relative">
            <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <EtiquetaEstado estado={paso.estado} />
              {formatearFecha(paso.created_at)}
            </div>
            {paso.comentario && (
              <p className="mt-1 text-sm text-slate-700">
                {paso.id !== "creado" && (
                  <span className="font-medium">Municipio: </span>
                )}
                {paso.comentario}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
