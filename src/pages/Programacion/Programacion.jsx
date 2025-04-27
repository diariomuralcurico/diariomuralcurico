import { useState, useEffect } from "react";
import { db } from "../../config/Firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";

const Programacion = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEventos = async () => {
      try {
        const now = new Date();
        const q = query(
          collection(db, "menu_test"),
          where("aprobado", "==", 1),
          where("fechaHoraFinActividad", ">=", now),
          orderBy("fechaHoraActividad", "asc")
        );
        const response = await getDocs(q);
        const docs = response.docs.map((doc) => {
          const data = doc.data();
          data.id = doc.id;
          return {
            ...data,
            fechaInicio: new Date(data.fechaHoraActividad.seconds * 1000),
            fechaFin: new Date(data.fechaHoraFinActividad.seconds * 1000),
          };
        });
        if (docs.length === 0) {
          console.log("No documents found in menu_test collection.");
          setEventos([]); // Set empty array to avoid errors
          return;
        }
        setEventos(docs);
      } catch (error) {
        console.error("Error fetching events from Firestore:", error);
        setEventos([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    getEventos();
  }, []);

  const groupEventsByDate = () => {
    const grouped = {};
    eventos.forEach((evento) => {
      const date = evento.fechaInicio;
      let key;
      if (isToday(date)) {
        key = "Hoy";
      } else if (isTomorrow(date)) {
        key = "Mañana";
      } else if (differenceInDays(date, new Date()) <= 7) {
        key = "Esta semana";
      } else {
        key = format(date, "MMMM yyyy");
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(evento);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Agenda de Eventos</h1>
      {Object.keys(groupedEvents).length === 0 ? (
        <p className="text-center text-gray-500">No hay eventos programados.</p>
      ) : (
        Object.keys(groupedEvents).map((group) => (
          <div key={group} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{group}</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {groupedEvents[group].map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col"
                >
                  {evento.afiche && (
                    <img
                      src={evento.afiche}
                      alt={evento.nombre}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-lg font-medium text-gray-800">{evento.nombre}</h3>
                  <p className="text-gray-600">
                    {format(evento.fechaInicio, "dd/MM/yyyy HH:mm")} -{" "}
                    {format(evento.fechaFin, "dd/MM/yyyy HH:mm")}
                  </p>
                  <p className="text-gray-600">{evento.direccion}</p>
                  <p className="text-gray-600">
                    {evento.precio.type === "Gratuito"
                      ? "Gratuito"
                      : evento.precio.type === "Aporte Voluntario"
                      ? "Aporte Voluntario"
                      : `Desde $${evento.precio.monto}`}
                  </p>
                  <p className="text-gray-500 mt-2">{evento.descripcion}</p>
                  {evento.link && (
                    <a
                      href={evento.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2"
                    >
                      Más información
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Programacion;