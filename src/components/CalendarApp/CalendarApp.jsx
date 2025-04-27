import React, { useState, useEffect } from "react";
import CalendarView from "./CalendarView";
import EventDialog from "./EventDialog";
import HourlyViewModal from "./HourlyViewModal";
import PropTypes from "prop-types";
import { db, storage } from "../../config/Firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  or,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Timestamp } from "firebase/firestore";
import { BarLoader } from "react-spinners";

function CalendarApp({
  user,
  initialEvents = [],
  className = "",
  onEventChange,
}) {
  const [events, setEvents] = useState(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialEventState = {
    title: "",
    date: "",
    time: "",
    endTime: "",
    fechaFin: "",
    description: "",
    direccion: "",
    organiza: "",
    categoria: "Artes y diseño",
    precio: "",
    afiche: null,
    persona: "",
    telefono: "",
    correo: "",
    link: "",
    edad: "Todas las edades",
    color: "#f9a8d4",
    recurrence: "None",
    endRecurrenceDate: "",
    recurrenceDates: [],
  };
  const [newEvent, setNewEvent] = useState(initialEventState);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDateForHours, setSelectedDateForHours] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Create an OR query
        const q = query(
          collection(db, "menu_test"),
          or(where("createdBy", "==", user.uid), where("aprobado", "==", 1)),
        );
        const eventsSnapshot = await getDocs(q);
        const fetchedEvents = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            docId: doc.id,
            id: data.id || doc.id,
            ...data,
            date: data.fechaHoraActividad?.toDate().toISOString(),
            fechaFin: data.fechaHoraFinActividad?.toDate().toISOString(),
            endRecurrenceDate: data.endRecurrenceDate
              ? data.endRecurrenceDate.toDate().toISOString()
              : null,
            recurrenceDates: data.recurrenceDates
              ? data.recurrenceDates.map((timestamp) =>
                  timestamp.toDate().toISOString(),
                )
              : [],
            title: data.nombre,
            description: data.descripcion,
            direccion: data.direccion,
            time: data.time || "",
            endTime: data.endTime || "",
          };
        });

        setEvents(fetchedEvents);
        if (onEventChange) onEventChange(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events from Firestore:", error);
      }
    };
    if (user?.uid) fetchEvents(); // Ensure user.uid exists before querying
  }, [user]);

  const handleAddOrUpdateEvent = async (setErrors = () => {}) => {
    setLoading(true);
    const newErrors = {};
    if (!newEvent.title)
      newErrors.title = "El nombre de la actividad es obligatorio";
    if (!newEvent.date) newErrors.date = "La fecha es obligatoria";
    if (!newEvent.fechaFin)
      newErrors.fechaFin = "La fecha de fin es obligatoria";
    if (!newEvent.description)
      newErrors.description = "La descripción es obligatoria";
    if (!newEvent.direccion)
      newErrors.direccion = "La dirección es obligatoria";
    if (!newEvent.organiza)
      newErrors.organiza = "La institución organizadora es obligatoria";
    if (!newEvent.precio) newErrors.precio = "El precio es obligatorio";
    if (!newEvent.persona) newErrors.persona = "El responsable es obligatorio";
    if (!newEvent.telefono) newErrors.telefono = "El teléfono es obligatorio";
    if (!newEvent.correo) newErrors.correo = "El correo es obligatorio";
    if (!newEvent.link) newErrors.link = "El link es obligatorio";
    if (!newEvent.categoria)
      newErrors.categoria = "La categoría es obligatoria";
    if (!editingEvent && !newEvent.afiche) {
      newErrors.afiche = "El afiche es obligatorio";
    }
    if (showHourlyModal) {
      if (!newEvent.time) newErrors.time = "La hora de inicio es obligatoria";
      if (!newEvent.endTime)
        newErrors.endTime = "La hora de fin es obligatoria";
      if (
        newEvent.endTime &&
        newEvent.time &&
        newEvent.endTime <= newEvent.time
      ) {
        newErrors.endTime =
          "La hora de fin debe ser posterior a la hora de inicio";
      }
    }
    if (newEvent.recurrence !== "None" && !newEvent.endRecurrenceDate) {
      newErrors.endRecurrenceDate =
        "La fecha de fin de recurrencia es obligatoria";
    }
    if (newEvent.recurrence !== "None" && newEvent.endRecurrenceDate) {
      const endRecurDate = new Date(newEvent.endRecurrenceDate);
      if (isNaN(endRecurDate.getTime())) {
        newErrors.endRecurrenceDate =
          "La fecha de fin de recurrencia es inválida";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    const startDate = new Date(newEvent.date);
    const endRecurDate =
      newEvent.recurrence !== "None" && newEvent.endRecurrenceDate
        ? new Date(newEvent.endRecurrenceDate)
        : startDate;
    const endDate = new Date(newEvent.fechaFin);
    let imageUrl = editingEvent ? newEvent.afiche : null;
    if (newEvent.afiche && typeof newEvent.afiche !== "string") {
      try {
        const uniqueImageName = `images/${Date.now()}-${newEvent.afiche.name}`;
        const imageRef = ref(storage, uniqueImageName);
        await uploadBytes(imageRef, newEvent.afiche);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Error uploading afiche to Firebase Storage:", error);
        setErrors({
          afiche: "Error al subir el afiche. Por favor, intenta de nuevo.",
        });
        setLoading(false);
        return;
      }
    }
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };
    const addWeeks = (date, weeks) => addDays(date, weeks * 7);
    const addMonths = (date, months) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() + months);
      return result;
    };
    let recurrenceDates = [];
    if (newEvent.recurrence !== "None") {
      let currentDate = new Date(startDate);
      while (currentDate <= endRecurDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const startTime = newEvent.time
          ? `${dateStr}T${newEvent.time}:00`
          : `${dateStr}T00:00:00`;
        const endTime = newEvent.endTime
          ? `${dateStr}T${newEvent.endTime}:00`
          : `${dateStr}T23:59:59`;
        recurrenceDates.push({
          start: new Date(startTime),
          end: new Date(endTime),
        });
        if (newEvent.recurrence === "Daily") {
          currentDate = addDays(currentDate, 1);
        } else if (newEvent.recurrence === "Weekly") {
          currentDate = addWeeks(currentDate, 1);
        } else if (newEvent.recurrence === "Monthly") {
          currentDate = addMonths(currentDate, 1);
        } else {
          break;
        }
      }
    }
    try {
      const eventsCollection = collection(db, "menu_test");
      const eventBase = {
        id: `${newEvent.title}-${startDate.toISOString()}-${Math.random()}`,
        nombre: newEvent.title,
        time: newEvent.time || null,
        endTime: newEvent.endTime || null,
        descripcion: newEvent.description,
        direccion: newEvent.direccion,
        organiza: newEvent.organiza,
        categoria: newEvent.categoria,
        precio: newEvent.precio === "-1" ? "Consultar" : newEvent.precio,
        afiche: imageUrl,
        persona: newEvent.persona,
        telefono: newEvent.telefono,
        correo: newEvent.correo,
        link: newEvent.link,
        edad: newEvent.edad,
        color: newEvent.color,
        recurrence: newEvent.recurrence,
        endRecurrenceDate:
          newEvent.recurrence !== "None"
            ? Timestamp.fromDate(endRecurDate)
            : null,
        recurrenceDates: recurrenceDates.map(({ start }) =>
          Timestamp.fromDate(start),
        ),
        fechaHoraActividad: Timestamp.fromDate(startDate),
        fechaHoraFinActividad: Timestamp.fromDate(endDate),
        aprobado: 0,
        createdBy: user.uid,
      };
      console.log("newEvent antes de guardar:", newEvent);
      if (editingEvent) {
        const updatedEvent = {
          ...eventBase,
          fechaHoraActividad: Timestamp.fromDate(startDate),
          fechaHoraFinActividad: Timestamp.fromDate(endDate),
        };
        await updateDoc(doc(db, "menu_test", editingEvent.docId), updatedEvent);
        console.log("Evento actualizado en Firestore:", updatedEvent);
        const updatedEvents = events.map((event) =>
          event.docId === editingEvent.docId
            ? {
                ...event,
                ...updatedEvent,
                date: startDate.toISOString(),
                fechaFin: endDate.toISOString(),
                title: updatedEvent.nombre,
                description: updatedEvent.descripcion,
                direccion: updatedEvent.direccion,
                recurrenceDates: updatedEvent.recurrenceDates.map((timestamp) =>
                  timestamp.toDate().toISOString(),
                ),
              }
            : event,
        );
        setEvents(updatedEvents);
        if (onEventChange) onEventChange(updatedEvents);
      } else {
        const docRef = await addDoc(eventsCollection, eventBase);
        console.log("Evento creado en Firestore:", eventBase);
        const newEventData = {
          ...eventBase,
          docId: docRef.id,
          date: startDate.toISOString(),
          fechaFin: endDate.toISOString(),
          title: eventBase.nombre,
          description: eventBase.descripcion,
          direccion: eventBase.direccion,
          recurrenceDates: eventBase.recurrenceDates.map((timestamp) =>
            timestamp.toDate().toISOString(),
          ),
        };
        const updatedEvents = [...events, newEventData].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );
        setEvents(updatedEvents);
        if (onEventChange) onEventChange(updatedEvents);
      }
      setNewEvent(initialEventState);
      setEditingEvent(null);
      setShowDialog(false);
      setSelectedDay(null);
    } catch (error) {
      console.error("Error saving event to Firestore:", error);
      setErrors({
        general: "Error al guardar el evento. Por favor, intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    console.log("Evento a editar:", event);
    console.log("endRecurrenceDate:", event.endRecurrenceDate);
    setNewEvent({
      title: event.title || event.nombre || "",
      date: event.date || "",
      time: event.time || "",
      endTime: event.endTime || "",
      fechaFin: event.fechaFin || event.date || "",
      description: event.description || event.descripcion || "",
      direccion: event.direccion || event.address || "",
      organiza: event.organiza || "",
      categoria: event.categoria || "Artes y diseño",
      precio: event.precio === "Consultar" ? "-1" : event.precio || "",
      afiche: event.afiche || null,
      persona: event.persona || "",
      telefono: event.telefono || "",
      correo: event.correo || "",
      link: event.link || "",
      edad: event.edad || "Todas las edades",
      color: event.color || "#f9a8d4",
      recurrence: event.recurrence || "None",
      endRecurrenceDate: event.endRecurrenceDate
        ? typeof event.endRecurrenceDate === "string"
          ? event.endRecurrenceDate
          : event.endRecurrenceDate.toDate().toISOString()
        : "",
      recurrenceDates: event.recurrenceDates || [],
    });
    setEditingEvent({ ...event, docId: event.docId });
    setShowDialog(true);
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
    setNewEvent({
      ...initialEventState,
      date: date.toISOString(),
      fechaFin: date.toISOString(),
    });
    setShowDialog(true);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
        Publica tu actividad
      </h1>
      <CalendarView
        events={events}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        setShowDialog={setShowDialog}
        setNewEvent={setNewEvent}
        setEditingEvent={setEditingEvent}
        setSelectedDay={setSelectedDay}
        selectedDay={selectedDay}
        setShowHourlyModal={setShowHourlyModal}
        setSelectedDateForHours={setSelectedDateForHours}
        onDayClick={handleDayClick}
      />
      <HourlyViewModal
        show={showHourlyModal}
        onClose={() => setShowHourlyModal(false)}
        date={selectedDateForHours}
        events={events}
        setEvents={setEvents}
        setShowDialog={setShowDialog}
        setNewEvent={setNewEvent}
        handleEditEvent={handleEditEvent}
        showDialog={showDialog} // Add this prop
      />
      <EventDialog
        show={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditingEvent(null);
          setNewEvent(initialEventState);
        }}
        onAdd={handleAddOrUpdateEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        selectedDate={selectedDay}
        showTimeField={true}
        isEditing={!!editingEvent}
      />
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <BarLoader color="#9209db" height={5} width={200} />
            <p className="mt-4 text-gray-700">Guardando evento...</p>
          </div>
        </div>
      )}
    </div>
  );
}

CalendarApp.propTypes = {
  initialEvents: PropTypes.array,
  className: PropTypes.string,
  onEventChange: PropTypes.func,
};

export default CalendarApp;
