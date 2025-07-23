import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/Firebase'; // Asegúrate que la ruta a tu config de Firebase sea correcta
import { Helmet } from 'react-helmet-async';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Corregido para usar la colección 'menu'
        const itemDocRef = doc(db, 'menu', id);
        const itemDocSnap = await getDoc(itemDocRef);

        if (itemDocSnap.exists()) {
          setItem({ id: itemDocSnap.id, ...itemDocSnap.data() });
        } else {
          setError('No se encontró el elemento.');
        }
      } catch (err) {
        setError('Error al cargar el elemento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!item) {
    return null; // O algún componente de "No encontrado"
  }

  // ¡IMPORTANTE! Asegúrate de que estos campos coincidan con tu base de datos.
  const { nombre, descripcion, imageUrl } = item;

  return (
    <>
      <Helmet>
        <title>{nombre}</title>
        <meta name="description" content={descripcion} />
        <meta property="og:title" content={nombre} />
        <meta property="og:description" content={descripcion} />
        <meta property="og:image" content={imageUrl} />
        {/* Reemplaza con tu dominio real */}
        <meta property="og:url" content={`https://diariomuralcurico.cl/evento/${id}`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="event-detail-container">
        <h1>{nombre}</h1>
        <img src={imageUrl} alt={nombre} style={{ maxWidth: '100%' }} />
        <p>{descripcion}</p>
      </div>
    </>
  );
};

export default EventDetail;