
import React, { useState ,useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {Modal, Button} from "react-bootstrap";
import  es  from 'date-fns/locale/es';

import './Calendario.css';

const Calendario = (eventos) => {
  const locales = {
  es: es,
  };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const [selectedEvent, setSelectedEvent] = useState(null);
const [showModal, setShowModal] = useState(false);
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowModal(true);
  },[]);
  const handleCloseModal = useCallback(() => {setShowModal(false)},[]);

const eventosCalendario = Object.entries(eventos).map(i=>i[1]) 
  return (
    <div className='mb-2 mt-4 m-2'>
      <div className="calendario-container">
      <Calendar
        className='calendario'
        localizer={localizer}
        culture="es"
        events={eventosCalendario[0]}
        startAccessor="start"
        endAccessor="end"
        defaultView='agenda'
        onSelectEvent={handleSelectEvent}
        messages={{
          next: 'Siguiente',
          previous: 'Anterior',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          noEventsInRange: 'No hay eventos en este rango',          
        }}
      />
    </div>
    
    {showModal &&(

    <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div className="">
              <img src={selectedEvent.image} style={{ width: "100%", marginBottom: "15px", borderRadius: "5px" }}/>
              <p><strong>Título:</strong> {selectedEvent.title}</p>
              <p><strong>Fecha:</strong> {format(selectedEvent.start, "EEEE dd 'de' MMMM yyyy", { locale: es }).toUpperCase()}</p>
              <p> <strong>Hora:</strong> {format(selectedEvent.start, "HH:mm")}</p>
              <p>{selectedEvent.description || "Sin descripción"}</p>
              <p><strong>Ubicación:</strong> {selectedEvent.address || "No especificada"}</p>
              <Button variant="link"><strong>Redes:</strong> {selectedEvent.link || "No especificada"}</Button>
            </div>
          )}
        </Modal.Body>      
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    )}
  </div>
  )
}
export default Calendario;