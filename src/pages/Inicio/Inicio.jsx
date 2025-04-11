import React, { useState } from "react";
import { Carousel, Image, Col, Row, Ratio } from "react-bootstrap";

import "./Inicio.css";

const Inicio = () => {
  const [index, setIndex] = useState(0);
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="p-4">
      <div className="">
        <div>
          <Carousel activeIndex={index} onSelect={handleSelect}>
            <Carousel.Item>
              <img
                className="carousel-img d-block w-100"
                src={require("./../../images/afcorpo.png")}
                alt="corporacion cultural de curico"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="carousel-img d-block w-100"
                src={require("./../../images/afmaca.jpeg")}
                alt="terapia gestalt curico"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="carousel-img d-block w-100"
                src={require("./../../images/afnagata.jpeg")}
                alt="nagata juegos"
              />
            </Carousel.Item>
          </Carousel>
        </div>
      </div>
      <div className="container my-2">
        <Row className="row d-flex justify-content-center align-items-center my-2">
          <Col md={12} lg={6}>
            <Ratio key={"1x1"} aspectRatio={"1x1"}>
              <Image
                className="w-100 p-2 m-2 rounded-4"
                src={require("./../../images/cerro.png")}
                alt="ciclismo en el bosque"
              />
            </Ratio>
          </Col>
          <Col md={12} lg={6}>
            <h1 className="text-center m-2 p-2 fw-bold mx-auto">
              Descripción General
            </h1>
            <p className=" mx-auto fs-5 mb-2">
              En un mar de personas con banderas en mano, cada uno pretende
              visibilizar la propia levantándola por sobre las demás, sin mucho
              éxito debido a que se pierden en la masa.
            </p>
            <p className=" mx-auto fs-5 mb-2">
              Esta metáfora refleja el problema de dispersión de la agenda de
              actividades en la provincia, debido a su publicación independiente
              a través de redes sociales, donde su algoritmo no logra entregar
              una cartelera total y congruente al público.
            </p>
            <p className=" mx-auto fs-5 mb-2">
              Por otro lado, hemos observado que nuestra gente manifiesta no
              estar enterada de las actividades que se realizan en sus
              localidades y Diario Mural Curicó pretende dar una solución
              focalizada a nivel provincial, aunando y visibilizando una
              cartelera unificada de actividades para la provincia.
            </p>
            <p className=" mx-auto fs-5 mb-2">
              Así, queremos aportar a los gestores de actividades y a quienes
              las buscan. Promoviendo espacios de encuentro, la identidad
              cultural y una provincia más activa y mejor conectada.
            </p>
          </Col>
        </Row>
      </div>
      <div className="container">
        <Row className="row d-flex justify-content-center align-items-center mb-4 mt-4">
          <Col md={12} lg={6}>
            <h1 className="text-center fw-bold mx-auto">Quienes somos</h1>
            <p className="fs-5 mt-4 ">
              Somos vecinos de Curicó y esto es un proyecto de participación
              ciudadana.
            </p>
            <p className="fs-5 ">
              Nos preocupa mucho la falta de participación de las personas en la
              oferta cultural local y la generación de identidad local,
              disfrutamos de nuestra bella ciudad y nos propusimos desarrollar
              una solución a estas cuestiones que nos preocupan y motivan mucho.
            </p>
            <p className="text-center m-2 mx-auto fw-bold fs-5 ">¡Por un Curicó, más vivo!</p>
          </Col>
          <Col md={12} lg={6}>
            <Ratio aspectRatio={"1x1"}>
              <Image
                className="imgSecciones p-2 m-2 rounded-4"
                src={require("./../../images/teatro.png")}
                alt="Teatro curico"
              />
            </Ratio>
          </Col>
        </Row>
        <Row className="mb-4 mt-4">
          <Col>
            <h1 className="text-center m-2 p-2 fw-bold mx-auto ">
              Auspiciado por
            </h1>
          </Col>
        </Row>
        <Row xs={2} sm={2} md={2} lg={3} xl={3} xxl={3}>
          <Col>
            <a
              href="https://www.nagata.cl"
              target="_blank"
              rel="noopener noreferrer">
              <Image
                className="imgAsupiciadores w-100 p-4"
                src={require("./../../images/nagata.png")}
                alt="juegos de mesa nagata"
              />
            </a>
          </Col>
          <Col>
            <a
              href="https://wa.me/56992509905"
              target="_blank"
              rel="noopener noreferrer">
              <Image
                className="imgAsupiciadores w-100 p-4"
                src={require("./../../images/maca2.png")}
                alt="terapia gestal curico"
              />
            </a>
          </Col>
          <Col>
            <a
              href="https://www.culturalcurico.cl"
              target="_blank"
              rel="noopener noreferrer">
              <Image
                className="imgAsupiciadores w-100 p-4"
                src={require("./../../images/corpo.png")}
                alt="corporacion cultural de curico"
              />
            </a>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default Inicio;
