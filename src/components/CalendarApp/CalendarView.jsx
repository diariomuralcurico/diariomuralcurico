import React from "react";
import {
  format,
  isSameDay,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";

function CalendarView({
  events,
  currentMonth,
  setCurrentMonth,
  setShowDialog,
  setNewEvent,
  setEditingEvent,
  setSelectedDay,
  selectedDay,
  setShowHourlyModal,
  setSelectedDateForHours,
  onDayClick,
}) {
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const lastDayOfMonth = endOfMonth(currentMonth);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
    setSelectedDay(null);
  };

  const openHourlyView = (date) => {
    setSelectedDateForHours(date);
    setShowHourlyModal(true);
  };

  const days = [];
  if (startDay === 0) {
    for (let i = 0; i < 6; i++) {
      days.push(
        <div key={`empty-${i + 10}`} className="h-40 bg-gray-100"></div>,
      );
    }
  }

  for (let i = 1; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-40 bg-gray-100"></div>);
  }

  const eventSpans = events.flatMap((event) => {
    if (
      event.recurrence !== "None" &&
      event.recurrenceDates &&
      event.recurrenceDates.length > 0
    ) {
      return event.recurrenceDates.map((recDate) => {
        const displayDate = new Date(recDate);
        return {
          ...event,
          displayDate,
          isStart: isSameDay(displayDate, new Date(event.date)),
          isEnd: isSameDay(displayDate, new Date(event.fechaFin)),
          spanDays: 1,
        };
      });
    } else {
      const eventStart = new Date(event.date);
      const eventEnd = new Date(event.fechaFin);
      const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });
      return eventDays.map((day) => ({
        ...event,
        displayDate: day,
        isStart: isSameDay(day, eventStart),
        isEnd: isSameDay(day, eventEnd),
        spanDays: differenceInDays(eventEnd, eventStart) + 1,
      }));
    }
  });

  const timeToMinutes = (time) => {
    if (!time || typeof time !== "string") return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const dateString = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const daysUntilEndOfWeek = 6 - dayOfWeek; // From current day to Saturday
    const dayEvents = eventSpans
      .filter((event) => {
        const eventDate = new Date(event.displayDate);
        return isSameDay(eventDate, date);
      })
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    const isSelected =
      selectedDay && selectedDay.toISOString().split("T")[0] === dateString;

    days.push(
      <div
        key={day}
        className={`h-40 border p-2 relative cursor-pointer hover:bg-indigo-50 transition duration-200 ${
          isSelected ? "bg-indigo-100" : ""
        }`}
        //onClick={() => onDayClick(date)}
        onDoubleClick={() => openHourlyView(date)}
      >
        <span className="font-medium text-lg">{day}</span>
        <div className="mt-1 h-[134px] overflow-hidden">
          {dayEvents.slice(0, 4).map((event) => {
            const eventStart = new Date(event.segmentStart || event.date);
            const eventEnd = new Date(event.segmentEnd || event.fechaFin);
            const totalSpanDays = event.spanDays;
            const currentDayIndex = differenceInDays(date, eventStart);
            const remainingDaysInMonth =
              differenceInDays(lastDayOfMonth, date) + 1;

            // Calculate display span, ensuring it doesn't exceed the week or month
            const displaySpanDays = Math.min(
              totalSpanDays - currentDayIndex,
              daysUntilEndOfWeek + 1,
              remainingDaysInMonth,
            );

            const cellWidth = 100; // Percentage width of a single cell
            const borderWidth = 1; // Border width in pixels
            const marginBetweenEvents = 2; // Margin between events in pixels

            // Calculate width to fit within the week
            const totalWidth = `calc(${
              displaySpanDays * cellWidth
            }% + ${(displaySpanDays - 1) * borderWidth}px - ${
              displaySpanDays > 1 ? marginBetweenEvents : 0
            }px)`;

            const isStartOfWeek = dayOfWeek === 0;
            const isEndOfWeek = dayOfWeek === 6;
            const isLastDayInDisplay =
              displaySpanDays === totalSpanDays - currentDayIndex ||
              displaySpanDays === remainingDaysInMonth;

            return (
              <button
                key={`${event.id}-${dateString}`}
                className="text-left text-xs text-white px-1 py-0 rounded truncate hover:opacity-80 transition duration-200 flex items-center"
                style={{
                  backgroundColor: event.color,
                  width: "100%",
                  minWidth: "100px",

                  height: "24px",
                  marginBottom: "2px",
                }}
                title={`${event.title} (${format(eventStart, "dd/MM/yyyy")} - ${format(
                  eventEnd,
                  "dd/MM/yyyy",
                )})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingEvent(event);
                  setNewEvent({
                    aprobado: event.aprobado,
                    createdBy: event.createdBy,
                    title: event.title || event.nombre || "",
                    date: event.date || "",
                    time: event.time || "",
                    endTime: event.endTime || "",
                    fechaFin: event.fechaFin || event.date || "",
                    description: event.description || event.descripcion || "",
                    direccion: event.direccion || event.address || "",
                    organiza: event.organiza || "",
                    categoria: event.categoria || "Artes y diseño",
                    precio:
                      event.precio === "Consultar" ? "-1" : event.precio || "",
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
                  setShowDialog(true);
                }}
              >
                {event.time ? `[${event.time}] ${event.title}` : event.title}
              </button>
            );
          })}
        </div>
      </div>,
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Anterior
        </button>
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleString("es-CL", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={nextMonth}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Siguiente →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="font-medium text-gray-600">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}

export default CalendarView;
