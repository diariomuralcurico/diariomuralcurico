import React from "react";
import { DateTime } from "luxon";
import useEscapeKey from "./useEscapeKey";
import { useFitText } from "./useFitText"; // Importar el nuevo hook

// Componente interno para usar el hook, ya que no se puede usar en un bucle directamente
const FitText = ({ text }) => {
  const { fontSize, ref } = useFitText(text, 14); // Inicia con 14px
  return (
    <span
      ref={ref}
      style={{ fontSize, display: "block", height: "100%", lineHeight: 1.2 }}
      className="font-medium block"
    >
      {text}
    </span>
  );
};

function HourlyViewModal({
  show,
  onClose,
  date,
  events,
  setEvents,
  setShowDialog,
  setNewEvent,
  handleEditEvent,
  showDialog,
}) {
  useEscapeKey(show && !showDialog, onClose);

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, "0")}:00`,
  );

  const dateString = date
    ? DateTime.fromJSDate(date, { zone: "America/Santiago" }).toISODate()
    : "";

  // Filter events to include only those that occur on the selected date
  const dayEvents = events
    .filter((event) => {
      if (!event.date || !event.fechaFin) {
        console.warn(`Evento con ID ${event.id} tiene fechas inválidas`, event);
        return false;
      }

      const eventStart = DateTime.fromISO(event.date, {
        zone: "America/Santiago",
      });
      const eventEnd = DateTime.fromISO(event.fechaFin, {
        zone: "America/Santiago",
      });
      const currentDate = DateTime.fromJSDate(date, {
        zone: "America/Santiago",
      }).startOf("day");

      if (event.recurrence === "None") {
        return (
          currentDate >= eventStart.startOf("day") &&
          currentDate <= eventEnd.startOf("day")
        );
      }

      return event.recurrenceDates.some((recDate) => {
        const recurrenceDate = DateTime.fromISO(recDate, {
          zone: "America/Santiago",
        });
        return recurrenceDate.hasSame(currentDate, "day");
      });
    })
    .map((event) => {
      const eventStart = DateTime.fromISO(event.date, {
        zone: "America/Santiago",
      });
      const eventEnd = DateTime.fromISO(event.fechaFin, {
        zone: "America/Santiago",
      });
      const selectedDate = DateTime.fromJSDate(date, {
        zone: "America/Santiago",
      });
      let displayTime = event.time || "00:00";
      let displayEndTime = event.endTime || "23:59";

      if (event.recurrence === "None") {
        const isSameDay = eventStart.hasSame(eventEnd, "day");
        const isSelectedDateStart = eventStart.hasSame(selectedDate, "day");
        const isSelectedDateEnd = eventEnd.hasSame(selectedDate, "day");

        if (isSameDay && isSelectedDateStart) {
          displayTime = event.time || "00:00";
          displayEndTime = event.endTime || "23:59";
        } else if (isSelectedDateStart) {
          displayTime = event.time || "00:00";
          displayEndTime = "23:59";
        } else if (isSelectedDateEnd) {
          displayTime = "00:00";
          displayEndTime = event.endTime || "23:59";
        } else {
          displayTime = "00:00";
          displayEndTime = "23:59";
        }
      } else {
        const matchingRecurrence = event.recurrenceDates.find((recDate) => {
          const recDateObj = DateTime.fromISO(recDate, {
            zone: "America/Santiago",
          });
          return recDateObj.hasSame(selectedDate, "day");
        });

        if (matchingRecurrence) {
          const recDateObj = DateTime.fromISO(matchingRecurrence, {
            zone: "America/Santiago",
          });
          displayTime = event.time || recDateObj.toFormat("HH:mm");
          const endDateObj = event.endTime
            ? recDateObj.set({
                hour: parseInt(event.endTime.split(":")[0], 10),
                minute: parseInt(event.endTime.split(":")[1], 10),
              })
            : recDateObj.set({ hour: 23, minute: 59 });
          displayEndTime = endDateObj.toFormat("HH:mm");
        }
      }

      return {
        ...event,
        time: displayTime,
        endTime: displayEndTime,
      };
    });

  const openEventDialog = (hour) => {
    const startHour = parseInt(hour.split(":")[0], 10);
    const defaultEndHour = String(startHour + 1).padStart(2, "0") + ":00";
    const selectedDate = DateTime.fromJSDate(date, {
      zone: "America/Santiago",
    });
    setNewEvent({
      title: "",
      date: selectedDate.toISO(),
      time: hour,
      endTime: defaultEndHour > "24:00" ? "23:59" : defaultEndHour,
      fechaFin: selectedDate.toISO(),
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
      edad: "",
      color: "#f9a8d4",
      recurrence: "None",
      endRecurrenceDate: "",
      recurrenceDates: [],
    });
    setShowDialog(true);
  };

  const timeToMinutes = (timeStr) => {
    if (
      !timeStr ||
      typeof timeStr !== "string" ||
      !/^\d{2}:\d{2}$/.test(timeStr)
    )
      return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? 0 : h * 60 + m;
  };

  const assignHorizontalPositions = (events) => {
    // Sort events by start time and duration
    const sortedEvents = [...events].sort((a, b) => {
      const startDiff = timeToMinutes(a.time) - timeToMinutes(b.time);
      if (startDiff !== 0) return startDiff;
      return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
    });

    // Group all events that overlap in time into a single slot
    const timeSlots = [];
    sortedEvents.forEach((event) => {
      const eventStart = timeToMinutes(event.time);
      const eventEnd = timeToMinutes(event.endTime);

      // Find or create a slot for events that overlap with this event
      let placed = false;
      for (const slot of timeSlots) {
        const slotEvents = slot.events;
        const overlaps = slotEvents.some((slotEvent) => {
          const slotStart = timeToMinutes(slotEvent.time);
          const slotEnd = timeToMinutes(slotEvent.endTime);
          return slotStart < eventEnd && slotEnd > eventStart;
        });

        if (overlaps) {
          slot.events.push(event);
          placed = true;
          break;
        }
      }

      // If no overlapping slot is found, create a new one
      if (!placed) {
        timeSlots.push({ events: [event] });
      }
    });

    // Merge slots that overlap in time to ensure single horizontal placement
    const mergedSlots = [];
    timeSlots.forEach((slot) => {
      const slotEvents = slot.events;
      const slotStart = Math.min(
        ...slotEvents.map((e) => timeToMinutes(e.time)),
      );
      const slotEnd = Math.max(
        ...slotEvents.map((e) => timeToMinutes(e.endTime)),
      );

      let merged = false;
      for (const mergedSlot of mergedSlots) {
        const mergedStart = Math.min(
          ...mergedSlot.events.map((e) => timeToMinutes(e.time)),
        );
        const mergedEnd = Math.max(
          ...mergedSlot.events.map((e) => timeToMinutes(e.endTime)),
        );
        if (slotStart < mergedEnd && slotEnd > mergedStart) {
          mergedSlot.events.push(...slotEvents);
          merged = true;
          break;
        }
      }
      if (!merged) {
        mergedSlots.push({ events: [...slotEvents] });
      }
    });

    // Assign horizontal positions within each merged slot
    return sortedEvents.map((event) => {
      const slotIndex = mergedSlots.findIndex((slot) =>
        slot.events.includes(event),
      );
      const slot = mergedSlots[slotIndex];
      const eventIndex = slot.events.indexOf(event);
      const totalEventsInSlot = slot.events.length;
      return {
        ...event,
        slotIndex,
        eventIndex,
        totalEventsInSlot,
      };
    });
  };

  const eventsWithPositions = assignHorizontalPositions(dayEvents);

  const hourRowHeight = 60;
  const totalHeight = 24 * hourRowHeight;
  const timeLabelWidth = window.innerWidth <= 640 ? "40px" : "45px";
  const buttonWidth = window.innerWidth <= 640 ? "32px" : "36px"; // Increased for better padding
  const eventGap = "6px"; // Gap between events
  const eventPadding = "8px"; // Padding inside events
  const buttonPadding = "2px"; // Padding for buttons

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <style>
        {`
          @media (max-width: 640px) {
            .hourly-view-container {
              padding: 12px;
            }
            .hourly-view-container .relative {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              min-width: 600px;
            }
            .hourly-view-container .hour-slot {
              min-width: 600px;
            }
            .hourly-view-container .time-label {
              font-size: 10px;
              padding-right: 4px;
            }
            .hourly-view-container .add-button {
              width: 20px;
              height: 20px;
              font-size: 14px;
              padding: ${buttonPadding};
            }
            .hourly-view-container .event-block {
              white-space: normal;
              word-wrap: break-word;
              min-width: 120px;
              padding: ${eventPadding};
            }
          }

          @media (min-width: 641px) {
            .hourly-view-container .add-button {
              width: 30px;
              height: 30px;
              font-size: 16px;
              padding: ${buttonPadding};
            }
            .hourly-view-container .event-block {
              padding: ${eventPadding};
            }
          }
        `}
      </style>
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-2xl w-full max-w-[98vw] sm:max-w-4xl max-h-[95vh] flex flex-col hourly-view-container">
        <div className="flex-shrink-0 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-2xl font-semibold text-center text-gray-800 font-codec">
            Eventos del{" "}
            {date
              ? DateTime.fromJSDate(date, {
                  zone: "America/Santiago",
                }).toLocaleString(DateTime.DATE_FULL, { locale: "es-CL" })
              : ""}
          </h2>
        </div>
        <div className="flex-grow overflow-y-auto pr-1 sm:pr-2">
          <div
            className="relative"
            style={{
              height: `${totalHeight}px`,
              overflowX: window.innerWidth <= 640 ? "auto" : "hidden",
              minWidth: window.innerWidth <= 640 ? "600px" : "auto",
            }}
          >
            {hours.map((hour, index) => (
              <div
                key={`hour-${hour}`}
                className="absolute left-0 right-0 border-b border-gray-200 hour-slot"
                data-time={hour}
                style={{
                  top: `${index * hourRowHeight}px`,
                  height: `${hourRowHeight}px`,
                }}
              >
                <div
                  className="absolute text-[10px] sm:text-xs text-gray-500 text-right pr-1 sm:pr-2 font-codec time-label"
                  style={{ left: 0, width: timeLabelWidth, top: "-0.5em" }}
                >
                  {hour}
                </div>
                <button
                  data-hour={hour}
                  onClick={() => openEventDialog(hour)}
                  className="absolute right-1 top-1 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition duration-200 text-sm sm:text-base z-30 font-codec add-button font-medium"
                  style={{
                    left: `calc(${timeLabelWidth} + 6px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  title={`Guardar Evento a las ${hour}`}
                >
                  +
                </button>
              </div>
            ))}
            {eventsWithPositions.map((event) => {
              const startMinutes = timeToMinutes(event.time);
              const endMinutes = timeToMinutes(event.endTime);
              const durationMinutes = Math.max(0, endMinutes - startMinutes);
              if (durationMinutes === 0) return null;
              const topPosition = (startMinutes / (24 * 60)) * totalHeight;
              const eventHeight = (durationMinutes / (24 * 60)) * totalHeight;

              // Calculate horizontal position and width with better spacing
              const totalGapWidth =
                event.totalEventsInSlot > 1
                  ? `calc(${eventGap} * ${event.totalEventsInSlot - 1})`
                  : "0px";
              const availableWidth = `calc(100% - ${timeLabelWidth} - ${buttonWidth} - 12px)`;
              const eventWidth = `calc((${availableWidth} - ${totalGapWidth}) / ${event.totalEventsInSlot})`;
              const eventLeft = `calc(${timeLabelWidth} + ${buttonWidth} + 10px + ${event.eventIndex} * (${eventWidth} + ${eventGap}))`;

              return (
                <div
                  key={event.id}
                  className="absolute rounded-lg text-white text-[10px] sm:text-xs overflow-visible shadow-lg border border-black border-opacity-10 z-20 cursor-pointer hover:opacity-90 hover:shadow-xl transition-all duration-200 font-codec whitespace-normal break-words event-block"
                  style={{
                    top: `${topPosition + 2}px`, // Small top margin
                    height: `${Math.max(eventHeight - 4, 24)}px`, // Small bottom margin
                    left: eventLeft,
                    width: eventWidth,
                    backgroundColor: event.color,
                    minWidth: window.innerWidth <= 640 ? "120px" : "auto",
                    padding: eventPadding,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={() => handleEditEvent(event)}
                  title={`${event.title} (${DateTime.fromISO(event.date, {
                    zone: "America/Santiago",
                  }).toFormat("dd/MM/yyyy HH:mm")} - ${DateTime.fromISO(
                    event.fechaFin,
                    { zone: "America/Santiago" },
                  ).toFormat("dd/MM/yyyy HH:mm")})`}
                >
                  <div style={{ height: "calc(100% - 20px)" }}>
                    {" "}
                    {/* Contenedor para el título */}
                    <FitText text={event.title} />
                  </div>
                  <span className="text-[9px] sm:text-xs block opacity-90 mt-1">
                    {event.time} - {event.endTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end mt-2 sm:mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-codec text-sm sm:text-base font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default HourlyViewModal;
