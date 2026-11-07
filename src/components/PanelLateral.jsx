import { Link } from "react-router";
import { LayoutDashboard, MapPin, Plus } from "lucide-react";
import { useAuth } from "../context/useAuth";
import BloqueUsuario from "./BloqueUsuario";
import FiltroCategorias from "./FiltroCategorias";

// Panel de la pantalla del mapa. Se usa un grid con "áreas" con nombre para
// acomodar los mismos elementos en distinto orden según el ancho, sin repetir HTML:
// - celular y tablet: marca | usuario en una fila y los filtros abajo (así el panel ocupa poco)
// - lg (escritorio): columna a la izquierda -> marca, filtros, reportar, usuario
// En las clases [grid-template-areas:...] el "_" es un espacio y cada '...' es un renglón.
// En lg la fila de filtros es minmax(0,1fr): toma el espacio que sobra y si no alcanza
// hace scroll por dentro, así "Reportar" y el usuario siempre se ven abajo.
export default function PanelLateral({ categorias, filtro, onCambiarFiltro, formAbierto, onReportar }) {
  const { esAdmin } = useAuth();

  return (
    <aside
      className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 border-b border-slate-200 bg-white px-3 pt-3 pb-2 [grid-template-areas:'marca_usuario'_'filtros_filtros'] sm:gap-x-4 sm:gap-y-3.5 sm:px-6 sm:py-4 lg:relative lg:h-full lg:min-h-0 lg:w-80 lg:shrink-0 lg:grid-cols-1 lg:grid-rows-[auto_minmax(0,1fr)_auto_auto] lg:overflow-hidden lg:border-r lg:border-b-0 lg:px-5 lg:pt-7 lg:pb-6 lg:[grid-template-areas:'marca'_'filtros'_'reportar'_'usuario']"
    >
      {/* Marca. min-w-0 deja que el título baje de renglón en vez de empujar al usuario */}
      <Link
        to="/"
        className="flex min-w-0 items-center gap-2.5 justify-self-start rounded-xl [grid-area:marca] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 sm:gap-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-marca-600 sm:h-11 sm:w-11">
          <MapPin className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        </span>
        <span className="min-w-0">
          <h1 className="text-sm leading-snug font-bold sm:text-[17px] sm:leading-tight lg:text-[19px]">
            {/* En celular va el título corto para que quepa en un renglón */}
            <span className="sm:hidden">Reportes ciudadanos</span>
            <span className="hidden sm:inline">
              Sistema web de gestion y monitoreo de reportes ciudadanos
            </span>
          </h1>
          <span className="block text-xs font-semibold tracking-wide text-slate-500 sm:text-[13px]">
            MGD, JAL
          </span>
        </span>
      </Link>

      {/* Usuario */}
      <div className="flex min-w-0 items-center gap-1 self-center justify-self-end [grid-area:usuario] lg:block lg:justify-self-stretch">
        {/* En celular el botón de admin es solo un ícono aquí arriba, junto al avatar */}
        {esAdmin && (
          <Link
            to="/admin"
            title="Panel de administración"
            aria-label="Panel de administración"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-marca-50 text-marca-700 hover:bg-marca-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 sm:hidden"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Link>
        )}
        <BloqueUsuario variante="panel" />
      </div>

      {/* Filtros. min-w-0 deja que la fila de chips haga scroll en celular en vez de estirar el panel.
          En lg, overflow-y-auto hace que la lista de categorías tenga su propio scroll.
          Con el formulario abierto se ocultan en celular/tablet para que el mapa tenga más espacio */}
      <div
        className={`min-w-0 [grid-area:filtros] lg:block lg:min-h-0 lg:overflow-y-auto ${
          formAbierto ? "hidden" : ""
        }`}
      >
        {/* Botón ancho del panel de admin (desde tablet; en celular está el ícono de arriba) */}
        {esAdmin && (
          <Link
            to="/admin"
            className="mb-2 hidden min-h-10 text-sm sm:flex sm:text-base lg:mb-3 lg:min-h-11 items-center gap-2 rounded-xl bg-marca-50 px-3 font-semibold text-marca-700 hover:bg-marca-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500"
          >
            <LayoutDashboard className="h-5 w-5" />
            Panel de administración
          </Link>
        )}

        {categorias.length > 0 && (
          <FiltroCategorias
            categorias={categorias}
            seleccionada={filtro}
            onCambiar={onCambiarFiltro}
          />
        )}
      </div>

      {/* Botón "Reportar un problema". Debajo de lg es absolute: como el aside no es relative,
          se acomoda respecto al contenedor de Inicio.jsx y flota sobre el mapa.
          En lg es static y se queda dentro del panel, en su área del grid. */}
      {!formAbierto && (
        <button
          type="button"
          onClick={onReportar}
          className="absolute right-3 bottom-9 left-3 z-[1000] flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-marca-600 font-semibold text-white shadow-lg shadow-marca-600/35 transition [grid-area:reportar] hover:bg-marca-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 focus-visible:ring-offset-2 sm:right-auto sm:bottom-8 sm:left-6 sm:px-6 lg:static lg:h-[52px] lg:w-full lg:text-base lg:shadow-none"
        >
          <Plus className="h-5 w-5" />
          Reportar un problema
        </button>
      )}
    </aside>
  );
}
