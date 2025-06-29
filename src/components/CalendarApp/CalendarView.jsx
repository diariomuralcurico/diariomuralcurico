import React, { useRef, useState } from "react";
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
  const calendarRef = useRef(null);
  const touchStartX = useRef(null);
  const [slideDirection, setSlideDirection] = useState(null); // Track animation direction

  const prevMonth = (isSwipe = false) => {
    if (isSwipe) {
      setSlideDirection("slide-right"); // Slide out to the right for previous month swipe
      setTimeout(() => {
        setCurrentMonth(
          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
        );
        setSlideDirection(null); // Reset animation
        setSelectedDay(null);
      }, 250); // Match the transition duration
    } else {
      // No animation for button click
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
      );
      setSelectedDay(null);
    }
  };

  const nextMonth = (isSwipe = false) => {
    if (isSwipe) {
      setSlideDirection("slide-left"); // Slide out to the left for next month swipe
      setTimeout(() => {
        setCurrentMonth(
          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
        );
        setSlideDirection(null); // Reset animation
        setSelectedDay(null);
      }, 250); // Match the transition duration
    } else {
      // No animation for button click
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
      );
      setSelectedDay(null);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    if (deltaX > minSwipeDistance) {
      prevMonth(true); // Swipe right: previous month with animation
    } else if (deltaX < -minSwipeDistance) {
      nextMonth(true); // Swipe left: next month with animation
    }

    touchStartX.current = null;
  };

  const openHourlyView = (date) => {
    setSelectedDateForHours(date);
    setShowHourlyModal(true);
  };

  const days = [];
  if (startDay === 0) {
    for (let i = 0; i < 6; i++) {
      days.push(
        <div
          key={`empty-${i + 10}`}
          className="h-24 max-sm:h-24 sm:h-40 !h-24 sm:!h-40 bg-gray-100"
        ></div>,
      );
    }
  }
  for (let i = 1; i < startDay; i++) {
    days.push(
      <div
        key={`empty-${i}`}
        className="h-24 max-sm:h-24 sm:h-40 !h-24 sm:!h-40 bg-gray-100"
      ></div>,
    );
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
    const daysUntilEndOfWeek = 6 - dayOfWeek;
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
        className={`h-24 max-sm:h-24 sm:h-40 !h-24 sm:!h-40 border p-2 relative cursor-pointer hover:bg-indigo-50 transition duration-200 calendar-day ${
          isSelected ? "bg-indigo-100" : ""
        }`}
        onDoubleClick={() => openHourlyView(date)}
        data-day={day}
      >
        <span className="font-medium text-lg">{day}</span>
        <div className="mt-1 h-[86px] max-sm:h-[86px] sm:h-[134px] !h-[86px] sm:!h-[134px] overflow-hidden">
          {dayEvents.slice(0, 4).map((event) => {
            const eventStart = new Date(event.segmentStart || event.date);
            const eventEnd = new Date(event.segmentEnd || event.fechaFin);
            const totalSpanDays = event.spanDays;
            const currentDayIndex = differenceInDays(date, eventStart);
            const remainingDaysInMonth =
              differenceInDays(lastDayOfMonth, date) + 1;
            const displaySpanDays = Math.min(
              totalSpanDays - currentDayIndex,
              daysUntilEndOfWeek + 1,
              remainingDaysInMonth,
            );
            const cellWidth = 100;
            const borderWidth = 1;
            const marginBetweenEvents = 2;
            const totalWidth = `calc(${displaySpanDays * cellWidth}% + ${
              (displaySpanDays - 1) * borderWidth
            }px - ${displaySpanDays > 1 ? marginBetweenEvents : 0}px)`;
            const isStartOfWeek = dayOfWeek === 0;
            const isEndOfWeek = dayOfWeek === 6;
            const isLastDayInDisplay =
              displaySpanDays === totalSpanDays - currentDayIndex ||
              displaySpanDays === remainingDaysInMonth;

            return (
              <button
                key={`${event.id}-${dateString}`}
                className="text-left text-xs text-white px-1 py-0 rounded truncate hover:opacity-80 transition duration-200 flex items-center max-sm:rounded-full max-sm:h-[10px] max-sm:p-0 sm:h-[24px] sm:text-xs sm:px-1 sm:py-0 sm:rounded sm:truncate sm:text-white sm:flex sm:items-center"
                style={{
                  backgroundColor: event.color,
                  width: "100%",
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
                <span className="max-sm:hidden">
                  {event.time ? `[${event.time}] ${event.title}` : event.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>,
    );
  }

  // Capitalize the first letter of the month
  const monthName = currentMonth.toLocaleString("es-CL", { month: "long" });
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-lg mb-8 overflow-hidden transform transition-all duration-250 ease-in-out ${
        slideDirection === "slide-left"
          ? "-translate-x-[20%] opacity-70"
          : slideDirection === "slide-right"
            ? "translate-x-[20%] opacity-70"
            : ""
      }`}
      ref={calendarRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => prevMonth(false)}
          className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base"
        >
          ← Anterior
        </button>
        <div className="text-center flex-1 mx-2 sm:mx-4">
          <h2 className="text-xl font-semibold leading-tight">
            {capitalizedMonth}
            <br />
            <span className="text-sm">de</span>
            <br />
            {currentMonth.toLocaleString("es-CL", { year: "numeric" })}
          </h2>
        </div>
        <button
          onClick={() => nextMonth(false)}
          className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base"
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
