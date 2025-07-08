import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { DateTime } from "luxon";

const generatePermalink = (event) => {
  if (!event || !event.title || !event.start) {
    return "";
  }
  const titleSlug = event.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const eventDate = DateTime.fromJSDate(event.start, {
    zone: "America/Santiago",
  });
  const dateString = eventDate.toFormat("ddMMyyyyHHmm");
  return `${titleSlug}${dateString}`;
};

const Tarjeta = ({ menu, loading }) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("asc");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { permalink } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    if (permalink && menu.length > 0 && !selectedEvent) {
      const eventToOpen = menu.find((e) => generatePermalink(e) === permalink);
      if (eventToOpen) {
        setSelectedEvent(eventToOpen);
        setShowModal(true);
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, permalink, menu, selectedEvent]);

  // Ya no agrupamos por nombre y fechas, simplemente usamos los eventos tal como están
  const menuOrdenado = useMemo(() => {
    return [...menu].sort((a, b) => {
      const fechaA = new Date(a.start);
      const fechaB = new Date(b.start);
      return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });
  }, [menu, ordenFecha]);

  const menuOrdenadoFiltrado = useMemo(() => {
    const filtered = menuOrdenado.filter((plato) =>
      categoriaSeleccionada ? plato.categoria === categoriaSeleccionada : true,
    );
    return filtered;
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
    const eventPermalink = generatePermalink(plato);
    navigate(`/${eventPermalink}`);
  }, [navigate]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
    navigate('/');
  }, [navigate]);

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
              className="spinnerTarjeta d-flex flex-column justify-content-center align-items-center"
            >
              <BarLoader height={5} width={500} color="#9209db" />
              <p className="text-center fw-bold fs-5 mt-2">
                Cargando Actividades...
              </p>
            </Col>
          ) : menuOrdenadoFiltrado.length > 0 ? (
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
                      {ordenFecha === "asc"
                        ? "Actividades próximas ⬆️"
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
                        key={plato.id}
                      >
                        <Card className="text-center fixed-card shadow-sm">
                          <CardHeader>
                            <Card.Subtitle>
                              {dayjs(plato.start)
                                .locale("es")
                                .format("dddd D MMM YYYY")
                                .toUpperCase()}{" "}
                              / {dayjs(plato.start).format("H:mm A")}
                            </Card.Subtitle>
                          </CardHeader>
                          <Card.Img
                            loading="lazy"
                            className="imgCard mb-none"
                            variant="top"
                            src={plato.image?.[0] || "/imagenes/default.jpg"}
                          />
                          <Card.Body>
                            <Card.Title className="tituloCard fw-bold fs-4">
                              {(plato.title || "").toUpperCase()}
                            </Card.Title>
                            <p>
                              <strong>Ubicación:</strong> {plato.address}
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
          ) : (
            <Col xs={12} className="text-center mt-5">
              <p className="fw-bold fs-4">
                No hay actividades disponibles en este momento.
              </p>
            </Col>
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
                src={selectedEvent.image?.[0] || "/imagenes/default.jpg"}
                alt="Imagen del evento"
              />
              <p className="mt-4">
                <strong>Título:</strong> {selectedEvent.title || "Sin título"}
              </p>
              <p>
                <strong>Fechas:</strong>{" "}
                {selectedEvent.recurrence && selectedEvent.recurrence !== "None"
                  ? `Este evento es parte de una serie recurrente. Esta instancia es el ${dayjs(
                      selectedEvent.start,
                    )
                      .locale("es")
                      .format("D MMMM YYYY")}`
                  : dayjs(selectedEvent.start).locale("es").format("D MMMM")}
              </p>
              <p>
                <strong>Descripción:</strong>{" "}
                {selectedEvent.description || "Sin descripción"}
              </p>
              <p>
                <strong>Edad Mínima:</strong>{" "}
                {selectedEvent.edad || "No especificada"}
              </p>
              <p>
                <strong>Ubicación:</strong>{" "}
                {selectedEvent.address || "No especificada"}
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
          <Button
            variant="light"
            onClick={() => {
              const permalinkUrl = `${window.location.origin}/${generatePermalink(selectedEvent)}`;
              navigator.clipboard.writeText(permalinkUrl);
            }}
            className="font-codec bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 transition-colors duration-200"
          >
            Copiar Enlace
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Tarjeta;
