import { useEffect, useState } from "react";
import Mapa from "../components/Mapa";
import PanelLateral from "../components/PanelLateral";
import { cargarCategorias } from "../lib/reportes";

// Aquí viven los datos que comparten el mapa y el panel lateral
export default function Inicio() {
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(false);
  // id de la categoría filtrada, o null para ver todas
  const [filtro, setFiltro] = useState(null);
  const [formAbierto, setFormAbierto] = useState(false);

  useEffect(() => {
    let cancelado = false;

    cargarCategorias().then(({ data, error }) => {
      if (cancelado) return;
      if (error) {
        console.error(error);
        setErrorCategorias(true);
      } else {
        setCategorias(data);
      }
      setCargandoCategorias(false);
    });

    return () => {
      cancelado = true;
    };
  }, []);

  // En celular y tablet el panel va arriba (columna); en escritorio va a la izquierda (fila)
  return (
    <div className="relative flex h-full flex-col lg:flex-row">
      <PanelLateral
        categorias={categorias}
        filtro={filtro}
        onCambiarFiltro={setFiltro}
        formAbierto={formAbierto}
        onReportar={() => setFormAbierto(true)}
      />

      {/* min-h-0 deja que el mapa se encoja y no se salga de la pantalla */}
      <div className="relative min-h-0 flex-1">
        <Mapa
          categorias={categorias}
          cargandoCategorias={cargandoCategorias}
          errorCategorias={errorCategorias}
          filtro={filtro}
          onCambiarFiltro={setFiltro}
          formAbierto={formAbierto}
          onCambiarFormAbierto={setFormAbierto}
        />
      </div>
    </div>
  );
}
