import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Col, Row, Modal, Button, ListGroup, Form } from "react-bootstrap";
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

  // Ya no agrupamos por nombre y fechas, simplemente usamos los eventos tal como están
  const menuOrdenado = useMemo(() => {
    return [...menu].sort((a, b) => {
      const fechaA = new Date(a.fechaHoraActividad.toDate());
      const fechaB = new Date(b.fechaHoraActividad.toDate());
      return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });
  }, [menu, ordenFecha]);

  const menuOrdenadoFiltrado = useMemo(() => {
    return menuOrdenado.filter((plato) =>
      categoriaSeleccionada ? plato.categoria === categoriaSeleccionada : true
    );
  }, [menuOrdenado, categoriaSeleccionada]);

  const categoriasUnicas = useMemo(() => {
    return [...new Set(menu.map((plato) => plato.categoria))];
  }, [menu]);

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
              className="spinnerTarjeta d-flex flex-column justify-content-center align-items-center"
            >
              <BarLoader height={5} width={500} color="#9209db" />
              <p className="text-center fw-bold fs-5 mt-2">Cargando Actividades...</p>
            </Col>
          ) : (
            <>
              <Col xs={12} sm={8} md={8} lg={4}>
                <div id="filtros" className="g-2 mx-2 mt-3 rounded Cardfiltro">
                  <h4 className="fw-bold fs-5 text-center mx-auto">Filtra aquí</h4>
                  <ListGroup>
                    <Form.Select
                      className="mb-2"
                      onChange={handleFiltrarPorCategoria}
                      value={categoriaSeleccionada}
                    >
                      <option value="">Todas las categorías</option>
                      {categoriasUnicas.map((categoria, index) => (
                        <option key={index} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      className="btnFilter fw-bold fs-5 m-1"
                      onClick={toggleOrdenFecha}
                    >
                      {ordenFecha === "asc" ? "Actividades próximas ⬆️" : "Actividades lejanas ⬇️"}
                    </Button>
                  </ListGroup>
                </div>
              </Col>
              <Col xs={12} sm={12} md={12} lg={10} className="mx-auto">
                <div id="contenedorcartas" className="m-2 p-2 rounded">
                  <Row className="g-4 justify-content-center">
                    {menuOrdenadoFiltrado.map((plato) => (
                      <Col className="d-flex justify-content-center" key={plato.id}>
                        <Card className="text-center fixed-card shadow-sm">
                          <CardHeader>
                            <Card.Subtitle>
                              {dayjs(plato.fechaHoraActividad.toDate())
                                .locale("es")
                                .format("dddd D MMM YYYY")
                                .toUpperCase()}{" "}
                              /{" "}
                              {dayjs(plato.fechaHoraActividad.toDate()).format("H:mm A")}
                            </Card.Subtitle>
                          </CardHeader>
                          <Card.Img
                            loading="lazy"
                            className="imgCard mb-none"
                            variant="top"
                            src={plato.afiche || "/imagenes/default.jpg"}
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
                              onClick={() => handleSelectEvent(plato)}
                            >
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
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              <img
                src={selectedEvent.afiche || "/imagenes/default.jpg"}
                alt="Imagen del evento"
              />
              <p className="mt-4">
                <strong>Título:</strong> {selectedEvent.nombre}
              </p>
              <p>
                <strong>Fechas:</strong>{" "}
                {selectedEvent.recurrence === 'None'
                  ? dayjs(selectedEvent.fechaHoraActividad.toDate())
                      .locale("es")
                      .format("D MMMM YYYY")
                  : selectedEvent.recurrenceDates
                      .map((fecha) => dayjs(new Date(fecha)).locale("es"))
                      .sort((a, b) => a - b)
                      .map((fecha) => fecha.format("D"))
                      .join(", ")}{" "}
                {" de "}
                {selectedEvent.recurrence === 'None'
                  ? ""
                  : dayjs(new Date(selectedEvent.recurrenceDates[0]))
                      .locale("es")
                      .format("MMMM YYYY")}
              </p>
              <p>
                <strong>Descripción:</strong>{" "}
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
                {selectedEvent.precio.monto == 0
                  ? "Gratis"
                  : selectedEvent.precio.monto == -1
                  ? "Consultar"
                  : `$${selectedEvent.precio.monto}`}
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