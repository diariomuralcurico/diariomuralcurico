import React from 'react';
import { format, isSameDay, differenceInDays, eachDayOfInterval, endOfMonth } from 'date-fns';

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
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const openHourlyView = (date) => {
    setSelectedDateForHours(date);
    setShowHourlyModal(true);
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-40 bg-gray-100"></div>);
  }

  const eventSpans = events.flatMap((event) => {
    if (event.recurrence !== 'None' && event.recurrenceDates && event.recurrenceDates.length > 0) {
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

  // Función para convertir la hora en minutos para facilitar la ordenación
  const timeToMinutes = (time) => {
    if (!time || typeof time !== 'string') return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    const dayEvents = eventSpans.filter((event) => {
      const eventDate = new Date(event.displayDate);
      return isSameDay(eventDate, date);
    }).sort((a, b) => {
      // Ordenar por hora de inicio (time)
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
    const isSelected = selectedDay && selectedDay.toISOString().split('T')[0] === dateString;

    days.push(
      <div
        key={day}
        className={`h-40 border p-2 relative cursor-pointer hover:bg-indigo-50 transition duration-200 ${isSelected ? 'bg-indigo-100' : ''}`}
        onDoubleClick={() => openHourlyView(date)}
      >
        <span className="font-medium text-lg">{day}</span>
        <div className="mt-1 h-[134px]">
          {dayEvents.slice(0, 4).map((event) => {
            const eventStart = new Date(event.date);
            const eventEnd = new Date(event.fechaFin);
            const totalSpanDays = event.spanDays;
            const currentDayIndex = differenceInDays(date, eventStart);
            const remainingDaysInMonth = differenceInDays(lastDayOfMonth, date) + 1;
            const daysToEndOfEvent = totalSpanDays - currentDayIndex;
            const displaySpanDays = Math.min(daysToEndOfEvent, daysUntilEndOfWeek, remainingDaysInMonth);
            const cellWidth = 100;
            const borderWidth = 1;
            const marginBetweenEvents = 2;
            const totalWidth = `calc(${displaySpanDays * cellWidth}% + ${(displaySpanDays - 1) * borderWidth}px - ${displaySpanDays > 1 ? marginBetweenEvents : 0}px)`;
            const isEndOfWeek = dayOfWeek === 0;
            const isLastDayInDisplay = displaySpanDays === daysToEndOfEvent || displaySpanDays === remainingDaysInMonth;

            return (
              <button
                key={`${event.id}-${dateString}`}
                className="text-left text-xs text-white px-1 py-0 rounded truncate hover:opacity-80 transition duration-200 flex items-center"
                style={{
                  backgroundColor: event.color,
                  width: totalWidth,
                  minWidth: '100px',
                  marginLeft: event.isStart ? '0' : `${-borderWidth}px`,
                  marginRight: displaySpanDays > 1 ? `${marginBetweenEvents}px` : '0',
                  borderTopLeftRadius: event.isStart ? '4px' : '0',
                  borderBottomLeftRadius: event.isStart ? '4px' : '0',
                  borderTopRightRadius: event.isEnd || isEndOfWeek || isLastDayInDisplay ? '4px' : '0',
                  borderBottomRightRadius: event.isEnd || isEndOfWeek || isLastDayInDisplay ? '4px' : '0',
                  height: '24px',
                  marginBottom: '2px',
                }}
                title={`${event.title} (${format(eventStart, 'dd/MM/yyyy')} - ${format(eventEnd, 'dd/MM/yyyy')})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingEvent(event);
                  setNewEvent({
                    title: event.title || event.nombre || '',
                    date: event.date || '',
                    time: event.time || '',
                    endTime: event.endTime || '',
                    fechaFin: event.fechaFin || event.date || '',
                    description: event.description || event.descripcion || '',
                    direccion: event.direccion || event.address || '',
                    organiza: event.organiza || '',
                    categoria: event.categoria || 'Artes y diseño',
                    precio: event.precio === 'Consultar' ? '-1' : event.precio || '',
                    afiche: event.afiche || null,
                    persona: event.persona || '',
                    telefono: event.telefono || '',
                    correo: event.correo || '',
                    link: event.link || '',
                    edad: event.edad || 'Todas las edades',
                    color: event.color || '#f9a8d4',
                    recurrence: event.recurrence || 'None',
                    endRecurrenceDate: event.endRecurrenceDate
                      ? typeof event.endRecurrenceDate === 'string'
                        ? event.endRecurrenceDate
                        : event.endRecurrenceDate.toDate().toISOString()
                      : '',
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
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-indigo-600 hover:text-indigo-800">
          ← Anterior
        </button>
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleString('es-CL', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} className="text-indigo-600 hover:text-indigo-800">
          Siguiente →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
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