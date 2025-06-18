import { useState, useEffect } from "react";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/Firebase";

import { es } from "date-fns/locale";
import { format } from "date-fns";

import "./EliminarCarta.css";
import EliminarCard from "../../../components/Tarjeta/Eliminar/EliminarCard";

const EliminarCarta = () => {
  const [show, setShow] = useState(true);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const getCard = async () => {
      try {
        const collectionRef = collection(db, "menu");
        const response = await getDocs(collectionRef);

        const docs = response.docs.map((doc) => {
          const data = doc.data();
          data.id = doc.id;
          return data;
        });

        const approvedItems = docs.filter((item) => {
          const now = new Date();
          const fechaFin = item.fechaHoraFinActividad;

          if (fechaFin && fechaFin.seconds) {
            const fechaFinDate = new Date(fechaFin.seconds * 1000);
            const fechaFormateada = format(fechaFinDate, "dd MMMM yyyy", {
              local: es,
            });
            item.fechaFormateada = fechaFormateada;
            return item.aprobado === 1 && fechaFinDate >= now;
          }
          return false;
        });

        console.log("Items aprobados:", approvedItems);
        setMenu(approvedItems);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    getCard();
  }, []);

  return (
    <div>
      <EliminarCard menu={menu} setMenu={setMenu} />
    </div>
  );
};

export default EliminarCarta;
