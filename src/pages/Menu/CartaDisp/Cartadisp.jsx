import { useState, useEffect } from "react";

import { collection, getDocs, where, query } from "firebase/firestore";
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
        const q = query(collection(db, "menu"), where("aprobado", "==", 1));
        const response = await getDocs(q);
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
            return item.aprobado === 1 && fechaFinDate >= now;
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
      <Tarjeta menu={menu} setMenu={setMenu} />
    </div>
  );
};

export default Cartadisp;
