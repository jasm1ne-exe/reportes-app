import { Link, useNavigate } from "react-router";
import { LogOut, MapPin } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function Encabezado() {
  const { user, perfil, cargando, cerrarSesion, esAdmin } = useAuth();
  const nombre = perfil?.nombre || user?.email || "";
  const navigate = useNavigate();

  // Al salir volvemos al mapa; replace evita regresar con "atrás" a una página de admin
  async function salir() {
    await cerrarSesion();
    navigate("/", { replace: true });
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
      <Link to="/" className="flex items-center gap-2 text-base font-bold sm:text-lg">
        <MapPin className="h-5 w-5 text-marca-600" />
        Mapa de incidencias
        MGD, JAL
      </Link>

      {cargando ? null : user ? (
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marca-100 font-semibold text-marca-700"
          >
            {nombre.charAt(0).toUpperCase()}
          </span>
          <span className="hidden truncate sm:inline">Hola, {nombre}</span>
          {esAdmin && (
            <Link
              to="/admin"
              className="rounded-lg px-3 py-1.5 font-medium text-marca-700 hover:bg-marca-50"
            >
              Panel
            </Link>
          )}
          <button
            type="button"
            onClick={salir}
            title="Cerrar sesión"
            className="flex items-center gap-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Cerrar sesión</span>
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2 text-sm">
          <Link
            to="/login"
            className="rounded-lg px-3 py-1.5 font-medium text-marca-700 hover:bg-marca-50"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="rounded-lg bg-marca-600 px-3 py-1.5 font-medium text-white hover:bg-marca-700"
          >
            Registrarme
          </Link>
        </div>
      )}
    </header>
  );
}
