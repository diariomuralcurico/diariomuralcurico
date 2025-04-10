import { Col, Row, Container, Button } from "react-bootstrap";
import logodmcfull from "../../images/lgdmcfull.png";
import { TbMail } from "react-icons/tb";
import "./Footer.css";

const Footer = () => {
  const handleInstagram = () => {
    console.log("a");
    const url = "https://www.instagram.com";
    window.open(url, "_blank");
  };
  return (
    <div className="page-container">
      <style type="text/css">
        {`
          * {
            box-sizing: border-box;
          }
          #rrss > span > img {
            max-height: 2rem;
            box-sizing: border-box;
          }
        `}
      </style>
      <div className="footer d-flex justify-content-center p-4 text-center text-white">
        <Container>
          <Row className="d-flex justify-content-between align-items-center">
            {/* Columna de la imagen a la izquierda */}
            <Col
              xs={12}
              sm={6}
              md={6}
              className="d-flex justify-content-center justify-content-sm-start">
              <a
                href="https://diariomuralcurico.cl/"
                className="d-inline-block">
                <img
                  alt="Logo Diario Mural Curicó"
                  src={logodmcfull}
                  className="logoMuralFooter  "
                />
              </a>
            </Col>
            {/* Columna de los botones a la derecha */}
            <Col
              xs={12}
              sm={6}
              md={6}
              className="d-flex justify-content-center justify-content-sm-end">
              <ul className="m-4 list-unstyled d-flex align-items-center">
                <li className="mx-2">
                <TbMail className="iconMail"/>
                  <Button
                    href="mailto:diariomuralcurico@gmail.com"
                    variant="link"
                    style={{ textDecoration: "none", color: "white" }}>
                    diariomuralcurico@gmail.com
                  </Button>
                </li>
                <li className="mx-2">
                  <Button
                    onClick={() => handleInstagram()}
                    variant="link"
                    style={{ textDecoration: "none", color: "white" }}>
                    Instagram
                  </Button>
                </li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <hr className="block mx-6 mt-10" />
              <p className="copiright text-center text-white pt-4 pb-6 px-3 sm:px-7">
                <small>
                  Diario Mural Curicó © Copyright 2025 - Todos los derechos
                  reservados.
                </small>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Footer;
