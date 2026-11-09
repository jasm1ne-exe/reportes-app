import { supabase } from "./supabaseClient";

// Columnas que necesita el mapa. lat y lng son columnas calculadas en la base
// de datos, así no hay que decodificar el punto de PostGIS en el cliente.
export const COLUMNAS_REPORTE =
  "id, folio, titulo, descripcion, estado, lat, lng, foto_path, created_at, categoria_id, categoria:categorias (nombre, color, icono)";

// Categorías activas, las usan el filtro del mapa y el formulario
export function cargarCategorias() {
  return supabase
    .from("categorias")
    .select("id, nombre, color, icono")
    .eq("activa", true)
    .order("orden");
}
// Reportes del mapa público. Se leen de la vista reportes_publicos, que
// esconde quién hizo el reporte, redondea la ubicación y oculta la foto
// hasta que un admin lo revisa.
export function cargarReportesMapa() {
  return supabase
    .from("reportes_publicos")
    .select(COLUMNAS_REPORTE)
    .order("created_at", { ascending: false })
    .limit(500);
}

// Un reporte con su historial, de la más antigua a la más reciente.
// Los admins lo leen de la tabla (datos exactos); los demás, de la vista pública.
export function cargarReporte(id, esAdmin = false) {
  return supabase
    .from(esAdmin ? "reportes" : "reportes_publicos")
    .select(`${COLUMNAS_REPORTE}, direccion, actualizaciones (id, estado, comentario, created_at)`)
    .eq("id", id)
    .order("created_at", { referencedTable: "actualizaciones" })
    .maybeSingle();
}

//diccionario de estados, con el color de su etiqueta.
const ESTADOS = {
  pendiente: { texto: "Pendiente", clases: "bg-amber-100 text-amber-800" },
  en_revision: { texto: "En revisión", clases: "bg-sky-100 text-sky-800" },
  en_proceso: { texto: "En proceso", clases: "bg-indigo-100 text-indigo-800" },
  resuelto: { texto: "Resuelto", clases: "bg-green-100 text-green-800" },
  rechazado: { texto: "Rechazado", clases: "bg-slate-200 text-slate-700" },
};

// Texto y clases de la etiqueta de un estado; lo usan el popup y el detalle
export function infoEstado(estado) {
  return ESTADOS[estado] ?? { texto: estado, clases: "bg-slate-100 text-slate-700" };
}

export function urlFoto(fotoPath) {
  if (!fotoPath) return null;
  return supabase.storage.from("fotos-reportes").getPublicUrl(fotoPath).data
    .publicUrl;
}

// Lista de estados en orden, para los <select> del panel
export const LISTA_ESTADOS = Object.keys(ESTADOS);

// Todos los reportes, los más recientes primero. Si se pasa estado, se filtra.
export function cargarReportesAdmin(estado) {
  let consulta = supabase
    .from("reportes")
    .select(COLUMNAS_REPORTE)
    .order("created_at", { ascending: false });
  if (estado) consulta = consulta.eq("estado", estado);
  return consulta;
}

// Fecha y hora en formato corto, ej: "8 nov 2026, 10:30"
export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Deja el folio como lo guarda la base de datos.
// Acepta "mgd-15", "15", " MGD-0015 " y los convierte en "MGD-0015".
// Si no parece folio, devuelve el texto en mayúsculas tal cual.
export function normalizarFolio(texto) {
  let limpio = texto.trim().toUpperCase().replace(/\s/g, "");
  if (limpio.startsWith("MGD-")) limpio = limpio.slice(4);
  else if (limpio.startsWith("MGD")) limpio = limpio.slice(3);

  if (!/^\d+$/.test(limpio)) return texto.trim().toUpperCase();

  // Quita ceros de más y vuelve a rellenar hasta 4 dígitos
  const numero = String(Number(limpio));
  return "MGD-" + numero.padStart(4, "0");
}

// Consulta pública por folio (función consultar_folio en la base de datos).
// data es null si el folio no existe.
export function consultarFolio(folio) {
  return supabase.rpc("consultar_folio", { p_folio: folio });
}

// El trigger en la base de datos cambia el estado del reporte
export function publicarActualizacion(reporteId, estado, comentario) {
  return supabase
    .from("actualizaciones")
    .insert({ reporte_id: reporteId, estado, comentario: comentario || null });
}