import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Col,
  Row,
  Modal,
  Button,
  ListGroup,
  Form,
} from "react-bootstrap";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "./Tarjeta.css";
import { BarLoader } from "react-spinners";
import CardHeader from "react-bootstrap/esm/CardHeader";

const Tarjeta = ({ menu }) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("asc");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menu && menu.length > 0 ? setLoading(false) : setLoading(true);

    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menu, showModal]);

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
          // Si ya está, solo agregamos la nueva fecha al arreglo
          grouped[nombre].fechas.push(actividad.fechaHoraActividad.toMillis());
        }
      }
    });
    // Devolvemos un arreglo con las actividades agrupadas
    return Object.values(grouped);
  }, [menu]);

  // Ordenar las actividades por fecha
  const menuOrdenado = useMemo(() => {
    return [...menuAgrupado].sort((a, b) => {
      const fechaA = Math.min(...a.fechas); // Usar la fecha más cercana para ordenar
      const fechaB = Math.min(...b.fechas);
      return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });
  }, [menuAgrupado, ordenFecha]);

  // Filtrar las actividades por categoría
  const menuOrdenadoFiltrado = useMemo(() => {
    return menuOrdenado.filter((plato) =>
      categoriaSeleccionada ? plato.categoria === categoriaSeleccionada : true
    );
  }, [menuOrdenado, categoriaSeleccionada]);

  // Generar las categorías únicas
  const categoriasUnicas = useMemo(() => {
    return [...new Set(menuAgrupado.map((plato) => plato.categoria))];
  }, [menuAgrupado]);

  const toggleOrdenFecha = useCallback(() => {
    setOrdenFecha((prevOrden) => (prevOrden === "asc" ? "desc" : "asc"));
  }, []);

  const handleSelectEvent = useCallback((plato) => {
    setSelectedEvent(plato);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleFiltrarPorCategoria = useCallback((e) => {
    setCategoriaSeleccionada(e.target.value);
  }, []);

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
              <BarLoader height={5} width={500} color="#9209db" />
              <p className="text-center fw-bold fs-5  mt-2">
                Cargando Actividades...
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
                                                <CardHeader>
                                                  <Card.Subtitle>
                                                    {dayjs(plato.fechaHoraActividad.toDate())
                                                      .locale("es")
                                                      .format("dddd D MMM YYYY")
                                                      .toUpperCase()}{" "}
                                                    /{" "}
                                                    {dayjs(plato.fechaHoraActividad.toDate()).format(
                                                      "H:mm A"
                                                    )}
                                                  </Card.Subtitle>
                                                </CardHeader>
                          <Card.Img
                            loading="lazy"
                            className=" imgCard mb-none "
                            variant="top"
                            src={plato.image || "/imagenes/default.jpg"}
                          />
                          <Card.Body>
                            <Card.Title className="tituloCard fw-bold fs-4">
                              {plato.nombre.toUpperCase()}
                            </Card.Title>
                            <p>
                              <strong>Ubicación:</strong> {plato.direccion}
                            </p>
                            <Button
                              className="btnFilter fw-bold fs-5 mt-2"
                              onClick={() => handleSelectEvent(plato)}>
                              Ver detalles
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

      {/* Modal de detalles */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              <img
                src={selectedEvent.image || "/imagenes/default.jpg"}
                alt="Imagen del evento"
              />
              <p className="mt-4">
                <strong>Título:</strong> {selectedEvent.nombre}
              </p>
              <p>
                <strong>Fechas:</strong>{" "}
                {selectedEvent.fechas
                  .map((fecha) => dayjs(fecha).locale("es"))
                  .sort((a, b) => a - b)
                  .map((fecha) => fecha.format("D"))
                  .join(", ")}
                {" de "}
                {dayjs(selectedEvent.fechas[0])
                  .locale("es")
                  .format("MMMM YYYY")}{" "}
              </p>
              <p>
                <strong>Descripción:</strong>
                {selectedEvent.descripcion || "Sin descripción"}
              </p>
              <p>
                <strong>Edad Mínima:</strong>{" "}
                {selectedEvent.edad || "No especificada"}
              </p>
              <p>
                <strong>Ubicación:</strong>{" "}
                {selectedEvent.direccion || "No especificada"}
              </p>
              <p>
                <strong>Valor:</strong>{" "}
                {selectedEvent.precio == 0
                  ? "Gratis"
                  : selectedEvent.precio == -1
                  ? "Consultar"
                  : `$${selectedEvent.precio}`}
              </p>
              <p>
                <strong>Organiza:</strong> {selectedEvent.organiza}
              </p>
              <Button variant="link" href={selectedEvent.link}>
                <strong>Redes Click Aquí</strong>
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Tarjeta;
