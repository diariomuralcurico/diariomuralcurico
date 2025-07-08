import { Routes, Route } from "react-router-dom";
import Layout from "../Layout/Layout";
import Inicio from "../../pages/Inicio/Inicio";
import Reservas from "../../pages/Reservas/Reservas";
import Revisar from "../../pages/Revisar/Revisar";
import Programacion from "../../pages/Programacion/Programacion";
import Cartadisp from "../../pages/Menu/CartaDisp/Cartadisp";
import EliminarCarta from "../../pages/Menu/EliminarCarta/EliminarCarta";
import Login from "../../pages/Login/Login";
import ProtectedRoute from "../../components/ProtectedRoute";
import Register from "../../pages/Registro/Register";

const Allroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/quienes-somos" element={<Inicio />} />
        <Route
          path="/publicar"
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Cartadisp />} />
        <Route path="/revlamafe" element={<Revisar />} />
        <Route path="/programacion" element={<Programacion />} />
        <Route path="/programacion/:permalink" element={<Programacion />} />
        <Route path="/deleCard" element={<EliminarCarta />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
};

export default Allroutes;
