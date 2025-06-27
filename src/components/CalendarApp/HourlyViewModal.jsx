import React from "react";
import { DateTime } from "luxon";
import useEscapeKey from "./useEscapeKey";

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
        // For non-recurring events, check if the selected date is within the event's start and end
        return (
          currentDate >= eventStart.startOf("day") &&
          currentDate <= eventEnd.startOf("day")
        );
      }

      // For recurring events, check if the selected date matches any recurrence date
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
          // Single-day event: use exact times
          displayTime = event.time || "00:00";
          displayEndTime = event.endTime || "23:59";
        } else if (isSelectedDateStart) {
          // First day of multi-day event: use event.time for start
          displayTime = event.time || "00:00";
          displayEndTime = "23:59";
        } else if (isSelectedDateEnd) {
          // Last day of multi-day event: start at 00:00, end at event.endTime
          displayTime = "00:00";
          displayEndTime = event.endTime || "23:59";
        } else {
          // Intermediate day of multi-day event: full day
          displayTime = "00:00";
          displayEndTime = "23:59";
        }
      } else {
        // For recurring events, find the matching recurrence date
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
      edad: "Todas las edades",
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

  const assignLanes = (events) => {
    const sortedEvents = [...events].sort((a, b) => {
      const startDiff = timeToMinutes(a.time) - timeToMinutes(b.time);
      if (startDiff !== 0) return startDiff;
      return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
    });
    const lanes = [];
    sortedEvents.forEach((event) => {
      let lane = 0;
      while (
        lanes[lane] &&
        lanes[lane].some((laneEvent) => {
          const laneEventStart = timeToMinutes(laneEvent.time);
          const laneEventEnd = timeToMinutes(laneEvent.endTime);
          const eventStart = timeToMinutes(event.time);
          const eventEnd = timeToMinutes(event.endTime);
          return laneEventStart < eventEnd && laneEventEnd > eventStart;
        })
      ) {
        lane++;
      }
      if (!lanes[lane]) lanes[lane] = [];
      lanes[lane].push(event);
    });
    return sortedEvents.map((event) => {
      const lane = lanes.findIndex((l) => l.includes(event));
      const maxLane = lanes.length;
      return { ...event, lane, maxLane };
    });
  };

  const eventsWithLanes = assignLanes(dayEvents);

  const hourRowHeight = 60;
  const totalHeight = 24 * hourRowHeight;
  const timeLabelWidth = "80px";
  const buttonWidth = "30px";
  const maxLanes = 4;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col hourly-view-container">
        <div className="flex-shrink-0 mb-4">
          <h2 className="text-2xl font-semibold text-center text-gray-800 font-codec">
            Eventos del{" "}
            {date
              ? DateTime.fromJSDate(date, {
                  zone: "America/Santiago",
                }).toLocaleString(DateTime.DATE_FULL, { locale: "es-CL" })
              : ""}
          </h2>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="relative" style={{ height: `${totalHeight}px` }}>
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
                  className="absolute text-xs text-gray-500 text-right pr-2 font-codec"
                  style={{ left: 0, width: timeLabelWidth, top: "-0.5em" }}
                >
                  {hour}
                </div>
                <button
                  data-hour={hour}
                  onClick={() => openEventDialog(hour)}
                  className="absolute right-1 top-1 w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition duration-200 text-xs z-30 font-codec"
                  style={{ left: `calc(${timeLabelWidth} + 4px)` }}
                  title={`Guardar Evento a las ${hour}`}
                >
                  +
                </button>
              </div>
            ))}
            {eventsWithLanes.map((event) => {
              const startMinutes = timeToMinutes(event.time);
              const endMinutes = timeToMinutes(event.endTime);
              const durationMinutes = Math.max(0, endMinutes - startMinutes);
              if (durationMinutes === 0) return null;
              const topPosition = (startMinutes / (24 * 60)) * totalHeight;
              const eventHeight = (durationMinutes / (24 * 60)) * totalHeight;

              const effectiveMaxLane = Math.min(event.maxLane, maxLanes) || 1;
              const laneFraction =
                effectiveMaxLane > 1 ? event.lane / effectiveMaxLane : 0;
              const widthFraction =
                effectiveMaxLane > 1 ? 1 / effectiveMaxLane : 1;
              const eventLeft = `calc(${timeLabelWidth} + ${buttonWidth} + ${laneFraction} * (100% - ${timeLabelWidth} - ${buttonWidth}))`;
              const eventWidth = `calc(${widthFraction} * (100% - ${timeLabelWidth} - ${buttonWidth}) - 10px)`;
              return (
                <div
                  key={event.id}
                  className="absolute rounded px-2 py-1 text-white text-xs overflow-hidden shadow-md border border-black border-opacity-10 z-20 cursor-pointer hover:opacity-90 transition duration-200 font-codec"
                  style={{
                    top: `${topPosition}px`,
                    height: `${Math.max(eventHeight, 24)}px`,
                    left: eventLeft,
                    width: eventWidth,
                    backgroundColor: event.color,
                  }}
                  onClick={() => handleEditEvent(event)}
                  title={`${event.title} (${DateTime.fromISO(event.date, {
                    zone: "America/Santiago",
                  }).toFormat("dd/MM/yyyy HH:mm")} - ${DateTime.fromISO(
                    event.fechaFin,
                    { zone: "America/Santiago" },
                  ).toFormat("dd/MM/yyyy HH:mm")})`}
                >
                  <span className="font-medium">{event.title}</span>
                  <br />
                  <span className="text-xs">
                    {event.time} - {event.endTime}
                  </span>
                  <br />
                  <span className="text-xs opacity-70">
                    (
                    {DateTime.fromISO(event.date, {
                      zone: "America/Santiago",
                    }).toFormat("dd/MM/yyyy")}{" "}
                    -{" "}
                    {DateTime.fromISO(event.fechaFin, {
                      zone: "America/Santiago",
                    }).toFormat("dd/MM/yyyy")}
                    )
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 font-codec"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default HourlyViewModal;
