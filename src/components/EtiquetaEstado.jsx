import { infoEstado } from "../lib/reportes";

// Etiqueta de color con el nombre del estado (Pendiente, En proceso, ...)
export default function EtiquetaEstado({ estado }) {
  const { texto, clases } = infoEstado(estado);
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${clases}`}>
      {texto}
    </span>
  );
}
