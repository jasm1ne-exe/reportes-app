import { useState } from "react";

import { infoEstado, LISTA_ESTADOS, publicarActualizacion } from "../lib/reportes";

// onPublicado: el padre vuelve a cargar el reporte para ver el nuevo paso
export default function FormularioActualizacion({ reporte, onPublicado }) {
  const [estado, setEstado] = useState(reporte.estado);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await publicarActualizacion(reporte.id, estado, comentario);
    setEnviando(false);
    if (error) return setError("No se pudo guardar la actualización.");
    setComentario("");
    onPublicado();
  }

  return (
    <form onSubmit={enviar} className="space-y-3 border-t border-slate-200 pt-4">
      <h2 className="text-sm font-semibold">Actualizar reporte</h2>
      <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
        {LISTA_ESTADOS.map((e) => (
          <option key={e} value={e}>{infoEstado(e).texto}</option>
        ))}
      </select>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Comentario para el ciudadano (opcional)"
        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {/* Puedes usar tu componente <Boton> de ui/Boton.jsx en lugar de este */}
      <button type="submit" disabled={enviando} className="rounded-lg bg-marca-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
        {enviando ? "Guardando…" : "Publicar"}
      </button>
    </form>
  );
}