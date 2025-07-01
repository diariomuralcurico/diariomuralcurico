import { useState, useEffect } from "react";

import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../../../config/Firebase";

import Modal from "react-bootstrap/Modal";

import { Col, Container, Row } from "react-bootstrap";
import { DateTime } from "luxon";

import Tarjeta from "../../../components/Tarjeta/Tarjeta/Tarjeta.jsx";

import "./Cartadisp.css";
const Cartadisp = () => {
  const [show, setShow] = useState(true);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCard = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "menu"), where("aprobado", "==", 1));
        const response = await getDocs(q);
        const todayStart = DateTime.now()
          .setZone("America/Santiago")
          .startOf("day");

        const docs = [];
        response.docs.forEach((doc) => {
          const data = doc.data();
          const fechaHoraActividad = data.fechaHoraActividad;
          const fechaHoraFinActividad = data.fechaHoraFinActividad;
          if (!fechaHoraActividad || !fechaHoraFinActividad) {
            return;
          }

          const startDate = DateTime.fromJSDate(
            data.fechaHoraActividad.toDate(),
          ).setZone("America/Santiago");
          const endDate = DateTime.fromJSDate(
            data.fechaHoraFinActividad.toDate(),
          ).setZone("America/Santiago");

          const baseEvent = {
            id: doc.id,
            title: data.nombre,
            description: data.descripcion,
            address: data.direccion,
            link: data.link,
            image: data.afiche || [],
            precio: data.precio,
            categoria: data.categoria,
            organiza: data.organiza,
            persona: data.persona,
            telefono: data.telefono,
            correo: data.correo,
            edad: data.edad,
            color: data.color,
            recurrence: data.recurrence,
            endRecurrenceDate: data.endRecurrenceDate
              ? DateTime.fromJSDate(data.endRecurrenceDate.toDate())
                  .setZone("America/Santiago")
                  .toJSDate()
              : null,
            aprobado: data.aprobado,
            createdBy: data.createdBy,
          };

          if (!data.recurrence || data.recurrence === "None") {
            if (startDate >= todayStart) {
              docs.push({
                ...baseEvent,
                start: startDate.toJSDate(),
                end: endDate.toJSDate(),
              });
            }
            return;
          }

          if (
            data.recurrence &&
            data.recurrence !== "None" &&
            data.endRecurrenceDate
          ) {
            const endRecurrence = DateTime.fromJSDate(
              data.endRecurrenceDate.toDate(),
            ).setZone("America/Santiago");
            if (endRecurrence < todayStart) {
              return;
            }

            let currentDate = startDate;
            const eventDuration = endDate.diff(startDate).as("milliseconds");

            while (currentDate <= endRecurrence) {
              if (currentDate >= todayStart) {
                const instanceStart = currentDate;
                const instanceEnd = currentDate.plus({
                  milliseconds: eventDuration,
                });
                docs.push({
                  ...baseEvent,
                  id: `${doc.id}_${currentDate.toISODate()}`,
                  start: instanceStart.toJSDate(),
                  end: instanceEnd.toJSDate(),
                });
              }

              switch (data.recurrence.toLowerCase()) {
                case "daily":
                  currentDate = currentDate.plus({ days: 1 });
                  break;
                case "weekly":
                  currentDate = currentDate.plus({ weeks: 1 });
                  break;
                case "monthly":
                  currentDate = currentDate.plus({ months: 1 });
                  break;
                default:
                  // console.warn(
                  //   `Recurrence type ${data.recurrence} not supported for event ${doc.id}`,
                  // );
                  return;
              }
            }
          }
        });

        setMenu(docs);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    getCard();
  }, []);

  return (
    <div>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="tituloModal"
            id="example-custom-modal-styling-title"
          >
            <Container className="d-flex align-items-center">
              <Col xs={6} sm={6} md={4} lg={4}>
                <a
                  href="https://diariomuralcurico.cl/"
                  className="d-inline-block"
                >
                  <img
                    className="logoMuralCartaDisp"
                    alt="Logo Diario Mural Curicó"
                    src="/images/lgdmcfull2.png"
                  />
                </a>
              </Col>
              <Col xs={7} sm={7} md={8} lg={8}>
                Estamos comenzando y abiertos a sugerencias
              </Col>
            </Container>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-center modalBodyText">
            Escríbenos a{" "}
            <a href="mailto:diariomuralcurico@gmail.com">
              diariomuralcurico@gmail.com
            </a>
          </p>
        </Modal.Body>
      </Modal>
      <Tarjeta menu={menu} setMenu={setMenu} loading={loading} />
    </div>
  );
};

export default Cartadisp;
