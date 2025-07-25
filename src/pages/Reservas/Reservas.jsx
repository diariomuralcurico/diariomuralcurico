import React, { useState, useEffect } from "react";
import CalendarApp from "../../components/CalendarApp/CalendarApp";
import { useAuth } from "../../components/AuthContext";
import { db } from "../../config/Firebase";
import { collection, getDocs, query, where, or } from "firebase/firestore";
import { DateTime } from "luxon";
import { BarLoader } from "react-spinners";
import "./Reservas.css";

const Reservas = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let q;
        if (user && user.uid) {
          q = query(
            collection(db, "menu"),
            or(where("createdBy", "==", user.uid), where("aprobado", "==", 1))
          );
        } else {
          q = query(collection(db, "menu"), where("aprobado", "==", 1));
        }
        const eventsSnapshot = await getDocs(q);
        const fetchedEvents = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const fechaInicio = data.fechaHoraActividad?.toDate();
          const fechaFin = data.fechaHoraFinActividad?.toDate();
          const endRecurrence = data.endRecurrenceDate?.toDate();

          return {
            createdBy: data.createdBy,
            aprobado: data.aprobado,
            docId: doc.id,
            id: data.id || doc.id,
            ...data,
            date: fechaInicio
              ? DateTime.fromJSDate(fechaInicio)
                  .setZone("America/Santiago")
                  .toISO({ suppressMilliseconds: true })
              : null,
            fechaFin: fechaFin
              ? DateTime.fromJSDate(fechaFin)
                  .setZone("America/Santiago")
                  .toISO({ suppressMilliseconds: true })
              : null,
            endRecurrenceDate: endRecurrence
              ? DateTime.fromJSDate(endRecurrence)
                  .setZone("America/Santiago")
                  .toISO({ suppressMilliseconds: true })
              : null,
            recurrenceDates: data.recurrenceDates
              ? data.recurrenceDates.map((timestamp) => {
                  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : timestamp;
                  return DateTime.fromJSDate(date)
                    .setZone("America/Santiago")
                    .toISO({ suppressMilliseconds: true });
                })
              : [],
            title: data.nombre,
            description: data.descripcion,
            direccion: data.direccion,
            time: data.time || "",
            endTime: data.endTime || "",
            afiche: Array.isArray(data.afiche)
              ? data.afiche
              : [data.afiche].filter(Boolean),
            selectedWeekdays: data.selectedWeekdays || [],
            selectedMonthDays: data.selectedMonthDays || [],
          };
        });
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const handleEventChange = (updatedEvents) => {
    setEvents(updatedEvents);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#4f46e5" height={5} width={200} />
      </div>
    );
  }

  return (
    <CalendarApp
      user={user}
      initialEvents={events}
      className="publidario"
      onEventChange={handleEventChange}
    />
  );
};

export default Reservas;