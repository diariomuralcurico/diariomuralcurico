import {Nav, Navbar, Row, Col, Container } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import logoencabezado from "../../images/logoencabezado.png";
import logodmcfull from "../../images/lgdmcfull.png";
import insta from "../../images/instagram.png";
import correo from "../../images/correo.png";
import "./Navigation.css";


    
    const Navigation = () => {
      return (
        <div className="background-image">
          {/* Contenedor principal que cambia a columna en móviles */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            {/* Logo principal - centrado en móviles */}
            <div className="text-center text-md-start w-100 w-md-auto">
              <a href="https://diariomuralcurico.cl/" className="d-inline-block">
                <img
                  alt="Logo Diario Mural Curicó"
                  src={logodmcfull}
                  className="logoMuralNav p-2 ml-1"
                />
              </a>
            </div>
    
            <Container fluid className="d-flex justify-content-center justify-content-md-end">
              <div className="d-flex align-items-center">
                <Col xs="auto">
                  <Navbar expand="sm" className="w-100">
                    <Container fluid>
                      {/* Botones visibles en móvil, ahora debajo del logo */}
                      <div className="d-flex btncontainer flex-grow-1 pe-3">
                        <Nav.Link
                          href="/programacion"
                          className="btnLink rounded fw-bold fs-5 m-1 p-2"
                        >
                          Agenda
                        </Nav.Link>
                        <Nav.Link
                          href="/publicar"
                          className="btnLink rounded fw-bold fs-5 m-1 p-2"
                        >
                          Publicar
                        </Nav.Link>
                        <Navbar.Toggle
                          className="bg-custom ms-2"
                          aria-controls="offcanvasNavbar-expand-sm"
                        />
                      </div>
                      
                      <Navbar.Offcanvas
                        id="offcanvasNavbar-expand-sm"
                        aria-labelledby="offcanvasNavbarLabel-expand-sm"
                        placement="end">
                        <Offcanvas.Header closeButton>
                          <Offcanvas.Title id="offcanvasNavbarLabel-expand-sm">
                            <img
                              alt="Logo"
                              src={logoencabezado}
                              className="logoMuralBlackCollapse d-inline-block align-top"
                            />
                          </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                          <Nav className="btncontainer flex-grow-1">
                            <Nav.Link
                              href="/"
                              className="btnLink rounded fw-bold fs-5 m-1 p-2">
                              Inicio
                            </Nav.Link>
                            <Nav.Link
                              href="/quienes-somos"
                              className="btnLink rounded fw-bold fs-5 m-1 p-2">
                              Nosotros
                            </Nav.Link>
                          </Nav>
                          <Row className="d-flex align-items-center d-sm-none justify-content-center text-center mt-2">
                            <Col xs="auto">
                              <a
                                href="https://www.instagram.com/diariomuralcurico"
                                target="_blank"
                                rel="noopener noreferrer">
                                <img
                                  alt="Instagram"
                                  src={insta}
                                  height="50"
                                  className="iconsRedes m-1 d-inline-block align-top"
                                />
                              </a>
                              <a href="mailto:diariomuralcurico@gmail.com">
                                <img
                                  alt="Correo"
                                  src={correo}
                                  height="50"
                                  className="iconsRedes m-1 d-inline-block align-top"
                                />
                              </a>
                            </Col>
                          </Row>
                        </Offcanvas.Body>
                      </Navbar.Offcanvas>
                    </Container>
                  </Navbar>
                </Col>
              </div>
            </Container>
          </div>
        </div>
  );
};

export default Navigation;
