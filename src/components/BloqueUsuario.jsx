import { Link, useLocation, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth";

// Parte del usuario: su inicial, nombre, "Panel" (solo admins) y cerrar sesión.
// Si no hay sesión muestra "Iniciar sesión" y "Registrarme". Mientras carga no muestra nada.
// variante: "barra" (como se ve en el encabezado de las otras páginas) o "panel" (panel del mapa)
export default function BloqueUsuario({ variante = "barra" }) {
  const { user, perfil, cargando, cerrarSesion, esAdmin } = useAuth();
  const nombre = perfil?.nombre || user?.email || "";
  const navigate = useNavigate();
  // Si ya estamos en el panel de admin no tiene caso mostrar el botón "Panel"
  const { pathname } = useLocation();
  const enPanel = pathname === "/admin";

  // Al salir volvemos al mapa; replace evita regresar con "atrás" a una página de admin
  async function salir() {
    await cerrarSesion();
    navigate("/", { replace: true });
  }

  if (cargando) return null;

  // ----- Variante "panel" -----
  // celular: fila gris compacta | sm: fila sin fondo | lg: tarjeta gris con nombre y Panel en columna
  if (variante === "panel") {
    if (user) {
      return (
        <div className="flex min-w-0 items-center gap-1 text-sm sm:gap-3 lg:rounded-2xl lg:bg-slate-100 lg:p-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca-100 font-semibold text-marca-700"
          >
            {nombre.charAt(0).toUpperCase()}
          </span>

          {/* En lg el nombre y "Panel" van uno debajo del otro */}
          {/* En celular se oculta el nombre para que quepa junto al título; solo queda la inicial */}
          <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex lg:flex-col lg:items-start lg:gap-0">
            <span className="truncate font-semibold text-slate-800">
              Hola, {nombre}
            </span>
            {/* El botón "Panel" de esta variante ahora está arriba de los filtros (PanelLateral.jsx) */}
          </div>

          <button
            type="button"
            onClick={salir}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
        <Link
          to="/login"
          className="inline-flex min-h-10 items-center justify-center rounded-lg px-2 font-medium sm:min-h-11 sm:px-3 text-marca-700 hover:bg-marca-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 lg:flex-1"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/registro"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-marca-600 px-2.5 font-medium sm:min-h-11 sm:px-3 text-white hover:bg-marca-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 lg:flex-1"
        >
          Registrarme
        </Link>
      </div>
    );
  }

  // ----- Variante "barra" (igual que siempre) -----
  if (user) {
    return (
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marca-100 font-semibold text-marca-700"
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
        <span className="hidden truncate sm:inline">Hola, {nombre}</span>
        {esAdmin && !enPanel && (
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
    );
  }

  return (
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
  );
}
