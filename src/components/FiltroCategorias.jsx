import { LayoutGrid } from "lucide-react";

// Botones con el color de cada categoría: sirven de leyenda y de filtro.
// seleccionada es el id de la categoría o null para mostrar todas.
// celular: una fila con scroll horizontal | sm: chips que bajan de renglón | lg: lista vertical
export default function FiltroCategorias({ categorias, seleccionada, onCambiar }) {
  const claseChip = (activo) =>
    `flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-left text-[13px] font-medium sm:h-10 sm:px-3.5 sm:text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 lg:h-11 lg:w-full lg:gap-3 lg:rounded-lg lg:border-0 lg:text-[15px] ${
      activo
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
    }`;

  return (
    // min-w-0 evita que la fila de chips estire el panel en celular
    <div className="min-w-0">
      <p className="mb-2 hidden text-xs font-bold tracking-wider text-slate-500 uppercase lg:block">
        Categorías
      </p>

      {/* -mx-3 px-3 hace que la fila llegue hasta los bordes de la pantalla en celular */}
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 lg:flex-col lg:gap-0.5">
        <button
          type="button"
          onClick={() => onCambiar(null)}
          aria-pressed={seleccionada === null}
          className={claseChip(seleccionada === null)}
        >
          <LayoutGrid className="hidden h-4 w-4 shrink-0 lg:block" />
          Todas
        </button>

        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            type="button"
            onClick={() =>
              onCambiar(seleccionada === categoria.id ? null : categoria.id)
            }
            aria-pressed={seleccionada === categoria.id}
            className={claseChip(seleccionada === categoria.id)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white lg:h-3 lg:w-3"
              style={{ background: categoria.color ?? "#475569" }}
            />
            {categoria.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
