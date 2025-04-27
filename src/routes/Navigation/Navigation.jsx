import { Nav, Navbar, Row, Col, Container } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../../components/AuthContext";
import { auth } from "../../config/Firebase";
import "./Navigation.css";

const Navigation = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="background-image">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="text-center text-md-start w-100 w-md-auto">
          <a href="https://diariomuralcurico.cl">
            <img
              alt="Logo Diario Mural Curicó"
              src="/images/lgdmcfull.png"
              className="logoMuralNav mx-auto p-3"
            />
          </a>
        </div>
        <Container
          fluid
          className="d-flex justify-content-center justify-content-md-end"
        >
          <div className="d-flex align-items-center">
            <Col xs="auto">
              <Navbar expand="lg" className="w-100">
                <Container fluid>
                  <div className="d-flex btncontainer flex-grow-1 pe-2">
                    <Nav.Link
                      href="/programacion"
                      className="btnLink rounded fw-bold fs-6 m-1 p-2"
                    >
                      Agenda
                    </Nav.Link>
                    <Nav.Link
                      href="/publicar"
                      className="btnLink rounded fw-bold fs-6 m-1 p-2"
                    >
                      Publicar
                    </Nav.Link>
                  </div>
                  <Navbar.Offcanvas
                    id="offcanvasNavbar-expand-sm"
                    aria-labelledby="offcanvasNavbarLabel-expand-sm"
                    placement="end"
                  >
                    <Offcanvas.Header closeButton>
                      <Offcanvas.Title id="offcanvasNavbarLabel-expand-sm">
                        <img
                          alt="Logo"
                          style={{ textDecoration: "none", color: "white" }}
                          src="/images/logoencabezado.png"
                          className="logoMuralBlack d-inline-block align-top"
                        />
                      </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                      <Nav className="btncontainer flex-grow-1">
                        <Nav.Link
                          href="/"
                          className="btnLink rounded fw-bold fs-6 m-1 p-2"
                        >
                          Inicio
                        </Nav.Link>
                        <Nav.Link
                          href="/quienes-somos"
                          className="btnLink rounded fw-bold fs-6 m-1 p-2"
                        >
                          Nosotros
                        </Nav.Link>
                        {user ? (
                          <button
                            onClick={handleLogout}
                            className="btnLink rounded fw-bold fs-6 m-1 p-2"
                          >
                            Cerrar Sesión
                          </button>
                        ) : (
                          <>
                            <Nav.Link
                              href="/login"
                              className="btnLink rounded fw-bold fs-6 m-1 p-2"
                            >
                              Iniciar Sesión
                            </Nav.Link>
                            {/* <Nav.Link
                              href="/register"
                              className="btnLink rounded fw-bold fs-6 m-1 p-2"
                            >
                              Registrarse
                            </Nav.Link> */}
                          </>
                        )}
                      </Nav>
                      <Row className="d-block d-lg-none align-items-center justify-content-center text-start mt-4">
                        <Col xs="auto">
                          <a
                            href="https://www.instagram.com/diariomuralcurico"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              alt="Instagram"
                              src="/images/instagram.png"
                              height="40"
                              className="iconsRedes m-1 d-inline-block"
                            />
                          </a>
                          <a href="mailto:diariomuralcurico@gmail.com">
                            <img
                              alt="Correo"
                              src="/images/correo.png"
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
