import React, { useEffect, useCallback, useState } from "react";
import { db } from "../../config/Firebase";
import { collection, getDocs, query, where, or } from "firebase/firestore";
import { useAuth } from "../../components/AuthContext";
import { Modal, Button, Container, Col } from "react-bootstrap";
import { DateTime } from "luxon";
import { BarLoader } from "react-spinners";
import "./Programacion.css";

const globalImageCache = {};

const EventCarousel = ({
  images: rawImages,
  imageCache = {},
  eventId,
  onImageCacheUpdate,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [loadedImages, setLoadedImages] = React.useState(new Set());
  const [isNavigating, setIsNavigating] = React.useState(false);

  const images = React.useMemo(() => {
    const validImages = (rawImages || []).filter(
      (img) => img && typeof img === "string",
    );
    return [...new Set(validImages)];
  }, [rawImages]);

  const cacheKey = `event_${eventId}`;

  const handleImageLoad = useCallback(
    (index) => {
      setLoadedImages((prev) => {
        if (prev.has(index)) return prev;
        const newSet = new Set(prev);
        newSet.add(index);
        if (newSet.size === images.length) {
          setLoading(false);
        }
        return newSet;
      });
      setIsNavigating(false);
      const img = new Image();
      img.src = images[index];
      img.srcset = `${images[index]} 1x, ${images[index].replace(/(\.\w+)$/, "@2x$1")} 2x`;
      onImageCacheUpdate?.(cacheKey, images[index], {
        src: images[index],
        complete: true,
        timestamp: Date.now(),
      });
    },
    [images, cacheKey, onImageCacheUpdate],
  );

  useEffect(() => {
    if (images.length === 0) {
      setLoading(false);
      return;
    }
    const eventCache = imageCache[cacheKey] || {};
    const cachedIndices = images.reduce((acc, img, idx) => {
      if (eventCache[img]?.complete) {
        acc.add(idx);
      }
      return acc;
    }, new Set());
    setLoadedImages(cachedIndices);
    if (cachedIndices.size === images.length) {
      setLoading(false);
    }
    images.forEach((img, index) => {
      if (!cachedIndices.has(index)) {
        const image = new Image();
        image.src = img;
        image.srcset = `${img} 1x, ${img.replace(/(\.\w+)$/, "@2x$1")} 2x`;
        image.onload = () => handleImageLoad(index);
        image.onerror = () => {
          console.error(`Failed to load image: ${img}`);
          handleImageLoad(index);
        };
      }
    });
  }, [images, imageCache, cacheKey, handleImageLoad]);

  useEffect(() => {
    console.log(`Carousel updated to index ${currentIndex}`);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    if (isNavigating || loading) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    if (!loadedImages.has(nextIndex)) {
      setIsNavigating(true);
    }
  }, [currentIndex, images, loadedImages, isNavigating, loading]);

  const prevSlide = useCallback(() => {
    if (isNavigating || loading) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    if (!loadedImages.has(prevIndex)) {
      setIsNavigating(true);
    }
  }, [currentIndex, images, loadedImages, isNavigating, loading]);

  const handleTouchStart = useCallback(
    (e) => {
      const touchStart = e.touches[0].clientX;
      const handleTouchEnd = (endEvent) => {
        const touchEnd = endEvent.changedTouches[0].clientX;
        const distance = touchStart - touchEnd;
        if (distance > 50) nextSlide();
        if (distance < -50) prevSlide();
      };
      e.target.addEventListener("touchend", handleTouchEnd, { once: true });
    },
    [nextSlide, prevSlide],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    },
    [nextSlide, prevSlide],
  );

  if (images.length === 0) {
    return (
      <div className="single-image-container mb-6 relative">
        <img
          src="/imagenes/default.jpg"
          alt="Imagen por defecto"
          className="w-full h-full max-w-[960px] max-h-[600px] mx-auto rounded-lg object-contain"
          srcSet="/imagenes/default.jpg 1x, /imagenes/default@2x.jpg 2x"
        />
      </div>
    );
  }

  if (images.length === 1) {
    const cachedImage = imageCache[cacheKey]?.[images[0]] || {};
    return (
      <div className="single-image-container mb-6 relative">
        {loading && (
          <div className="loader-container absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="loader"></div>
          </div>
        )}
        <img
          src={cachedImage.src || images[0]}
          srcSet={`${cachedImage.src || images[0]} 1x, ${(cachedImage.src || images[0]).replace(/(\.\w+)$/, "@2x$1")} 2x`}
          alt="Imagen del evento"
          className="w-full h-full max-w-[960px] max-h-[600px] mx-auto rounded-lg object-contain"
          onLoad={() => handleImageLoad(0)}
          onError={() => handleImageLoad(0)}
          style={{ opacity: loadedImages.has(0) ? 1 : 0 }}
        />
      </div>
    );
  }

  return (
    <div
      className="carousel-container relative mb-6"
      role="region"
      aria-label="Carrusel de imágenes del evento"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
    >
      {(loading || isNavigating) && (
        <div className="loader-container absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="loader"></div>
        </div>
      )}
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div
            key={`${index}-${image}`}
            className={`carousel-item ${index === currentIndex ? "active" : ""}`}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
            }}
            aria-hidden={index !== currentIndex}
          >
            <img
              src={image}
              srcSet={`${image} 1x, ${image.replace(/(\.\w+)$/, "@2x$1")} 2x`}
              alt={`Imagen ${index + 1} del evento`}
              className="carousel-image"
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageLoad(index)}
              style={{ opacity: loadedImages.has(index) ? 1 : 0 }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-indigo-600 p-3 rounded-full shadow-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Imagen anterior"
        disabled={loading || isNavigating || images.length <= 1}
      >
        ←
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-indigo-600 p-3 rounded-full shadow-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Siguiente imagen"
        disabled={loading || isNavigating || images.length <= 1}
      >
        →
      </button>
      <div className="flex justify-center mt-2 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-indigo-600" : "bg-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            onClick={() => loadedImages.has(index) && setCurrentIndex(index)}
            aria-label={`Ir a la imagen ${index + 1}`}
            disabled={loading || isNavigating}
          />
        ))}
      </div>
      <p className="text-center text-gray-600 mt-2 font-codec">
        Imagen {currentIndex + 1} de {images.length}
      </p>
    </div>
  );
};

