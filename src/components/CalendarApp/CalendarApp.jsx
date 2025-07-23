import imageCompression from "browser-image-compression";
import React, { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon"; // Importar Luxon
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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Timestamp } from "firebase/firestore";
import { BarLoader } from "react-spinners";
import "./TourModal.css";

function CalendarApp({ user, initialEvents = [], className = "", onEventChange }) {
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
    precio: 0,
    afiche: [],
    persona: "",
    telefono: "",
    correo: "",
    link: "",
    edad: "",
    color: "#f9a8d4",
    recurrence: "None",
    endRecurrenceDate: "",
    recurrenceDates: [],
  };

  const [newEvent, setNewEvent] = useState(initialEventState);
  const [editingEvent, setEditingEvent] = useState(null);

  const isMobile = () => window.innerWidth <= 640;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.getDate();

  const tourSteps = [
    {
      title: "¡Selecciona un Día!",
      message: isMobile()
        ? "Toca dos veces el número de un día para ver las horas."
        : "Haz doble clic en el número de un día para ver las horas.",
      target: ".calendar-day",
      action: {
        type: "doubleClick",
        target: `div[data-day="${tomorrowDate}"]`,
      },
    },
    {
      title: "Elige una Hora",
      message: isMobile()
        ? "Toca una hora para agregar un evento."
        : "Haz clic en una hora para agregar un evento.",
      target: ".hour-slot",
      action: {
        type: "clickHour",
        target: `button[data-hour="14:00"]`,
      },
    },
    {
      title: "Crea tu Evento",
      message: "Rellena los detalles del evento y guárdalo.",
      target: null,
      action: {
        type: "fillForm",
        formData: {
          title: "Evento de Ejemplo",
          date: DateTime.now().setZone("America/Santiago").toISODate(),
          time: "14:00",
          endTime: "15:00",
          fechaFin: DateTime.now().setZone("America/Santiago").toISODate(),
          description: "Evento de prueba para la guía.",
          direccion: "Calle Ejemplo 123, Curicó",
          organiza: "Diario Mural Curicó",
          categoria: "Artes y diseño",
          precio: 0,
          persona: "Juan Pérez",
          telefono: "+56912345678",
          correo: "juan@ejemplo.com",
          link: "https://ejemplo.com",
          edad: "",
          color: "#f9a8d4",
          recurrence: "None",
        },
      },
    },
    {
      title: "Últimos detalles",
      message:
        "Cuando completes los datos y finalices, el evento será enviado para revisión. Una vez aprobado, estará visible en la cartelera de actividades.",
      target: null,
      action: null,
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tourSeen_${user?.uid}`);
    if (user?.uid && !hasSeenTour) {
      setShowTour(true);
      const today = DateTime.now().setZone("America/Santiago").toJSDate();
      setSelectedDay(today);
      setSelectedDateForHours(today);
    }
  }, [user]);

  const highlightElement = (element) => {
    if (element) {
      element.classList.add("tutorial-focus");
      setTimeout(() => {
        element.classList.remove("tutorial-focus");
      }, 1000);
    }
  };

  const executeAction = (action) => {
    if (!action) return;
    let targetElement = document.querySelector(action.target);
    switch (action.type) {
      case "doubleClick":
        if (targetElement) {
          highlightElement(targetElement);
          const event = new MouseEvent("dblclick", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          targetElement.dispatchEvent(event);
        }
        break;
      case "clickHour":
        if (targetElement) {
          setSelectedDateForHours(tomorrow);
          setTimeout(() => {
            const hourElement = document.querySelector(action.target);
            if (hourElement) {
              highlightElement(hourElement);
              const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
              });
              hourElement.dispatchEvent(clickEvent);
            }
          }, 500);
        }
        break;
      case "fillForm":
        setNewEvent({
          ...initialEventState,
          ...action.formData,
          date: action.formData.date,
          fechaFin: action.formData.fechaFin,
        });
        setEditingEvent(null);
        setSelectedDay(
          DateTime.fromISO(action.formData.date, {
            zone: "America/Santiago",
          }).toJSDate(),
        );
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }
  };

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      executeAction(tourSteps[tourStep].action);
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      setShowDialog(false);
      setShowHourlyModal(false);
      localStorage.setItem(`tourSeen_${user?.uid}`, "true");
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    setShowDialog(false);
    setShowHourlyModal(false);
    localStorage.setItem(`tourSeen_${user?.uid}`, "true");
  };

  const handleRestartTour = () => {
    localStorage.removeItem(`tourSeen_${user?.uid}`);
    setTourStep(0);
    setShowTour(true);
    const today = DateTime.now().setZone("America/Santiago").toJSDate();
    setSelectedDay(today);
    setSelectedDateForHours(today);
    setTimeout(() => {
      const tomorrowElement = document.querySelector(
        `div[data-day="${tomorrowDate}"]`,
      );
      if (tomorrowElement) {
        try {
          tomorrowElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        } catch (e) {
          console.warn("scrollIntoView no soportado, usando fallback:", e);
          const calendarContainer =
            tomorrowElement.closest(".max-w-5xl") ||
            document.querySelector(".max-w-5xl");
          if (calendarContainer) {
            const offsetTop =
              tomorrowElement.getBoundingClientRect().top +
              calendarContainer.scrollTop -
              calendarContainer.getBoundingClientRect().top;
            calendarContainer.scrollTo({
              top: offsetTop,
              behavior: "smooth",
            });
          }
        }
      } else {
        console.warn("No se encontró el elemento del día de mañana.");
      }
    }, 300);
  };

  const handleAddOrUpdateEvent = async (setErrors = () => {}, selectedWeekdays = [], selectedMonthDays = []) => {
    setLoading(true);
    const newErrors = {};
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const normalizeDateString = (input) => {
      if (!input) return "";
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

    // Convertir fechas a Luxon con zona horaria America/Santiago
    const startDate = DateTime.fromISO(startDateStr, {
      zone: "America/Santiago",
    }).toJSDate();
    const endDate = DateTime.fromISO(endDateStr, {
      zone: "America/Santiago",
    }).toJSDate();
    const endRecurDate =
      newEvent.recurrence !== "None" && normalizedEndRecurrenceDate
        ? DateTime.fromISO(endRecurrenceDateStr, {
            zone: "America/Santiago",
          }).toJSDate()
        : startDate;

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
              const compressionOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              };
              let fileToUpload = file;
              try {
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

    let recurrenceDates = [];
    if (newEvent.recurrence !== "None") {
      const startDateLuxon = DateTime.fromJSDate(startDate).setZone(
        "America/Santiago",
      );
      const endRecurLuxon = DateTime.fromJSDate(endRecurDate).setZone(
        "America/Santiago",
      );

      if (newEvent.recurrence === "Weekly" && selectedWeekdays.length > 0) {
        let tempDate = startDateLuxon;
        while (tempDate <= endRecurLuxon) {
          if (selectedWeekdays.includes(tempDate.weekday)) {
            recurrenceDates.push({
              start: tempDate.toJSDate(),
              end: tempDate.toJSDate(), // Assuming event lasts one day
            });
          }
          tempDate = tempDate.plus({ days: 1 });
        }
      } else if (newEvent.recurrence === "Monthly" && selectedMonthDays.length > 0) {
        let tempDate = startDateLuxon;
        while (tempDate <= endRecurLuxon) {
          if (selectedMonthDays.includes(tempDate.day)) {
            recurrenceDates.push({
              start: tempDate.toJSDate(),
              end: tempDate.toJSDate(),
            });
          }
          tempDate = tempDate.plus({ days: 1 });
        }
      } else {
        let currentDate = startDateLuxon;
        while (currentDate <= endRecurLuxon) {
          const dateStr = currentDate.toISODate();
          const startTime = newEvent.time || "00:00";
          const endTime = newEvent.endTime || "23:59";

          recurrenceDates.push({
            start: DateTime.fromISO(`${dateStr}T${startTime}`, {
              zone: "America/Santiago",
            }).toJSDate(),
            end: DateTime.fromISO(`${dateStr}T${endTime}`, {
              zone: "America/Santiago",
            }).toJSDate(),
          });

          if (newEvent.recurrence === "Daily") {
            currentDate = currentDate.plus({ days: 1 });
          } else if (newEvent.recurrence === "Weekly") {
            currentDate = currentDate.plus({ weeks: 1 });
          } else if (newEvent.recurrence === "Monthly") {
            currentDate = currentDate.plus({ months: 1 });
          } else {
            break;
          }
        }
      }
    }

    try {
      const eventsCollection = collection(db, "menu");
      const eventBase = {
        id: `${DateTime.fromJSDate(startDate).toISO()}-${Math.random()}`,
        nombre: newEvent.title,
        time: newEvent.time || null,
        endTime: newEvent.endTime || null,
        descripcion: newEvent.description,
        direccion: newEvent.direccion,
        organiza: newEvent.organiza,
        categoria: newEvent.categoria,
        precio: newEvent.precio,
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
        selectedWeekdays: selectedWeekdays,
        selectedMonthDays: selectedMonthDays,
      };

      if (editingEvent) {
        const updatedEvent = {
          ...eventBase,
          fechaHoraActividad: Timestamp.fromDate(startDate),
          fechaHoraFinActividad: Timestamp.fromDate(endDate),
        };
        await updateDoc(doc(db, "menu", editingEvent.docId), updatedEvent);
        const updatedEvents = events.map((event) =>
          event.docId === editingEvent.docId
            ? {
                ...event,
                ...updatedEvent,
                date: DateTime.fromJSDate(startDate)
                  .setZone("America/Santiago")
                  .toISO({ suppressMilliseconds: true }),
                fechaFin: DateTime.fromJSDate(endDate)
                  .setZone("America/Santiago")
                  .toISO({ suppressMilliseconds: true }),
                title: updatedEvent.nombre,
                description: updatedEvent.descripcion,
                direccion: updatedEvent.direccion,
                recurrenceDates: updatedEvent.recurrenceDates.map((timestamp) =>
                  DateTime.fromJSDate(timestamp.toDate())
                    .setZone("America/Santiago")
                    .toISO({ suppressMilliseconds: true }),
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
          date: DateTime.fromJSDate(startDate)
            .setZone("America/Santiago")
            .toISO({ suppressMilliseconds: true }),
          fechaFin: DateTime.fromJSDate(endDate)
            .setZone("America/Santiago")
            .toISO({ suppressMilliseconds: true }),
          title: eventBase.nombre,
          description: eventBase.descripcion,
          direccion: eventBase.direccion,
          recurrenceDates: eventBase.recurrenceDates.map((timestamp) =>
            DateTime.fromJSDate(timestamp.toDate())
              .setZone("America/Santiago")
              .toISO({ suppressMilliseconds: true }),
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
        general: "Error al Guardar el evento. Por favor, intenta de nuevo.",
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
      date: event.date
        ? DateTime.fromISO(event.date, { zone: "America/Santiago" }).toISODate()
        : "",
      time: eventOriginal.time || "",
      endTime: eventOriginal.endTime || "",
      fechaFin: event.fechaFin
        ? DateTime.fromISO(event.fechaFin, {
            zone: "America/Santiago",
          }).toISODate()
        : event.date
          ? DateTime.fromISO(event.date, {
              zone: "America/Santiago",
            }).toISODate()
          : "",
      description: event.description || event.descripcion || "",
      direccion: event.direccion || event.address || "",
      organiza: event.organiza || "",
      categoria: event.categoria || "Artes y diseño",
      precio: event.precio,
      afiche: Array.isArray(event.afiche)
        ? [...event.afiche]
        : [event.afiche].filter(Boolean),
      persona: event.persona || "",
      telefono: event.telefono || "",
      correo: event.correo || "",
      link: event.link || "",
      edad: event.edad || "",
      color: event.color || "#f9a8d4",
      recurrence: event.recurrence || "None",
      endRecurrenceDate: event.endRecurrenceDate
        ? DateTime.fromISO(event.endRecurrenceDate, {
            zone: "America/Santiago",
          }).toISODate()
        : "",
      recurrenceDates: event.recurrenceDates || [],
      selectedWeekdays: event.selectedWeekdays || [],
      selectedMonthDays: event.selectedMonthDays || [],
    });
    setEditingEvent({ ...event, selectedWeekdays: event.selectedWeekdays || [], selectedMonthDays: event.selectedMonthDays || [] });
    setShowDialog(true);
  };

  const handleDayClick = (date) => {
    setSelectedDay(null);
    const dateStr = DateTime.fromJSDate(date)
      .setZone("America/Santiago")
      .toISODate();
    setNewEvent({
      ...initialEventState,
      date: dateStr,
      fechaFin: dateStr,
    });
    setShowDialog(true);
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-4 sm:p-6 ${className}`}
      ref={calendarRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-3xl font-bold text-center text-gray-800 font-codec"
          style={{ display: "block" }}
        >
          Publica tu Actividad
        </h2>
        <button
          className="modern-button font-codec"
          onClick={handleRestartTour}
          aria-label="Ver instrucciones de nuevo"
        >
          Ver Instrucciones
        </button>
      </div>
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
        onAdd={(setErrors, selectedWeekdays, selectedMonthDays) => handleAddOrUpdateEvent(setErrors, selectedWeekdays, selectedMonthDays)}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        selectedDate={selectedDay ? new Date(selectedDay) : null}
        showTimeField={true}
        isEditing={!!editingEvent}
        initialSelectedWeekdays={editingEvent ? editingEvent.selectedWeekdays : []}
        initialSelectedMonthDays={editingEvent ? editingEvent.selectedMonthDays : []}
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