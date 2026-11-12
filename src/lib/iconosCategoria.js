// Íconos de las categorías. En la base de datos se guarda el nombre
// (columna icono) y aquí se busca el componente de lucide-react.
// Solo se importan estos 8 para no meter toda la librería en la app.
import {
  Armchair,
  CircleHelp,
  Construction,
  Droplets,
  Lightbulb,
  Trash2,
  Trees,
  TriangleAlert,
} from "lucide-react";

const ICONOS = {
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  Armchair,
  TriangleAlert,
  Trees,
  CircleHelp,
};

// Gris que se usa cuando una categoría no tiene color
export const COLOR_SIN_CATEGORIA = "#475569";

// Si el nombre no está en la lista (o viene vacío) se usa el signo de pregunta
export function iconoCategoria(nombre) {
  return ICONOS[nombre] ?? CircleHelp;
}
