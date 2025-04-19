import { useState, useEffect } from "react";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, storage } from "../../config/Firebase";
import { Timestamp } from "firebase/firestore";

import './Reservas.css';

import { Button, Modal, Form } from "react-bootstrap";

const Reservas = () => {
  const [reserva, setReserva] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const valoresIniciales = {
    fecha: "",
    hora: "",
    fechaFin: "",
    horaFin: "",
    nombre: "",
    categoria: "Artes y diseño",
    organiza: "",
    precio: "",
    image: "",
    direccion: "",
    descripcion: "",
    aprovado: 0,
    persona: "",
    telefono: "",
    correo: "",
    esPeriodica: false,
    frecuencia: "diaria",
    cantidadActividades: "1",
    fechaRepeticionFin: "",
  };

  const [user, setUser] = useState(valoresIniciales);

  useEffect(() => {
    if (reserva.length === 0) {
      const getReserva = async () => {
        try {
          const collectionRef = collection(db, "menu");
          const response = await getDocs(collectionRef);

          const docs = response.docs.map((doc) => {
            const data = doc.data();
            data.id = doc.id;
            return data;
          });
          setReserva(docs);
        } catch (error) {
          console.log(error);
        }
      };
      getReserva();
    }
  }, [reserva]);

  const catchInputs = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setUser((prevUser) => ({
      ...prevUser,
      [name]: newValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size <= 1 * 1024 * 1024) {
        setImageFile(file);
        setErrorMessage("");
      } else {
        setErrorMessage("La imagen debe tener un tamaño máximo de 1 MB.");
        setImageFile(null);
      }
    }
  };

  const getTimestamp = () => {
    const { fecha, hora } = user;
    if (fecha && hora) {
      const dateTime = new Date(`${fecha}T${hora}`);
      return Timestamp.fromDate(dateTime);
    }
    return null;
  };

  const getEndTimestamp = () => {
    const { fechaFin, horaFin } = user;
    if (fechaFin && horaFin) {
      const dateTimeEnd = new Date(`${fechaFin}T${horaFin}`);
      return Timestamp.fromDate(dateTimeEnd);
    }
    return null;
  };

  const reservarMesa = async (e) => {
    e.preventDefault();
    const confirmSubmit = window.confirm(
      "¿Estás seguro de que deseas enviar el formulario?"
    );
    if (!confirmSubmit) return;

    if (!imageFile || errorMessage) return;

    let imageUrl = "";
    if (imageFile) {
      const uniqueImageName = `images/${Date.now()}-${imageFile.name}`;
      const imageRef = ref(storage, uniqueImageName);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    try {
      const collectionRef2 = collection(db, "menu");

      if (user.esPeriodica) {
        const {
          fecha,
          hora,
          fechaFin,
          horaFin,
          frecuencia,
          cantidadActividades,
        } = user;

        const fechaInicio = new Date(`${fecha}T${hora}`);
        const fechaTermino = new Date(`${fechaFin}T${horaFin}`);

        const incrementos = {
          diaria: 1,
          semanal: 7,
        };

        let repeticiones = parseInt(cantidadActividades, 10) || 0;

        console.log(repeticiones);
        if (isNaN(repeticiones) || repeticiones < 2 || repeticiones > 5) {
          console.log("Se activará la alerta.");
          alert("La cantidad de actividades debe estar entre 2 y 5.");
          return;
        }

        const reservas = [];
        let fechaActual = new Date(fechaInicio);
        let fechaFinalizacion = new Date(fechaTermino);

        for (let i = 0; i < repeticiones; i++) {
          reservas.push({
            ...user,
            fechaHoraActividad: Timestamp.fromDate(fechaActual),
            fechaHoraFinActividad: Timestamp.fromDate(fechaFinalizacion),
            image: imageUrl,
          });

          fechaActual.setDate(fechaActual.getDate() + incrementos[frecuencia]);
          fechaFinalizacion.setDate(
            fechaFinalizacion.getDate() + incrementos[frecuencia]
          );
        }

        const batch = reservas.map((reserva) =>
          addDoc(collectionRef2, reserva)
        );
        await Promise.all(batch);
      } else {
        await addDoc(collectionRef2, {
          ...user,
          fechaHoraActividad: getTimestamp(),
          fechaHoraFinActividad: getEndTimestamp(),
          image: imageUrl,
        });
      }
    } catch (error) {
      console.log(error);
    }

    setUser({ ...valoresIniciales });
    setImageFile(null);
    setShowModal(true);
  };
  const handleCloseModal = async () => {
    setShowModal(false);
    await new Promise((resolve) => setTimeout(resolve, 300));
    window.location.reload(true);
  };
  return (
    <div className="d-flex  justify-content-center align-items-center">
      <Form className="m-4 p-4" onSubmit={reservarMesa}>
        <fieldset>
          <Form.Group className="mb-3 m-2">
            <Form.Label>¿Es una actividad periódica?</Form.Label>
            <Form.Check
              type="checkbox"
              label="Sí"
              onChange={(e) => {
                if (e.target.checked) {
                  setUser((prevUser) => ({ ...prevUser, esPeriodica: true }));
                  setTimeout(() => {
                    setUser((prevUser) => ({
                      ...prevUser,
                      esPeriodica: false,
                    }));
                  }, 15000);
                } else {
                  setUser((prevUser) => ({ ...prevUser, esPeriodica: false }));
                }
              }}
              checked={user.esPeriodica}
              name="esPeriodica"
            />

            {user.esPeriodica && (
              <div
                className=" alertaPeriodica  alert alert-warning start-50 translate-middle-x "
                role="alert">
                <strong>
                  👷‍♂️🏗️ ¿CÓMO INGRESAR ACTIVIDADES QUE SE REPITEN EN EL TIEMPO?
                  (Difícil 😅)
                </strong>
                <br />
                Por ahora, la mejor forma de hacerlo es ingresarlas manualmente,
                completando el formulario por cada fecha en que se realice tu
                actividad. Sabemos que no es lo más cómodo, pero estamos
                trabajando para automatizar este proceso muy pronto...
                <br />
                <strong>¡Sólo es cosa de tiempo! ⏳</strong>
              </div>
              // <>
              //     <Form.Label>Frecuencia de la actividad</Form.Label>
              //     <Form.Select
              //         onChange={catchInputs}
              //         value={user.frecuencia || "diaria"}
              //         required
              //         name="frecuencia"
              //     >
              //         <option value="diaria">Diaria</option>
              //         <option value="semanal">Semanal</option>
              //     </Form.Select>
              //     <Form.Label>Cantidad de actividades (entre 2 y 5)</Form.Label>
              //     <Form.Control
              //         type="number"
              //         name="cantidadActividades"
              //         onChange={catchInputs}
              //         min="2"
              //         max="5"
              //         value={user.cantidadActividades}
              //         required
              //     />
              // </>
            )}
            <Form.Label>Nombre actividad</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.nombre}
              required
              name="nombre"
              placeholder="Nombre"
              maxLength={50}
            />
            <small className="text-muted">
              {50 - (user.nombre?.length || 0)} caracteres restantes
            </small>
            <br />
            <Form.Label htmlFor="disabledSelect">Categoría</Form.Label>
            <Form.Select
              onChange={catchInputs}
              value={user.categoria}
              required
              name="categoria"
              id="disabledSelect">
              <option>Artes y diseño</option>
              <option>Eventos, Festivales y Fiestas</option>
              <option>Deportes</option>
              <option>Gastronomía</option>
              <option>
                Encuentros, Conferencias, Seminarios, Ferias, Exposiciones
              </option>
              <option>Cursos, Talleres y Concursos</option>
              <option>Musica y Danza</option>
              <option>Teatro y Cine</option>
              <option>Turismo</option>
              <option>Otro</option>
            </Form.Select>

            <Form.Label>Institución que organiza</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.organiza}
              required
              name="organiza"
              placeholder="Institucion que organiza"
            />

            <Form.Label>Valor (indicar -1 para "Consultar")</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.precio}
              required
              name="precio"
              type="number"
              placeholder="Precio"
            />

            <Form.Label>Fecha inicio de la actividad</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.fecha}
              required
              type="date"
              name="fecha"
              placeholder="Date"
            />

            <Form.Label>Hora de inicio de la actividad</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.hora}
              required
              type="time"
              name="hora"
              placeholder="time"
            />

            <Form.Label>
              Fecha de finalización de la Actividad o término de concurso
            </Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.fechaFin}
              required
              type="date"
              name="fechaFin"
              placeholder="Date"
            />

            <Form.Label>Hora de finalización de la actividad</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.horaFin}
              required
              type="time"
              name="horaFin"
              placeholder="time"
            />

            <Form.Label>Afiche o imagen</Form.Label>
            <Form.Control type="file" onChange={handleImageChange} required />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            <Form.Label>
              Dirección de la actividad (Si es online indicar ONLINE)
            </Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.direccion}
              required
              name="direccion"
              placeholder="Dirección"
              maxLength={70}
            />
            <small className="text-muted">
              {70 - (user.direccion?.length || 0)} caracteres restantes
            </small>
            <br />
            <Form.Label>Descripción de actividad o bases (concurso)</Form.Label>
            <Form.Control
              as="textarea"
              rows={5} // Define el número de filas visibles
              style={{ resize: "vertical", overflowY: "scroll" }} // Permite redimensionar verticalmente y agrega scroll
              onChange={catchInputs}
              value={user.descripcion}
              required
              name="descripcion"
              placeholder="Descripcion"
            />

            <Form.Label>Responsable directo </Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.persona}
              required
              name="persona"
              placeholder="Nombre de quien publica"
            />

            <Form.Label>Teléfono responsable directo</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.telefono}
              required
              name="telefono"
              placeholder="9 12345678"
            />

            <Form.Label>Correo responsable directo</Form.Label>
            <Form.Control
              onChange={catchInputs}
              type="email"
              value={user.correo}
              required
              name="correo"
              placeholder="Correo@gmail.cl"
            />

            <Form.Label>Link redes sociales</Form.Label>
            <Form.Control
              onChange={catchInputs}
              value={user.link}
              required
              name="link"
              placeholder="https://instagram.com/actividad"
            />

            <Form.Label htmlFor="disabledSelect">
              Edad mínima recomendada
            </Form.Label>
            <Form.Select
              onChange={catchInputs}
              value={user.edad}
              required
              name="edad"
              id="disabledSelect">
              <option>Todas las edades</option>
              <option>5+ años</option>
              <option>10+ años</option>
              <option>15+ años</option>
              <option>18+ años</option>
              <option>24+ años</option>
              <option>35+ años</option>
              <option>60+ años</option>
            </Form.Select>
          </Form.Group>
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>¡Publicación enviada!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Ya has envíado la información, la publicación será revisada y
                aprobada en un rango entre 12 y 24 horas.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseModal}>
                Aceptar
              </Button>
            </Modal.Footer>
          </Modal>
          <Button type="submit" className="m-2">
            Publicar
          </Button>
          <br />
          <h3 className="d-flex justify-content-center align-items-center">
            Tu publicación será revisada y aprobada en un rango entre 12 y 24
            horas
          </h3>
        </fieldset>
      </Form>
    </div>
  );
};
export default Reservas;
