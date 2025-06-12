import imageCompression from "browser-image-compression";
import React, { useState, useEffect, useRef } from "react";
import CalendarView from "./CalendarView";
import EventDialog from "./EventDialog";
import HourlyViewModal from "./HourlyViewModal";
import TourModal from "./TourModal";
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
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDateForHours, setSelectedDateForHours] = useState(null);
  const calendarRef = useRef(null);

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
    afiche: [],
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.getDate();

  // Tour steps with actions
  const tourSteps = [
    {
      title: "¡Bienvenido a tu Calendario!",
      message:
        "Esta es tu herramienta para publicar actividades. Haz doble clic en cualquier día para agregar un evento. Será revisado por nosotros.",
      target: ".calendar-day",
      position: "bottom",
      action: {
        type: "doubleClick",
        target: `div[data-day="${tomorrowDate}"]`,
        description: "Haz doble clic aquí para abrir la vista por horas",
      },
    },
    {
      title: "Explora la Vista por Horas",
      message:
        "En la vista por horas, puedes ver los eventos del día y agregar nuevos. Desplázate para ver un ejemplo de horario.",
      target: ".hourly-view-container",
      position: "right",
      action: {
        type: "scroll",
        target: ".hourly-view-container",
        scrollTo: "14:00",
        highlight: true,
        description: "Desplázate para ver el horario de las 14:00",
      },
    },
    {
      title: "Clickea en botón de mas",
      message: "Se abrirá el formulario del evento",
      target: ".hourly-view-container",
      position: "right",
      action: {
        type: "click",
        target: `button[data-hour="14:00"]`,
        description: "Haz doble clic aquí para abrir la vista por horas",
      },
    },
    {
      title: "Crea un Evento",
      message:
        "Ahora, crea un evento rellenando el formulario. Te mostraremos cómo hacerlo.",
      target: null,
      position: "center",
      action: {
        type: "fillForm",
        formData: {
          title: "Evento de Ejemplo",
          date: new Date().toISOString().split("T")[0],
          time: "14:00",
          endTime: "15:00",
          fechaFin: new Date().toISOString().split("T")[0],
          description: "Este es un evento de prueba para la guía.",
          direccion: "Calle Ejemplo 123, Curicó",
          organiza: "Diario Mural Curicó",
          categoria: "Artes y diseño",
          precio: "0",
          persona: "Juan Pérez",
          telefono: "+56912345678",
          correo: "juan@ejemplo.com",
          link: "https://ejemplo.com",
          edad: "Todas las edades",
          color: "#f9a8d4",
          recurrence: "None",
        },
        description: "Mira cómo rellenamos un formulario de evento",
      },
    },
    {
      title: "Navega por los Meses",
      message: "Usa los botones 'Anterior' y 'Siguiente' para cambiar de mes.",
      target: ".month-nav",
      position: "bottom",
      action: null,
    },
    {
      title: "¡Listo para Empezar!",
      message:
        "¡Explora y comienza a publicar tus eventos! Puedes cerrar esta guía ahora.",
      target: null,
      position: "center",
      action: null,
    },
  ];

  // Check if user has seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tourSeen_${user?.uid}`);
    if (user?.uid && !hasSeenTour) {
      setShowTour(true);
      // Select a day for the first step
      const today = new Date();
      setSelectedDay(today);
      setSelectedDateForHours(today);
    }
  }, [user]);

  // Execute tour actions
  const executeAction = (action) => {
    if (!action) return;
    let targetElement = document.querySelector(action.target);
    switch (action.type) {
      case "doubleClick":
        if (targetElement) {
          const event = new MouseEvent("dblclick", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          targetElement.dispatchEvent(event);
        }
        break;
      case "click":
        targetElement = document.querySelector(action.target);
        if (targetElement) {
          const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          targetElement.dispatchEvent(event);
        }
        break;
      case "scroll":
        const scrollContainer = document.querySelector(action.target);
        if (scrollContainer) {
          const timeSlot = Array.from(
            scrollContainer.querySelectorAll(".hour-slot"),
          ).find((slot) => slot.dataset.time === action.scrollTo);
          if (timeSlot) {
            timeSlot.scrollIntoView({ behavior: "smooth", block: "center" });
            if (action.highlight) {
              timeSlot.classList.add("highlight");
              setTimeout(() => timeSlot.classList.remove("highlight"), 3000);
            }
          }
        }
        break;
      case "fillForm":
        setNewEvent({
          ...initialEventState,
          ...action.formData,
          date: action.formData.date,
          fechaFin: action.formData.fechaFin,
        });
        setShowDialog(true);
        setEditingEvent(null);
        setSelectedDay(new Date(action.formData.date));
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }
  };

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
      // Close any open modals for clean transition
      setShowDialog(false);
      setShowHourlyModal(false);
      executeAction(tourSteps[tourStep].action);
    } else {
      setShowTour(false);
      setShowDialog(false);
      setShowHourlyModal(false);
      // localStorage.setItem(`tourSeen_${user?.uid}`, "true");
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    setShowDialog(false);
    setShowHourlyModal(false);
    // localStorage.setItem(`tourSeen_${user?.uid}`, "true");
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(
          collection(db, "menu_test"),
          or(where("createdBy", "==", user.uid), where("aprobado", "==", 1)),
        );
        const eventsSnapshot = await getDocs(q);
        const fetchedEvents = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            createdBy: doc.createdBy,
            aprobado: doc.aprobado,
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
            afiche: Array.isArray(data.afiche)
              ? data.afiche
              : [data.afiche].filter(Boolean),
          };
        });
        setEvents(fetchedEvents);
        if (onEventChange) onEventChange(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events from Firestore:", error);
      }
    };
    if (user?.uid) fetchEvents();
  }, [user]);

  const handleAddOrUpdateEvent = async (setErrors = () => {}) => {
    setLoading(true);
    const newErrors = {};
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const normalizeDateString = (input) => {
      if (!input) return "";
      if (input instanceof Date) {
        if (isNaN(input.getTime())) return "";
        return input.toISOString().split("T")[0];
      }
      if (typeof input === "string") {
        const parts = input.split("T");
        if (parts[0] && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
          return parts[0];
        }
      }
      console.warn("Invalid date input:", input);
      return "";
    };

    const normalizedDate = normalizeDateString(newEvent.date);
    const normalizedFechaFin = normalizeDateString(newEvent.fechaFin);
    const normalizedEndRecurrenceDate = normalizeDateString(
      newEvent.endRecurrenceDate,
    );

    const startDateStr = `${normalizedDate}T${newEvent.time || "00:00"}:00`;
    const endDateStr = `${normalizedFechaFin}T${newEvent.endTime || "23:59"}:59`;
    const endRecurrenceDateStr = `${normalizedEndRecurrenceDate}T${newEvent.endTime || "23:59"}:59`;

    const startDate = new Date(startDateStr);
    const endRecurDate =
      newEvent.recurrence !== "None" && endRecurrenceDateStr
        ? new Date(endRecurrenceDateStr)
        : startDate;
    const endDate = new Date(endDateStr);

    let imageUrls = editingEvent ? [...(newEvent.afiche || [])] : [];

    if (
      newEvent.afiche &&
      newEvent.afiche.some((file) => file instanceof File)
    ) {
      try {
        const newImageUrls = await Promise.all(
          newEvent.afiche
            .filter((file) => file instanceof File)
            .map(async (file) => {
              // Opciones de compresión
              const compressionOptions = {
                maxSizeMB: 1, // Máximo 1MB
                maxWidthOrHeight: 1920, // Máxima resolución de 1920px
                useWebWorker: true, // Usar Web Worker para no bloquear el hilo principal
              };

              let fileToUpload = file;
              try {
                // Comprimir la imagen
                fileToUpload = await imageCompression(file, compressionOptions);
                console.log(
                  `Imagen comprimida: ${file.name}, tamaño original: ${
                    file.size / 1024
                  } KB, tamaño comprimido: ${fileToUpload.size / 1024} KB`,
                );
              } catch (compressionError) {
                console.error(
                  "Error al comprimir la imagen:",
                  compressionError,
                );
              }
              const uniqueImageName = `images/${Date.now()}-${file.name}`;
              const imageRef = ref(storage, uniqueImageName);
              await uploadBytes(imageRef, fileToUpload);
              return await getDownloadURL(imageRef);
            }),
        );
        imageUrls = [
          ...imageUrls.filter((url) => typeof url === "string"),
          ...newImageUrls,
        ];
      } catch (error) {
        console.error("Error uploading afiches to Firebase Storage:", error);
        setErrors({
          afiche: "Error al subir los afiches. Por favor, intenta de nuevo.",
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
        id: `${startDate.toISOString()}-${Math.random()}`,
        nombre: newEvent.title,
        time: newEvent.time || null,
        endTime: newEvent.endTime || null,
        descripcion: newEvent.description,
        direccion: newEvent.direccion,
        organiza: newEvent.organiza,
        categoria: newEvent.categoria,
        precio: newEvent.precio === "-1" ? "Consultar" : newEvent.precio,
        afiche: imageUrls,
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
        aprobado: newEvent.aprobado || 0,
        createdBy: newEvent.createdBy || user.uid,
      };

      if (editingEvent) {
        const updatedEvent = {
          ...eventBase,
          fechaHoraActividad: Timestamp.fromDate(startDate),
          fechaHoraFinActividad: Timestamp.fromDate(endDate),
        };
        await updateDoc(doc(db, "menu_test", editingEvent.docId), updatedEvent);
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

      setShowDialog(false);
      const dialogCloseAnimationDuration = 300;
      setTimeout(() => {
        setEditingEvent(null);
        setSelectedDay(null);
      }, dialogCloseAnimationDuration);
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
    const eventOriginal = events.find((e) => e.docId === event.docId) || event;
    setNewEvent({
      aprobado: event.aprobado || 0,
      title: event.title || event.nombre || "",
      date: event.date || "",
      time: eventOriginal.time || "",
      endTime: eventOriginal.endTime || "",
      fechaFin: event.fechaFin || event.date || "",
      description: event.description || event.descripcion || "",
      direccion: event.direccion || event.address || "",
      organiza: event.organiza || "",
      categoria: event.categoria || "Artes y diseño",
      precio: event.precio === "Consultar" ? "-1" : event.precio || "",
      afiche: Array.isArray(event.afiche)
        ? [...event.afiche]
        : [event.afiche].filter(Boolean),
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
    <div
      className={`max-w-5xl mx-auto p-4 sm:p-6 ${className}`}
      ref={calendarRef}
    >
      <h1
        className="text-3xl font-bold text-center mb-8 text-gray-800 font-codec"
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        Publica tu Actividad
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
        showDialog={showDialog}
      />
      <EventDialog
        show={showDialog}
        onClose={() => {
          setShowDialog(false);
          const dialogCloseAnimationDuration = 300;
          setTimeout(() => {
            setEditingEvent(null);
          }, dialogCloseAnimationDuration);
        }}
        onAdd={handleAddOrUpdateEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        selectedDate={selectedDay}
        showTimeField={true}
        isEditing={!!editingEvent}
      />
      {showTour && (
        <TourModal
          step={tourSteps[tourStep]}
          currentStep={tourStep}
          totalSteps={tourSteps.length}
          onNext={handleTourNext}
          onSkip={handleTourSkip}
          onAction={() => executeAction(tourSteps[tourStep].action)}
        />
      )}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <BarLoader color="#4f46e5" height={5} width={200} />
            <p className="mt-4 text-gray-700 font-codec">Guardando evento...</p>
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
