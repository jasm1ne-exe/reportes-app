import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

// Enlace "← Volver al mapa" de arriba de las páginas (Admin, DetalleReporte, Seguimiento)
export default function VolverAlMapa({ className = "" }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Volver al mapa
    </Link>
  );
}
