
import React from 'react';

import {Button, Card, Col ,Row , Ratio} from 'react-bootstrap';
import CardHeader from 'react-bootstrap/esm/CardHeader';
import dayjs from 'dayjs';

const Tarjetarevision = ({ menu, handleUpdate, handleDelete }) => {
    const handleApprove = (id, currentValue) => {
        const confirmAprove = window.confirm("¿Estás seguro de que deseas aprobar este elemento?");
        if (confirmAprove){
            const updatedValue = currentValue === 1 ? 0 : 1;
            handleUpdate(id, { aprovado: updatedValue });  
        }
    };
    const handleDeleteCard = (id) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este elemento?");
        if (confirmDelete) {
            handleDelete(id);
        }
    };
    const handleLink = (url) =>{
        if (url) {
            window.open(url, '_blank');
        } else {
            console.error("URL no válida");
        }
    }
    return (
        <div>
            <div id="menu-display">
                <Row>
                    <Col xs={12} sm={9} md={10}>
                        <div id="contenedorcartas" className='m-2 p-2 border  rounded'>
                            <Row xs={1} sm={1} md={1} lg={2} xl={2} xxl={3} className="g-4">
                                {menu
                                    .filter(plato => plato.aprovado === 0)
                                    .map(plato => (
                                    <Col className="d-flex" key={plato.id}>
                                        <Card className=" text-center flex-fill">
                                            <CardHeader>
                                                <Card.Subtitle>Organiza: {plato.organiza}</Card.Subtitle>
                                            </CardHeader>
                                            <Ratio key={'21x9'} aspectRatio={'21x9'}>
                                                <Card.Img variant="top" src={plato.image} style={{ height: '150px', objectFit: 'cover' }} />
                                            </Ratio>
                                            <Card.Body>
                                                <Card.Text className='text-info'>{plato.categoria}</Card.Text>
                                                <Card.Title>{plato.nombre}</Card.Title>
                                                <Card.Text>Valor: {plato.precio == 0 ? "Gratis" : plato.precio == -1 ? "Consultar" : `$${plato.precio}`}</Card.Text>
                                                <Card.Text>Lugar: {plato.direccion}</Card.Text>
                                                <Card.Text>Responsable: {plato.persona}</Card.Text>
                                                <Card.Text>Fono: {plato.telefono}</Card.Text>
                                                <Card.Text>Correo: {plato.correo}</Card.Text>
                                                <Card.Text>Edad mínima: {plato.edad}</Card.Text>
                                                <Button variant='link' onClick={() => handleLink(plato.link)}>Link publicación redes</Button>
                                                <Card.Text>Descripción: {plato.descripcion}</Card.Text>
                                                <Button variant="success" className="m-2" onClick={() => handleApprove(plato.id, plato.aprovado)}>Aprobar</Button>
                                                <Button variant="warning" className="m-2" onClick={() => handleDeleteCard(plato.id)}>Eliminar</Button>
                                            </Card.Body>
                                            <Card.Footer className="text-muted">
                                                <Card.Text>El {dayjs(plato.fechaHoraActividad.toDate()).locale("es").format('D-MMM-YY')} a las {dayjs(plato.fechaHoraActividad.toDate()).format('H:mm A')}</Card.Text>
                                                <Card.Text>Fin {dayjs(plato.fechaHoraFinActividad.toDate()).locale("es").format('D-MMM-YY')} a las {dayjs(plato.fechaHoraFinActividad.toDate()).format('H:mm A')}</Card.Text>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
export default Tarjetarevision;
