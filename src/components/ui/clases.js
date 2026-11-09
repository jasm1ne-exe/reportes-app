// Estilo común de input, textarea y select.
// En celular la letra es de 16px (text-base): con menos, Safari de iPhone hace zoom
// al tocar el campo y el zoom se queda puesto al cambiar de página. Desde sm vuelve a 14px.
export const claseControl =
  "w-full rounded-lg border border-slate-300 bg-white p-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-marca-500 focus:outline-none focus:ring-2 focus:ring-marca-500/30 disabled:bg-slate-100";