const Programacion = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let q;
      if (user && user.uid) {
        q = query(
          collection(db, "menu"),
          or(where("createdBy", "==", user.uid), where("aprobado", "==", 1)),
        );
      } else {
        q = query(collection(db, "menu"), where("aprobado", "==", 1));
      }
      const response = await getDocs(q);
      const todayStart = DateTime.now()
        .setZone("America/Santiago")
        .startOf("day");

      const docs = [];
      response.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.fechaHoraActividad || !data.fechaHoraFinActividad) {
          console.warn(`Evento con ID ${doc.id} tiene fechas inválidas`, data);
          return;
        }

        const startDate = DateTime.fromJSDate(
          data.fechaHoraActividad.toDate(),
        ).setZone("America/Santiago");
        const endDate = DateTime.fromJSDate(
          data.fechaHoraFinActividad.toDate(),
        ).setZone("America/Santiago");
        const afiche = data.afiche || [];
        const images = [
          ...new Set(
            Array.isArray(afiche)
              ? afiche.filter((img) => img && typeof img === "string")
              : afiche && typeof afiche === "string"
                ? [afiche]
                : ["/images/default.jpg"],
          ),
        ];

        const baseEvent = {
          id: doc.id,
          title: data.nombre,
          description: data.descripcion,
          address: data.direccion,
          link: data.link,
          image: images,
          precio: data.precio,
          categoria: data.categoria,
          organiza: data.organiza,
          persona: data.persona,
          telefono: data.telefono,
          correo: data.correo,
          edad: data.edad,
          color: data.color,
          recurrence: data.recurrence,
          endRecurrenceDate: data.endRecurrenceDate
            ? DateTime.fromJSDate(data.endRecurrenceDate.toDate())
                .setZone("America/Santiago")
                .toJSDate()
            : null,
          aprobado: data.aprobado,
          createdBy: data.createdBy,
        };

        if (!data.recurrence || data.recurrence === "None") {
          if (startDate >= todayStart) {
            docs.push({
              ...baseEvent,
              start: startDate.toJSDate(),
              end: endDate.toJSDate(),
            });
          }
          return;
        }

        if (
          data.recurrence &&
          data.recurrence !== "None" &&
          data.endRecurrenceDate
        ) {
          const endRecurrence = DateTime.fromJSDate(
            data.endRecurrenceDate.toDate(),
          ).setZone("America/Santiago");
          if (endRecurrence < todayStart) {
            return;
          }

          let currentDate = startDate;
          const eventDuration = endDate.diff(startDate).as("milliseconds");

          while (currentDate <= endRecurrence) {
            if (currentDate >= todayStart) {
              const instanceStart = currentDate;
              const instanceEnd = currentDate.plus({
                milliseconds: eventDuration,
              });
              docs.push({
                ...baseEvent,
                id: `${doc.id}_${currentDate.toISODate()}`,
                start: instanceStart.toJSDate(),
                end: instanceEnd.toJSDate(),
              });
            }

            switch (data.recurrence.toLowerCase()) {
              case "daily":
                currentDate = currentDate.plus({ days: 1 });
                break;
              case "weekly":
                currentDate = currentDate.plus({ weeks: 1 });
                break;
              case "monthly":
                currentDate = currentDate.plus({ months: 1 });
                break;
              default:
                console.warn(
                  `Recurrence type ${data.recurrence} not supported for event ${doc.id}`,
                );
                return;
            }
          }
        }
      });

      setEventos(docs);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateImageCache = useCallback((cacheKey, imageSrc, imageData) => {
    globalImageCache[cacheKey] = globalImageCache[cacheKey] || {};
    globalImageCache[cacheKey][imageSrc] = imageData;
  }, []);

  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    Object.keys(globalImageCache).forEach((key) => {
      const eventCache = globalImageCache[key];
      const filteredCache = Object.fromEntries(
        Object.entries(eventCache).filter(
          ([_, data]) => now - data.timestamp < CACHE_DURATION,
        ),
      );
      if (Object.keys(filteredCache).length > 0) {
        globalImageCache[key] = filteredCache;
      } else {
        delete globalImageCache[key];
      }
    });
  }, []);

  useEffect(() => {
    clearExpiredCache();
    const interval = setInterval(clearExpiredCache, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  const groupEventsByDay = useCallback(() => {
    const grouped = {};
    eventos.forEach((event) => {
      const dateStr = DateTime.fromJSDate(event.start, {
        zone: "America/Santiago",
        locale: "es-CL",
      }).toFormat("yyyy-MM-dd");
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(event);
    });
    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        DateTime.fromISO(dateA).toMillis() - DateTime.fromISO(dateB).toMillis(),
    );
  }, [eventos]);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
  }, []);

  const formatPrice = (precio) => {
    if (precio === undefined || precio === null) return null;
    if (Number(precio) === 0) return "Gratis";
    if (Number(precio) === -1) return "Consultar";
    return `${Number(precio).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    })}`;
  };

  const formatRecurrence = (recurrence) => {
    if (!recurrence || recurrence === "None") return null;
    return (
      recurrence.charAt(0).toUpperCase() + recurrence.slice(1).toLowerCase()
    )
      .replace("Daily", "Diaria")
      .replace("Weekly", "Semanal")
      .replace("Monthly", "Mensual");
  };

  const groupedEvents = groupEventsByDay();

  return (
    <Container className="py-6 max-w-4xl mx-auto">
      <h2 className="agenda-title text-3xl font-semibold mb-10 font-codec text-gray-800 text-center">
        Agenda de Actividades
      </h2>
      {loading && (
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          className="spinnerTarjeta d-flex flex-column justify-content-center align-items-center mb-10"
        >
          <BarLoader height={5} width={500} color="#9209db" />
          <p className="text-center fw-bold fs-5 mt-2">
            Cargando Actividades...
          </p>
        </Col>
      )}
      {groupedEvents.length === 0 && !loading ? (
        <p className="text-center text-gray-600 font-codec text-lg">
          No hay eventos disponibles.
        </p>
      ) : (
        groupedEvents.map(([date, events]) => (
          <div key={date} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 font-codec mb-4 border-b-2 border-indigo-100 pb-2">
              {DateTime.fromISO(date, {
                zone: "America/Santiago",
                locale: "es-CL",
              }).toLocaleString(
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
                { locale: "es-CL" },
              )}
            </h2>
            <ul className="event-list">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="event-item flex justify-between items-center p-4 mb-2 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <span className="event-title font-medium text-gray-800 font-codec truncate flex-1">
                    {event.title}
                  </span>
                  <span className="event-time text-gray-600 font-codec text-sm">
                    {DateTime.fromJSDate(event.start, {
                      zone: "America/Santiago",
                      locale: "es-CL",
                    }).toFormat("HH:mm")}{" "}
                    -{" "}
                    {DateTime.fromJSDate(event.end, {
                      zone: "America/Santiago",
                      locale: "es-CL",
                    }).toFormat("HH:mm")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      <div className="mb-12"></div>
      {selectedEvent && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          size="lg"
          className="event-modal"
        >
          <Modal.Header closeButton className="border-b-0 bg-indigo-50">
            <Modal.Title className="text-2xl font-bold text-gray-800 font-codec">
              {selectedEvent.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6 bg-white event-modal-body">
            <EventCarousel
              images={selectedEvent.image}
              eventId={selectedEvent.id}
              imageCache={globalImageCache}
              onImageCacheUpdate={updateImageCache}
            />
            <div className="event-details-container">
              <div className="event-detail-card">
                {selectedEvent.description && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-info-circle"></i> Descripción
                    </span>
                    <p className="event-detail-value">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
                <div className="event-detail-item">
                  <span className="event-detail-label">
                    <i className="fas fa-calendar-day"></i> Fecha
                  </span>
                  <p className="event-detail-value">
                    {(() => {
                      const startDate = DateTime.fromJSDate(
                        selectedEvent.start,
                        { zone: "America/Santiago", locale: "es-CL" },
                      );
                      const endDate = DateTime.fromJSDate(selectedEvent.end, {
                        zone: "America/Santiago",
                        locale: "es-CL",
                      });
                      const isMultiDay = !startDate.hasSame(endDate, "day");
                      return isMultiDay
                        ? `${startDate.toFormat("d 'de' MMMM")} - ${endDate.toFormat("d 'de' MMMM")}`
                        : startDate.toLocaleString(
                            {
                              day: "numeric",
                              month: "long",
                            },
                            { locale: "es-CL" },
                          );
                    })()}
                  </p>
                </div>
                <div className="event-detail-item">
                  <span className="event-detail-label">
                    <i className="fas fa-clock"></i> Horario
                  </span>
                  <p className="event-detail-value">
                    {(() => {
                      const startDate = DateTime.fromJSDate(
                        selectedEvent.start,
                        { zone: "America/Santiago", locale: "es-CL" },
                      );
                      const endDate = DateTime.fromJSDate(selectedEvent.end, {
                        zone: "America/Santiago",
                        locale: "es-CL",
                      });
                      const isMultiDay = !startDate.hasSame(endDate, "day");
                      if (isMultiDay) {
                        return `${startDate.toFormat("d 'de' MMMM HH:mm")} - ${endDate.toFormat("d 'de' MMMM HH:mm")}`;
                      }
                      return `${startDate.toFormat("HH:mm")} - ${endDate.toFormat("HH:mm")}`;
                    })()}
                  </p>
                </div>
                {selectedEvent.address && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-map-marker-alt"></i> Ubicación
                    </span>
                    <p className="event-detail-value">
                      {selectedEvent.address}
                    </p>
                  </div>
                )}
                {selectedEvent.precio !== undefined &&
                  selectedEvent.precio !== null && (
                    <div className="event-detail-item">
                      <span className="event-detail-label">
                        <i className="fas fa-ticket-alt"></i> Valor
                      </span>
                      <p className="event-detail-value">
                        {formatPrice(selectedEvent.precio)}
                      </p>
                    </div>
                  )}
                {selectedEvent.categoria && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-tags"></i> Categoría
                    </span>
                    <p className="event-detail-value">
                      {selectedEvent.categoria}
                    </p>
                  </div>
                )}
              </div>
              <div className="event-detail-card">
                {selectedEvent.organiza && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-users"></i> Organizador
                    </span>
                    <p className="event-detail-value">
                      {selectedEvent.organiza}
                    </p>
                  </div>
                )}
                {selectedEvent.persona && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-user"></i> Responsable
                    </span>
                    <p className="event-detail-value">
                      {selectedEvent.persona}
                    </p>
                  </div>
                )}
                {selectedEvent.telefono && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-phone"></i> Teléfono
                    </span>
                    <p className="event-detail-value">
                      {selectedEvent.telefono}
                    </p>
                  </div>
                )}
                {selectedEvent.correo && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-envelope"></i> Correo
                    </span>
                    <p className="event-detail-value">{selectedEvent.correo}</p>
                  </div>
                )}
                {selectedEvent.edad && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-child"></i> Edad mínima
                    </span>
                    <p className="event-detail-value">{selectedEvent.edad}</p>
                  </div>
                )}
                <div className="event-detail-item">
                  <span className="event-detail-label">
                    <i className="fas fa-check-circle"></i> Estado
                  </span>
                  <p className="event-detail-value">
                    {selectedEvent.aprobado === 1
                      ? "Aprobado"
                      : "Pendiente de aprobación"}
                  </p>
                </div>
              </div>
              <div className="event-detail-card">
                {formatRecurrence(selectedEvent.recurrence) && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-redo"></i> Recurrencia
                    </span>
                    <p className="event-detail-value recurrence-value">
                      <span
                        className={`recurrence-badge ${
                          selectedEvent.recurrence &&
                          selectedEvent.recurrence !== "None"
                            ? "recurrent"
                            : "non-recurrent"
                        }`}
                        title={
                          selectedEvent.recurrence &&
                          selectedEvent.recurrence !== "None"
                            ? "Este evento se repite regularmente"
                            : "Este evento ocurre una sola vez"
                        }
                      >
                        {formatRecurrence(selectedEvent.recurrence)}
                      </span>
                    </p>
                  </div>
                )}
                {selectedEvent.recurrence &&
                  selectedEvent.recurrence !== "None" &&
                  selectedEvent.endRecurrenceDate && (
                    <div className="event-detail-item">
                      <span className="event-detail-label">
                        <i className="fas fa-calendar-times"></i> Hasta
                      </span>
                      <p className="event-detail-value">
                        {DateTime.fromJSDate(selectedEvent.endRecurrenceDate, {
                          zone: "America/Santiago",
                          locale: "es-CL",
                        }).toLocaleString(
                          { day: "numeric", month: "long", year: "numeric" },
                          { locale: "es-CL" },
                        )}
                      </p>
                    </div>
                  )}
                {selectedEvent.link && (
                  <div className="event-detail-item">
                    <span className="event-detail-label">
                      <i className="fas fa-link"></i> Enlace
                    </span>
                    <p className="event-detail-value">
                      <a
                        href={selectedEvent.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Visitar sitio web
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t-0 bg-indigo-50">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              className="font-codec bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition-colors duration-200"
            >
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Programacion;
