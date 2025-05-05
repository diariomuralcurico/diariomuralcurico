import { useState, useEffect } from "react";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/Firebase";

import Modal from "react-bootstrap/Modal";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { Col, Container, Row } from "react-bootstrap";

import Tarjeta from "../../../components/Tarjeta/Tarjeta/Tarjeta.jsx";

import "./Cartadisp.css";
const Cartadisp = () => {
  const [show, setShow] = useState(true);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const getCard = async () => {
      try {
        const collectionRef = collection(db, "menu");
        const response = await getDocs(collectionRef);

        const docs = response.docs.map((doc) => {
          const data = doc.data();
          data.id = doc.id;
          return data;
        });

        const approvedItems = docs.filter((item) => {
          const now = new Date();
          const fechaFin = item.fechaHoraFinActividad;

          if (fechaFin && fechaFin.seconds) {
            const fechaFinDate = new Date(fechaFin.seconds * 1000);
            const fechaFormateada = format(fechaFinDate, "dd MMMM yyyy", {
              local: es,
            });
            item.fechaFormateada = fechaFormateada;
            return item.aprovado === 1 && fechaFinDate >= now;
          }
          return false;
        });

        console.log("Items aprobados:", approvedItems);
        setMenu(approvedItems);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    getCard();
  }, []);

  return (
    <div>
<Modal
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-dialog-scrollable" // Responsive dialog
        aria-labelledby="modal-title-custom">
        <Modal.Header closeButton>
          <Modal.Title id="modal-title-custom" className="w-100">
            <Container>
              <Row className="align-items-center text-center">
                <Col xs={12} className="mb-2">
                  <a
                    href="https://diariomuralcurico.cl/"
                    className="d-inline-block">
                    <img
                      src="/images/lgdmcfull2.png"
                      alt="Logo Diario Mural Curicó"
                      className="img-fluid"
                      style={{ maxHeight: "120px" }}
                    />
                  </a>
                </Col>

                <Col xs={12}>
                  <h4 className="fw-bold fs-4 mb-3">¡Ya volveremos!</h4>

                  <p className="fs-6 mb-2">
                    Nos encontramos haciendo una mejora muy importante.
                    <br />
                    Relanzaremos el sitio muy pronto 🚀🥳
                  </p>
                  <p className="mt-4 text-muted fs-6 mb-0">
                    Atentamente,
                    <br />
                    <span className="fw-semibold">
                      Equipo Diario Mural Curicó 🤞
                    </span>
                  </p>
                </Col>
              </Row>
            </Container>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-center fs-6 mb-0">
            ¿Tienes dudas o sugerencias? Escríbenos a: <br />
            <a href="mailto:diariomuralcurico@gmail.com">
              diariomuralcurico@gmail.com
            </a>
          </p>
        </Modal.Body>
      </Modal>
      <Tarjeta menu={menu} setMenu={setMenu} />
    </div>
  );
};

export default Cartadisp;
