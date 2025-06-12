import React from "react";
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

  const dateString = date ? date.toISOString().split("T")[0] : "";

  // Filter events to include multi-day events that span the selected date
  const dayEvents = events
    .filter((event) => {
      if (!event.date || !event.fechaFin) return false;
      const eventStartDate = new Date(event.date);
      const eventEndDate = new Date(event.fechaFin);
      const currentDate = new Date(date).setHours(0, 0, 0, 0);
      const eventStart = eventStartDate.setHours(0, 0, 0, 0);
      const eventEnd = eventEndDate.setHours(23, 59, 59, 999);
      if (event.recurrence === "None") {
        return currentDate >= eventStart && currentDate <= eventEnd;
      }
      return event.recurrenceDates.some((recDate) => {
        const recurrenceDate = new Date(recDate).setHours(0, 0, 0, 0);
        return recurrenceDate === currentDate;
      });
    })
    .map((event) => {
      const eventStartDate = new Date(event.date);
      const eventEndDate = new Date(event.fechaFin);
      const selectedDate = new Date(date);
      let displayTime = event.time || "00:00";
      let displayEndTime = event.endTime || "23:59";
      if (event.recurrence === "None") {
        const isFirstDay =
          eventStartDate.toISOString().split("T")[0] === dateString;
        const isLastDay =
          eventEndDate.toISOString().split("T")[0] === dateString;
        if (!isFirstDay) {
          displayTime = "00:00";
        }
        if (!isLastDay) {
          displayEndTime = "23:59";
        }
      } else {
        const matchingRecurrence = event.recurrenceDates.find((recDate) => {
          const recDateObj = new Date(recDate);
          return recDateObj.toISOString().split("T")[0] === dateString;
        });
        if (matchingRecurrence) {
          const recDateObj = new Date(matchingRecurrence);
          displayTime = recDateObj.toTimeString().slice(0, 5);
          const endDateObj = new Date(recDateObj);
          const [hours, minutes] = event.endTime
            ? event.endTime.split(":").map(Number)
            : [23, 59];
          endDateObj.setHours(hours, minutes);
          displayEndTime = endDateObj.toTimeString().slice(0, 5);
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
    setNewEvent({
      title: "",
      date: date.toISOString(),
      time: hour,
      endTime: defaultEndHour > "24:00" ? "23:59" : defaultEndHour,
      fechaFin: date.toISOString(),
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
              ? date.toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
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
                  title={`Agregar Evento a las ${hour}`}
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
                >
                  <span className="font-medium">{event.title}</span>
                  <br />
                  <span className="text-xs">
                    {event.time} - {event.endTime}
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
