import React, { useState } from "react";
import CalendarApp from "../../components/CalendarApp/CalendarApp";
import { useAuth } from "../../components/AuthContext";
import "./Reservas.css";

const Reservas = () => {
  const { user } = useAuth();

  const handleEventChange = (events) => {
    console.log("Eventos actualizados:", events);
  };

  return (
    <CalendarApp
      user={user}
      initialEvents={[]}
      className="publidario"
      onEventChange={handleEventChange}
    />
  );
};

export default Reservas;
