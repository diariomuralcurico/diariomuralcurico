import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  ListGroup,
  Form,
} from "react-bootstrap";

import { doc, deleteDoc, getFirestore,  } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { BarLoader } from "react-spinners";

import { Slide, ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

import "dayjs/locale/es";

import "./EliminarCard.css";
const EliminarCard = ({ menu, setMenu }) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menu && menu.length > 0 ? setLoading(false) : setLoading(true);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menu]);

  const menuAgrupado = useMemo(() => {
    const grouped = {};

    // Recorremos todas las actividades
    menu.forEach((actividad) => {
      if (actividad && actividad.nombre) {
        const nombre = actividad.nombre.toLowerCase().trim();

        // Si la actividad no está en el objeto, la agregamos
        if (!grouped[nombre]) {
          grouped[nombre] = {
            ...actividad,
            fechas: [actividad.fechaHoraActividad.toMillis()],
          };
        } else {
          grouped[nombre].fechas.push(actividad.fechaHoraActividad.toMillis());
        }
      }
    });
    return Object.values(grouped);
  }, [menu]);

  const menuOrdenado = useMemo(() => {
    return [...menuAgrupado].sort((a, b) => {
      const fechaA = Math.min(...a.fechas); // Usar la fecha más cercana para ordenar
      const fechaB = Math.min(...b.fechas);
      return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });
  }, [menuAgrupado, ordenFecha]);

  const menuOrdenadoFiltrado = useMemo(() => {
    return menuOrdenado.filter((plato) =>
      categoriaSeleccionada ? plato.categoria === categoriaSeleccionada : true
    );
  }, [menuOrdenado, categoriaSeleccionada]);

  const categoriasUnicas = useMemo(() => {
    return [...new Set(menuAgrupado.map((plato) => plato.categoria))];
  }, [menuAgrupado]);

  const toggleOrdenFecha = useCallback(() => {
    setOrdenFecha((prevOrden) => (prevOrden === "asc" ? "desc" : "asc"));
  }, []);

  const handleFiltrarPorCategoria = useCallback((e) => {
    setCategoriaSeleccionada(e.target.value);
  }, []);

  const EliminarActividad = useCallback(
    async (id) => {
      try {
        const db = getFirestore();
        const storage = getStorage(); 
  
        const actividadRef = doc(db, "menu_test", id); 
  
        const imagenURL = menu.find((plato) => plato.id === id)?.afiche;
  
        if (imagenURL) {
          const imageRef = ref(storage, imagenURL); 
          await deleteObject(imageRef); 
          console.log("Imagen eliminada con éxito.");
        }
  
        // Eliminar el documento de Firestore
        await deleteDoc(actividadRef);
  
        // Eliminar el evento de la lista en el estado local
        const updatedMenu = menu.filter((plato) => plato.id !== id);
        setMenu(updatedMenu);
  
        // Mostrar un mensaje de éxito
        toast.success('Actividad con éxito...', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      } catch (error) {
        toast.error('No se ha podido eliminar...', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
  
        console.error("Error al eliminar el evento: ", error);
      }
    },
    [menu, setMenu]
  );

  return (
    <div>
      <div id="menu-display">
        <Row className="g-4 justify-content-center">
          {loading ? (
            <Col
              xs={12}
              sm={12}
              md={12}
              lg={12}
              className="spinnerTarjeta d-flex flex-column justify-content-center align-items-center">
              <BarLoader height={5} width={500} color="#9209db" loading={false} />
              <p className="text-center fw-bold fs-5  mt-2">
                Sin Actividades Disponibles
              </p>
            </Col>
          ) : (
            <>
              <Col xs={12} sm={8} md={8} lg={4}>
                <div id="filtros" className="g-2 mx-2 mt-3 rounded Cardfiltro">
                  <h4 className="fw-bold fs-5 text-center mx-auto">
                    Filtra aquí
                  </h4>
                  <ListGroup>
                    <Form.Select
                      className="mb-2"
                      onChange={handleFiltrarPorCategoria}
                      value={categoriaSeleccionada}>
                      <option value="">Todas las categorías</option>
                      {categoriasUnicas.map((categoria, index) => (
                        <option key={index} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      className="btnFilter fw-bold fs-5 m-1"
                      onClick={toggleOrdenFecha}>
                      {ordenFecha === "asc"
                        ? " Actividades próximas ⬆️"
                        : "Actividades lejanas ⬇️"}
                    </Button>
                  </ListGroup>
                </div>
              </Col>
              <Col xs={12} sm={12} md={12} lg={10} className="mx-auto">
                <div id="contenedorcartas" className="m-2 p-2 rounded">
                  <Row className="g-4 justify-content-center">
                    {menuOrdenadoFiltrado.map((plato) => (
                      <Col
                        className="d-flex justify-content-center"
                        key={plato.id}>
                        <Card className="text-center fixed-card shadow-sm ">
                          <div style={{ marginBottom: "10px" }}></div>
                          <Card.Img
                            loading="lazy"
                            className=" imgCard mb-none "
                            variant="top"
                            src={plato.afiche || "/imagenes/default.jpg"}
                          />
                          <Card.Body>
                            <Card.Title className="tituloCard fw-bold fs-4">
                              {plato.nombre.toUpperCase()}
                            </Card.Title>
                            <p>
                              <strong>Organizador:</strong> {plato.organiza}
                            </p>
                            <Button
                              className="btnFilter fw-bold fs-5 mt-2"
                              onClick={() => EliminarActividad(plato.id)}>
                              Eliminar
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>
            </>
          )}
        </Row>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EliminarCard;
