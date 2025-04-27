import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import  es  from 'date-fns/locale/es';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);
  const myEventsList= [{
    title: "today",
    start: new Date('2024-11-18 10:22:00'),
    end: new Date('2024-11-18 15:42:00')
  },
{
  title: "string",
   start: new Date('2019-05-05 12:22:00'),
  end: new Date('2019-05-05 13:42:00')
}]
const eventosCalendario = Object.entries(eventos).map(i=>i[1]) 
console.log("data desde props",eventos)
console.log("data desde eventosCalendario",eventosCalendario[0])
console.log("data desde myeventlist",myEventsList)
  return (
    <div className='mb-2 mt-2 m-2'>
      <div className="calendario-container" style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        culture="es"
        events={eventosCalendario[0]}
        startAccessor="start"
        endAccessor="end"
        defaultView='agenda'
        style={{ height: 500 }}
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
    <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div className="">
              <img src={selectedEvent.afiche} style={{ width: "100%", marginBottom: "15px", borderRadius: "5px" }}/>
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
  </div>
  )
}
export default Calendario;