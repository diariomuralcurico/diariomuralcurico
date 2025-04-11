
import { Col, Row, Container, Button } from "react-bootstrap";
import logodmcfull from "../../images/lgdmcfull.png";
import "./Footer.css";

const Footer = () => {
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
            <Col
              xs={12}
              sm={6}
              md={5}
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
            <Col
              xs={12}
              sm={6}
              md={7}
              className="d-flex justify-content-center justify-content-sm-end">
              <ul className="m-4 list-unstyled d-flex align-items-center">
                <li className="mx-2">
                  <Button
                    href="mailto:diariomuralcurico@gmail.com"
                    variant="link"
                    style={{ textDecoration: "none", color: "white" }}>
                    diariomuralcurico@gmail.com
                  </Button>
                </li>
                <li className="mx-2">
                  <a
                    href="https://www.instagram.com/diariomuralcurico/"
                    target="_blank"
                    rel="noopener noreferrer"
                      variant="link"
                    style={{ textDecoration: "none", color: "white" }}>
                      Instagram
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <hr className="block mx-4 mt-10" />
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
