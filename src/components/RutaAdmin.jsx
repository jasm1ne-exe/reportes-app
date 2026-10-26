import { Navigate } from "react-router";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "../context/useAuth";

// Envuelve las páginas que solo pueden ver los admins
export default function RutaAdmin({ children }) {
  const { user, esAdmin, cargando, cargandoPerfil } = useAuth();

  if (cargando || cargandoPerfil) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/" replace />;
  return children;
}
