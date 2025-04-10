import React, { useState } from 'react';
import {Carousel, Image , Col , Row , Ratio} from 'react-bootstrap';

const Inicio = () => {
    const [index, setIndex] = useState(0);
    const handleSelect = (selectedIndex, e) => {
      setIndex(selectedIndex);
    };
    const handlePhoto = (n) => {
      const url = 
        n === 2 ? "https://www.nagata.cl" :
        n === 3 ? "https://wa.me/56992509905" :
        n === 4 ? "https://www.culturalcurico.cl" :
        null;
      url ? window.open(url, '_blank') : console.error("URL no válida");
    };
  return (
    <div className='p-4'>
      <div className='mb-2'>
        <Ratio className="container" key={'16x9'} aspectRatio={'16x9'}>
          <div>
            <Carousel activeIndex={index} onSelect={handleSelect}>
              
              <Carousel.Item>
                <img
                  className="d-block w-100 vh-25"
                  src={require('./../../images/afcorpo.png')}
                  alt="corporacion cultural de curico"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block w-100 vh-25"
                  src={require('./../../images/afmaca.jpeg')}
                  alt="terapia gestalt curico"
                />
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block w-100 vh-25"
                  src={require('./../../images/afnagata.jpeg')}
                  alt="nagata juegos"
                />
              </Carousel.Item>
            </Carousel>
          </div>
        </Ratio>
      </div>
      <div className='container'>
        <Row className='row d-flex justify-content-center align-items-center'>
          <Col md={12} lg={6}  >
            <Ratio key={'1x1'} aspectRatio={'1x1'}>
              <Image
              className="w-100 p-4 m-2"
              src={require('./../../images/cerro.png')}
              alt="ciclismo en el bosque"
              />
            </Ratio>
          </Col>
          <Col md={12} lg={6} className=''>
            <h1 className='text-center m-2 p-2'>
            Descripción general del diario mural.
            </h1>
            <p className='text-center m-2 p-2'>
              En un mar de personas con banderas en mano, cada uno pretende visibilizar la propia levantándola por sobre las demás, sin mucho éxito debido a que se pierden en la masa.
              Esta metáfora, refleja el problema de dispersión de la agenda de actividades en la provincia, debido a su publicación independiente a través de redes sociales y donde el algoritmo no logra entregar una cartelera total y congruente al público general.
              Algo que hemos observando en nuestra gente que manifiesta no estar enterada de las actividades que se realizan en sus localidades.
              DMC pretende dar una solución focalizada a nivel provincial, aunando y visibilizando una cartelera unificada de actividades para la provincia.
              Así, queremos aportar a los gestores de actividades, a la identidad cultural, a una provincia más activa y mejor conectada.
            </p>
          </Col>
        </Row>
      </div>
      <div className='container'>
        <Row className='row d-flex justify-content-center align-items-center'>
          <Col md={12} lg={6}>
              <h1 className='text-center m-2 p-2'>
                Quienes somos
              </h1>
              <p className='text-center m-2 p-2'>
                Somos 3 vecinos de Curicó y nos preocupa mucho la falta de participación ciudadana en la oferta cultural local y la generación de identidad local. A nuestro parecer, algunos de los problemas a afrontar hoy son la falta de motivación en la ciudadanía y la falta de una cartelera de actividades accesible y unificada.
                Somos personas de entre 30 y 42 años, trabajamos en nuestra ciudad y nos propusimos desarrollar una solución a estas cuestiones que nos preocupan y motivan mucho. Poseemos las ideas y las habilidades necesarias para dar luz a este proyecto.
              </p>
            </Col>
            <Col md={12} lg={6}>
              <Ratio key={'1x1'} aspectRatio={'1x1'}>
                <Image
                className="w-100 p-4 m-2"
                src={require('./../../images/teatro.png')}
                alt="Teatro curico"
                />
              </Ratio>
            </Col>
        </Row>
            <Row >
              <Col>
                <h1 className='text-center m-2 p-2'>Auspiciado por</h1>
              </Col>
            </Row>
            <Row xs={2} sm={2} md={2} lg={3} xl={3} xxl={3}>
              <Col >
                <Image
                  onClick={() => handlePhoto(2)}
                  className="w-100 p-4"
                  src={require('./../../images/nagata.png')}
                  alt="juegos de mesa nagata"
                />
              </Col>
              <Col>
                <Image
                  onClick={() => handlePhoto(3)}
                  className="w-100 p-4"
                  src={require('./../../images/maca2.png')}
                  alt="terapia gestal curico"
                />
              </Col>
              <Col>
                <Image
                  onClick={() => handlePhoto(4)}
                  className="w-100 p-4"
                  src={require('./../../images/corpo.png')}
                  alt="corporacion cultural de curico"
                />
              </Col>
            </Row>
      </div>
    </div>

  )
}
export default Inicio