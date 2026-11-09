import { Link } from "react-router";
import { MapPin, Search } from "lucide-react";
import BloqueUsuario from "./BloqueUsuario";

export default function Encabezado() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
      {/* min-w-0 + truncate: si el título no cabe se corta con "..." en vez de aplastar los botones */}
      <Link to="/" className="flex min-w-0 items-center gap-2 text-sm font-bold sm:text-lg">
        <MapPin className="h-5 w-5 shrink-0 text-marca-600" />
        <span className="truncate">
          Sistema web de gestion y monitoreo de reportes ciudadanos
          <span className="hidden sm:inline"> MGD, JAL</span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/seguimiento"
          title="Consultar folio"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Consultar folio</span>
        </Link>
        <BloqueUsuario />
      </div>
    </header>
  );
}
