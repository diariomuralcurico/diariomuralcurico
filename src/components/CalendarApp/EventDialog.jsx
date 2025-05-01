import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useEscapeKey from "./useEscapeKey";

function EventDialog({
  show,
  onClose,
  onAdd,
  newEvent,
  setNewEvent,
  selectedDate,
  showTimeField,
  isEditing,
}) {
  useEscapeKey(show, onClose);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!show) {
      setErrors({});
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => {
      const updatedEvent = { ...prev, [name]: value };
      if (name === "date") {
        updatedEvent.fechaFin = value;
      }
      return updatedEvent;
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setNewEvent((prev) => ({
      ...prev,
      afiche: [...(prev.afiche || []), ...newFiles],
    }));
  };

  const handleDeleteAfiche = (indexToDelete) => {
    setNewEvent((prev) => ({
      ...prev,
      afiche: prev.afiche.filter((_, index) => index !== indexToDelete),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (
      !newEvent.title ||
      typeof newEvent.title !== "string" ||
      newEvent.title.trim() === ""
    ) {
      newErrors.title = "El nombre de la actividad es obligatorio.";
    }

    if (!newEvent.date || isNaN(new Date(newEvent.date).getTime())) {
      newErrors.date = "La fecha de inicio es obligatoria y debe ser válida.";
    } else if (newEvent.date < today) {
      newErrors.date = "La fecha de inicio no puede ser anterior a hoy.";
    }

    if (showTimeField) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!newEvent.time || !timeRegex.test(newEvent.time)) {
        newErrors.time =
          "La hora de inicio es obligatoria y debe ser válida (HH:mm).";
      }
      if (!newEvent.endTime || !timeRegex.test(newEvent.endTime)) {
        newErrors.endTime =
          "La hora de fin es obligatoria y debe ser válida (HH:mm).";
      } else if (
        newEvent.time &&
        newEvent.endTime &&
        newEvent.date.split("T")[0] == newEvent.fechaFin.split("T")[0] &&
        newEvent.endTime <= newEvent.time
      ) {
        newErrors.endTime =
          "La hora de fin debe ser posterior a la hora de inicio.";
      }
    }

    if (
      !newEvent.description ||
      typeof newEvent.description !== "string" ||
      newEvent.description.trim() === ""
    ) {
      newErrors.description = "La descripción es obligatoria.";
    }

    if (
      !newEvent.direccion ||
      typeof newEvent.direccion !== "string" ||
      newEvent.direccion.trim() === ""
    ) {
      newErrors.direccion = "La dirección es obligatoria.";
    }

    if (
      !newEvent.organiza ||
      typeof newEvent.organiza !== "string" ||
      newEvent.organiza.trim() === ""
    ) {
      newErrors.organiza = "La institución organizadora es obligatoria.";
    }

    const validCategories = [
      "Artes y diseño",
      "Música y teatro",
      "Cultura y tradiciones",
      "Gastronomía",
      "Deportes y aire libre",
      "Ferias y exposiciones",
      "Fiestas y celebraciones",
      "Otros",
    ];
    if (!newEvent.categoria || !validCategories.includes(newEvent.categoria)) {
      newErrors.categoria = "Seleccione una categoría válida.";
    }

    if (
      newEvent.precio === undefined ||
      newEvent.precio === null ||
      isNaN(newEvent.precio)
    ) {
      newErrors.precio = "El precio es obligatorio.";
    } else if (newEvent.precio !== -1 && newEvent.precio < 0) {
      newErrors.precio =
        "El precio debe ser -1 (Consultar) o un número no negativo.";
    }

    if (!isEditing && (!newEvent.afiche || newEvent.afiche.length === 0)) {
      newErrors.afiche = "Al menos un afiche es obligatorio.";
    } else if (!isEditing && newEvent.afiche) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      newEvent.afiche.forEach((file, index) => {
        if (!validImageTypes.includes(file.type)) {
          newErrors.afiche = `El afiche ${
            index + 1
          } debe ser una imagen (JPEG, PNG o GIF).`;
        }
      });
    } else if (
      isEditing &&
      (!newEvent.afiche || newEvent.afiche.length === 0)
    ) {
      newErrors.afiche = "Al menos un afiche es obligatorio en modo edición.";
    }

    if (
      !newEvent.persona ||
      typeof newEvent.persona !== "string" ||
      newEvent.persona.trim() === ""
    ) {
      newErrors.persona = "El nombre del responsable es obligatorio.";
    }

    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!newEvent.telefono || !phoneRegex.test(newEvent.telefono)) {
      newErrors.telefono = "El teléfono es obligatorio y debe ser válido.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEvent.correo || !emailRegex.test(newEvent.correo)) {
      newErrors.correo = "El correo es obligatorio y debe ser válido.";
    }

    const urlRegex = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/;
    if (!newEvent.link || !urlRegex.test(newEvent.link)) {
      newErrors.link = "El enlace es obligatorio y debe ser una URL válida.";
    }

    const validAges = ["Todas las edades", "3+", "6+", "12+", "18+"];
    if (!newEvent.edad || !validAges.includes(newEvent.edad)) {
      newErrors.edad = "Seleccione una edad mínima válida.";
    }

    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!newEvent.color || !colorRegex.test(newEvent.color)) {
      newErrors.color =
        "El color debe ser un valor hexadecimal válido (ej. #RRGGBB).";
    }

    const validRecurrences = ["None", "Daily", "Weekly", "Monthly"];
    if (
      !newEvent.recurrence ||
      !validRecurrences.includes(newEvent.recurrence)
    ) {
      newErrors.recurrence = "Seleccione una recurrencia válida.";
    }

    if (newEvent.recurrence !== "None") {
      console.log("newEvent.date: " + newEvent.date);
      console.log("newEvent.fechaFin: " + newEvent.fechaFin);
      console.log(
        " newEvent.date !== newEvent.fechaFin: " + newEvent.date !==
          newEvent.fechaFin,
      );
      if (newEvent.date.split("T")[0] !== newEvent.fechaFin.split("T")[0]) {
        newErrors.endRecurrenceDate =
          "No puedes crear un evento recurrente que dure mas de un día";
      }
      if (
        !newEvent.endRecurrenceDate ||
        isNaN(new Date(newEvent.endRecurrenceDate).getTime())
      ) {
        newErrors.endRecurrenceDate =
          "La fecha de fin de recurrencia es obligatoria y debe ser válida.";
      } else if (newEvent.endRecurrenceDate < newEvent.date) {
        newErrors.endRecurrenceDate =
          "La fecha de fin de recurrencia no puede ser anterior a la fecha de inicio.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(setErrors);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const aprobado = newEvent.aprobado === 1;
  const today = new Date().toISOString().split("T")[0];

  const recurrenceOptions = [
    { key: "Ninguna", value: "None" },
    { key: "Diario", value: "Daily" },
    { key: "Semanal", value: "Weekly" },
    { key: "Mensual", value: "Monthly" },
  ];

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Nombre de la actividad *
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="title"
              value={newEvent.title || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Color *
            </label>
            <input
              readOnly={aprobado}
              type="color"
              name="color"
              value={newEvent.color || "#f9a8d4"}
              onChange={handleInputChange}
              className="mt-1 block w-full h-12 border border-gray-300 rounded-md p-1"
            />
            {errors.color && (
              <p className="text-red-500 text-xs mt-1">{errors.color}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 font-codec">
                Fecha de inicio *
              </label>
              <input
                readOnly={aprobado}
                type="date"
                name="date"
                value={formatDateForInput(newEvent.date)}
                onChange={handleInputChange}
                min={today}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 font-codec">
                Fecha de fin *
              </label>
              <input
                readOnly={aprobado}
                type="date"
                name="fechaFin"
                value={formatDateForInput(newEvent.fechaFin)}
                onChange={handleInputChange}
                min={formatDateForInput(newEvent.date) || today}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
              />
              {errors.fechaFin && (
                <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>
              )}
            </div>
          </div>
          {showTimeField && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 font-codec">
                  Hora de inicio *
                </label>
                <input
                  readOnly={aprobado}
                  type="time"
                  name="time"
                  value={newEvent.time || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
                />
                {errors.time && (
                  <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 font-codec">
                  Hora de fin *
                </label>
                <input
                  readOnly={aprobado}
                  type="time"
                  name="endTime"
                  value={newEvent.endTime || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Descripción *
            </label>
            <textarea
              readOnly={aprobado}
              name="description"
              value={newEvent.description || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
              rows="4"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Dirección *
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="direccion"
              value={newEvent.direccion || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.direccion && (
              <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Afiche(s) *
            </label>
            <input
              readOnly={aprobado}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.afiche && (
              <p className="text-red-500 text-xs mt-1">{errors.afiche}</p>
            )}
            {newEvent.afiche && Array.isArray(newEvent.afiche) && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">
                  Afiche(s) seleccionados:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {newEvent.afiche.map((file, index) => (
                    <div
                      key={index}
                      className="relative flex flex-col items-center"
                    >
                      {typeof file === "string" ? (
                        <img
                          src={file}
                          alt={`Afiche ${index + 1}`}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Afiche ${index + 1}`}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      )}
                      <p className="text-sm text-gray-600 mt-1 truncate w-32 text-center">
                        {typeof file === "string" ? file : file.name}
                      </p>
                      {!aprobado && (
                        <button
                          onClick={() => handleDeleteAfiche(index)}
                          className="absolute top-0 right-0 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-600"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Organiza *
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="organiza"
              value={newEvent.organiza || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.organiza && (
              <p className="text-red-500 text-xs mt-1">{errors.organiza}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Categoría *
            </label>
            <select
              readOnly={aprobado}
              name="categoria"
              value={newEvent.categoria || "Artes y diseño"}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            >
              {[
                "Artes y diseño",
                "Música y teatro",
                "Cultura y tradiciones",
                "Gastronomía",
                "Deportes y aire libre",
                "Ferias y exposiciones",
                "Fiestas y celebraciones",
                "Otros",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Precio *
            </label>
            <input
              readOnly={aprobado}
              type="number"
              name="precio"
              value={newEvent.precio || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
              placeholder="Ingrese -1 para 'Consultar'"
            />
            {errors.precio && (
              <p className="text-red-500 text-xs mt-1">{errors.precio}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Responsable *
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="persona"
              value={newEvent.persona || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.persona && (
              <p className="text-red-500 text-xs mt-1">{errors.persona}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Teléfono *
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="telefono"
              value={newEvent.telefono || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.telefono && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Correo *
            </label>
            <input
              readOnly={aprobado}
              type="email"
              name="correo"
              value={newEvent.correo || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.correo && (
              <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Enlace *
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="link"
              value={newEvent.link || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.link && (
              <p className="text-red-500 text-xs mt-1">{errors.link}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Edad mínima *
            </label>
            <select
              readOnly={aprobado}
              name="edad"
              value={newEvent.edad || "Todas las edades"}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            >
              {["Todas las edades", "3+", "6+", "12+", "18+"].map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
            {errors.edad && (
              <p className="text-red-500 text-xs mt-1">{errors.edad}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Repetición
            </label>
            <select
              readOnly={aprobado}
              name="recurrence"
              value={newEvent.recurrence || "None"}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            >
              {recurrenceOptions.map((rec) => (
                <option key={rec.value} value={rec.value}>
                  {rec.key}
                </option>
              ))}
            </select>
            {errors.recurrence && (
              <p className="text-red-500 text-xs mt-1">{errors.recurrence}</p>
            )}
          </div>
          {newEvent.recurrence !== "None" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 font-codec">
                Fecha de fin de repetición
              </label>
              <input
                readOnly={aprobado}
                type="date"
                name="endRecurrenceDate"
                value={formatDateForInput(newEvent.endRecurrenceDate)}
                onChange={handleInputChange}
                min={formatDateForInput(newEvent.date) || today}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
              />
              {errors.endRecurrenceDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.endRecurrenceDate}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 font-codec"
          >
            Cancelar
          </button>
          <button
            disabled={aprobado}
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 font-codec disabled:bg-gray-400"
          >
            {isEditing ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

EventDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  newEvent: PropTypes.object.isRequired,
  setNewEvent: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  showTimeField: PropTypes.bool,
  isEditing: PropTypes.bool,
};

export default EventDialog;
