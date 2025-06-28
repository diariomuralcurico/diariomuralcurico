import React, { useState } from "react";
import { Carousel, Image, Col, Row, Container } from "react-bootstrap";
import "./Inicio.css";

// Define constants for reusability
const DEFAULT_IMAGE = "/images/default.jpg";
const CAROUSEL_ITEMS = [
  { src: "/images/afcorpo.png", alt: "Corporación Cultural de Curicó" },
  { src: "/images/afmaca.jpeg", alt: "Terapia Gestalt Curicó" },
  { src: "/images/afnagata.jpeg", alt: "Nagata Juegos" },
];
const SPONSORS = [
  {
    href: "https://www.nagata.cl",
    src: "/images/nagata.png",
    alt: "Juegos de Mesa Nagata",
  },
  {
    href: "https://wa.me/56992509905",
    src: "/images/maca2.png",
    alt: "Terapia Gestalt Curicó",
  },
  {
    href: "https://www.culturalcurico.cl",
    src: "/images/corpo.png",
    alt: "Corporación Cultural de Curicó",
  },
];

const Inicio = () => {
  // State for carousel index
  const [index, setIndex] = useState(0);

  // Handle carousel navigation
  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Handle image load errors
  const handleImageError = (e, src) => {
    console.error(`Failed to load image: ${src}`);
    e.target.src = DEFAULT_IMAGE;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Carousel Section */}
      <section className="carousel-container">
        <Carousel
          activeIndex={index}
          onSelect={handleSelect}
          className="carousel-wrapper"
          indicators
          controls
        >
          {CAROUSEL_ITEMS.map((item, idx) => (
            <Carousel.Item key={idx}>
              <Image
                className="carousel-image d-block w-100 h-100"
                src={item.src}
                alt={item.alt}
                onError={(e) => handleImageError(e, item.src)}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* Main Content Container */}
      <Container className="py-16">
        {/* About Us Section */}
        <Row className="items-center mb-16">
          <Col md={12} lg={6} className="mb-6 lg:mb-0">
            <Image
              className="img-secciones w-100 rounded-xl shadow-md"
              src="/images/teatro.png"
              alt="Teatro Curicó"
              onError={(e) => handleImageError(e, "teatro.png")}
            />
          </Col>
          <Col md={12} lg={6}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-codec text-center lg:text-left mb-6">
              Quiénes Somos
            </h2>
            <p className="text-lg text-gray-700 font-codec mb-4 leading-relaxed">
              Somos vecinos de Curicó, impulsando un proyecto de participación
              ciudadana.
            </p>
            <p className="text-lg text-gray-700 font-codec mb-4 leading-relaxed">
              Nos preocupa la falta de participación en la oferta cultural local
              y la construcción de identidad comunitaria. Amamos nuestra ciudad
              y trabajamos para fomentar una solución que despierte la vitalidad
              cultural de Curicó.
            </p>
            <p className="text-lg font-bold text-indigo-600 font-codec text-center lg:text-left">
              ¡Por un Curicó más vivo!
            </p>
          </Col>
        </Row>

        {/* Description Section */}
        <Row className="items-center mb-16">
          <Col md={12} lg={6} className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-codec text-center lg:text-left mb-6">
              Descripción General
            </h2>
            <p className="text-lg text-gray-700 font-codec mb-4 leading-relaxed">
              En un mar de banderas, cada persona busca destacar la suya, pero
              se pierde en la multitud. Esta metáfora refleja la dispersión de
              la agenda cultural en nuestra provincia, fragmentada por
              publicaciones independientes en redes sociales.
            </p>
            <p className="text-lg text-gray-700 font-codec mb-4 leading-relaxed">
              Observamos que muchos no están al tanto de las actividades
              locales. Diario Mural Curicó propone una solución: una cartelera
              unificada que visibiliza eventos a nivel provincial.
            </p>
            <p className="text-lg text-gray-700 font-codec leading-relaxed">
              Nuestro objetivo es apoyar a gestores culturales y conectar a la
              comunidad con eventos, promoviendo la identidad cultural y una
              provincia más activa.
            </p>
          </Col>
          <Col md={12} lg={6} className="order-1 lg:order-2 mb-6 lg:mb-0">
            <Image
              className="img-secciones w-100 rounded-xl shadow-md"
              src="/images/cerro.png"
              alt="Ciclismo en el Bosque"
              onError={(e) => handleImageError(e, "cerro.png")}
            />
          </Col>
        </Row>

        {/* Sponsors Section */}
        <section className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-codec mb-12">
            Auspiciado por
          </h2>
          <Row xs={3} className="sponsor-row g-4">
            {SPONSORS.map((sponsor, idx) => (
              <Col key={idx} className="sponsor-col">
                <a
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-link block transition-transform hover:scale-105 focus:outline-none"
                  aria-label={`Visitar ${sponsor.alt}`}
                >
                  <Image
                    className="img-auspiciadores rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    src={sponsor.src}
                    alt={sponsor.alt}
                    onError={(e) => handleImageError(e, sponsor.src)}
                  />
                </a>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default Inicio;
