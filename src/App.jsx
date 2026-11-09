import { Route, Routes, useLocation } from "react-router";

import Encabezado from "./components/encabezado";
import RutaAdmin from "./components/RutaAdmin";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import NuevaContrasena from "./pages/NuevaContrasena";
import DetalleReporte from "./pages/DetalleReporte";
import Admin from "./pages/Admin";
import Seguimiento from "./pages/Seguimiento";

export default function App() {
  // En el mapa ("/") no va el encabezado porque ahí se usa el panel lateral
  const { pathname } = useLocation();
  const esMapa = pathname === "/";

  return (
    <div className="flex h-svh flex-col">
      {!esMapa && <Encabezado />}

      {/* El mapa ocupa todo el alto disponible; las demás páginas hacen scroll aquí */}
      <main className="relative flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<RecuperarContrasena />} />
          <Route path="/nueva-contrasena" element={<NuevaContrasena />} />
          <Route path="/reporte/:id" element={<DetalleReporte />} />
          <Route path="/seguimiento" element={<Seguimiento />} />
          <Route path="/admin" element={<RutaAdmin><Admin /></RutaAdmin>} />
        </Routes>
      </main>
    </div>
  );
}
