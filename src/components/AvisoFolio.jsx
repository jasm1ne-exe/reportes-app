import { useState } from "react";
import { Link } from "react-router";
import { Check, CircleCheck, Copy, X } from "lucide-react";

// Tarjeta que aparece arriba del mapa al enviar un reporte.
// No se quita sola: el usuario necesita tiempo para anotar o copiar su folio.
export default function AvisoFolio({ folio, onCerrar }) {
  // "nada", "copiado" o "error"
  const [copia, setCopia] = useState("nada");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(folio);
      setCopia("copiado");
      setTimeout(() => setCopia("nada"), 2000);
    } catch {
      // Algunos navegadores bloquean el portapapeles (por ejemplo sin https)
      setCopia("error");
    }
  }

  return (
    <div
      role="status"
      className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
          <CircleCheck className="h-4 w-4" />
          ¡Reporte enviado! Gracias.
        </p>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-600">
        Guarda tu folio para consultar cómo va tu reporte:
      </p>

      <div className="mt-1 flex items-center gap-2">
        <span className="font-mono text-2xl font-bold tracking-wide text-slate-900">
          {folio}
        </span>
        <button
          type="button"
          onClick={copiar}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500"
        >
          {copia === "copiado" ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>

      {copia === "error" && (
        <p className="mt-1 text-xs text-red-600">
          No se pudo copiar. Anótalo a mano, por favor.
        </p>
      )}

      <Link
        to={`/seguimiento?folio=${encodeURIComponent(folio)}`}
        className="mt-3 inline-block text-sm font-medium text-marca-600 hover:underline"
      >
        Ver seguimiento
      </Link>
    </div>
  );
}
