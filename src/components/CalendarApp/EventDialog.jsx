import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useEscapeKey from "./useEscapeKey";
import { DateTime } from "luxon";

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
  const [phoneValid, setPhoneValid] = useState(null); // Estado para validación en tiempo real del teléfono

  useEffect(() => {
    if (!show) {
      setErrors({});
      setPhoneValid(null);
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

    // Validación en tiempo real para el teléfono
    if (name === "telefono") {
      const chileanPhoneRegex = /^\+56[9]\d{8}$/;
      setPhoneValid(chileanPhoneRegex.test(value));
    }
  };

  const handlePhoneInput = (e) => {
    let value = e.target.value;
    // Eliminar caracteres no permitidos, excepto +56 y dígitos
    value = value.replace(/[^+\d]/g, "");
    // Asegurar que comience con +56
    if (!value.startsWith("+56")) {
      value = "+56" + value.replace(/^\+56/, "");
    }
    // Limitar a +56 seguido de 9 dígitos
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    setNewEvent((prev) => ({ ...prev, telefono: value }));
    // Validación en tiempo real
    const chileanPhoneRegex = /^\+56[9]\d{8}$/;
    setPhoneValid(chileanPhoneRegex.test(value));
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

    // Validación de título
    if (
      !newEvent.title ||
      typeof newEvent.title !== "string" ||
      newEvent.title.trim() === ""
    ) {
      newErrors.title = "El nombre de la actividad es obligatorio.";
    } else if (newEvent.title.length > 100) {
      newErrors.title = "El título no puede exceder los 100 caracteres.";
    }

    // Validación de fecha
    if (!newEvent.date || isNaN(new Date(newEvent.date).getTime())) {
      newErrors.date = "La fecha de inicio es obligatoria y debe ser válida.";
    } else if (newEvent.date < today) {
      newErrors.date = "La fecha de inicio no puede ser anterior a hoy.";
    }

    // Validación de hora si showTimeField está activo
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
        newEvent.date.split("T")[0] === newEvent.fechaFin.split("T")[0] &&
        newEvent.endTime <= newEvent.time
      ) {
        newErrors.endTime =
          "La hora de fin debe ser posterior a la hora de inicio.";
      }
    }

    // Validación de descripción
    if (
      !newEvent.description ||
      typeof newEvent.description !== "string" ||
      newEvent.description.trim() === ""
    ) {
      newErrors.description = "La descripción es obligatoria.";
    } else if (newEvent.description.length > 700) {
      newErrors.description =
        "La descripción no puede exceder los 700 caracteres.";
    }

    // Validación de dirección
    if (
      !newEvent.direccion ||
      typeof newEvent.direccion !== "string" ||
      newEvent.direccion.trim() === ""
    ) {
      newErrors.direccion = "La dirección es obligatoria.";
    } else if (newEvent.direccion.length > 200) {
      newErrors.direccion = "La dirección no puede exceder los 200 caracteres.";
    }

    // Validación de institución organizadora
    if (
      !newEvent.organiza ||
      typeof newEvent.organiza !== "string" ||
      newEvent.organiza.trim() === ""
    ) {
      newErrors.organiza = "La institución organizadora es obligatoria.";
    } else if (newEvent.organiza.length > 100) {
      newErrors.organiza =
        "La institución organizadora no puede exceder los 100 caracteres.";
    }

    // Validación de categoría
    const validCategories = [
      "Artes y diseño",
      "Música y teatro",
      "Cultura y tradiciones",
      "Gastronomía",
      "Deportes y aire libre",
      "Ferias y exposiciones",
      "Fiestas y celebraciones",
      "Ocio y pasatiempos",
      "Talleres, concursos",
      "Otros",
    ];
    if (!newEvent.categoria || !validCategories.includes(newEvent.categoria)) {
      newErrors.categoria = "Seleccione una categoría válida.";
    }

    // Validación de precio
    if (
      newEvent.precio === undefined ||
      newEvent.precio === null ||
      isNaN(newEvent.precio)
    ) {
      newErrors.precio = "El precio es obligatorio.";
    } else if (Number(newEvent.precio) !== -1 && Number(newEvent.precio) < 0) {
      newErrors.precio =
        "El precio debe ser -1 (Consultar) o un número no negativo.";
    }

    // Validación de afiche
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

    // Validación de responsable
    if (
      !newEvent.persona ||
      typeof newEvent.persona !== "string" ||
      newEvent.persona.trim() === ""
    ) {
      newErrors.persona = "El nombre del responsable es obligatorio.";
    } else if (newEvent.persona.length > 100) {
      newErrors.persona =
        "El nombre del responsable no puede exceder los 100 caracteres.";
    }

    // Validación de teléfono
    const chileanPhoneRegex = /^\+56[9]\d{8}$/;
    if (newEvent.telefono && !chileanPhoneRegex.test(newEvent.telefono)) {
      newErrors.telefono =
        "El teléfono es opcional pero debe ser un número chileno válido con formato +569XXXXXXXX.";
    }
    // Validación de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEvent.correo && !emailRegex.test(newEvent.correo)) {
      newErrors.correo = "El correo es opcional pero debe ser válido.";
    } else if (newEvent.correo.length > 100) {
      newErrors.correo = "El correo no puede exceder los 100 caracteres.";
    }

    // Validación de enlace
    const urlRegex = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/;
    if (!newEvent.link || !urlRegex.test(newEvent.link)) {
      newErrors.link = "El enlace es obligatorio y debe ser una URL válida.";
    } else if (newEvent.link.length > 200) {
      newErrors.link = "El enlace no puede exceder los 200 caracteres.";
    }

    // Validación de edad
    const validAges = ["Todas las edades", "+4", "+6", "+8", "+10", "+18"];
    if (!newEvent.edad || !validAges.includes(newEvent.edad)) {
      newErrors.edad = "Seleccione una edad mínima válida.";
    }

    // Validación de color
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!newEvent.color || !colorRegex.test(newEvent.color)) {
      newErrors.color =
        "El color debe ser un valor hexadecimal válido (ej. #RRGGBB).";
    }

    // Validación de recurrencia
    const validRecurrences = ["None", "Daily", "Weekly", "Monthly"];
    if (
      !newEvent.recurrence ||
      !validRecurrences.includes(newEvent.recurrence)
    ) {
      newErrors.recurrence = "Seleccione una recurrencia válida.";
    }

    // Validación de fecha de fin de recurrencia
    if (newEvent.recurrence !== "None") {
      if (newEvent.date.split("T")[0] !== newEvent.fechaFin.split("T")[0]) {
        newErrors.endRecurrenceDate =
          "No puedes crear un evento recurrente que dure más de un día.";
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
    return DateTime.fromISO(date, { zone: "America/Santiago" }).toISODate();
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
              Nombre de la actividad * (máx. 100 caracteres)
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="title"
              value={newEvent.title || ""}
              onChange={handleInputChange}
              maxLength={100}
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
              disabled={aprobado}
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
              Descripción * (máx. 700 caracteres)
            </label>
            <textarea
              readOnly={aprobado}
              name="description"
              value={newEvent.description || ""}
              onChange={handleInputChange}
              maxLength={700}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
              rows="4"
            />
            <p className="text-sm text-gray-500 mt-1">
              {newEvent.description ? newEvent.description.length : 0}/700
            </p>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Dirección * (máx. 200 caracteres)
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="direccion"
              value={newEvent.direccion || ""}
              onChange={handleInputChange}
              maxLength={200}
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
              disabled={aprobado}
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
                          ×
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
              Organiza * (máx. 100 caracteres)
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="organiza"
              value={newEvent.organiza || ""}
              onChange={handleInputChange}
              maxLength={100}
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
              disabled={aprobado}
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
                "Ocio y pasatiempos",
                "Talleres, concursos",
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
              value={newEvent.precio}
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
              Responsable * (máx. 100 caracteres)
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="persona"
              value={newEvent.persona || ""}
              onChange={handleInputChange}
              maxLength={100}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.persona && (
              <p className="text-red-500 text-xs mt-1">{errors.persona}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Teléfono * (+569XXXXXXXX)
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="telefono"
              value={newEvent.telefono || ""}
              onChange={handleInputChange}
              onInput={handlePhoneInput}
              maxLength={12}
              className={`mt-1 block w-full border ${
                phoneValid === true
                  ? "border-green-500"
                  : phoneValid === false
                    ? "border-red-500"
                    : "border-gray-300"
              } rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec`}
              placeholder="+56912345678"
            />
            {errors.telefono && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Correo * (máx. 100 caracteres)
            </label>
            <input
              readOnly={aprobado}
              type="email"
              name="correo"
              value={newEvent.correo || ""}
              onChange={handleInputChange}
              maxLength={100}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            />
            {errors.correo && (
              <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-codec">
              Enlace * (máx. 200 caracteres)
            </label>
            <input
              readOnly={aprobado}
              type="text"
              name="link"
              value={newEvent.link || ""}
              onChange={handleInputChange}
              maxLength={200}
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
              disabled={aprobado}
              readOnly={aprobado}
              name="edad"
              value={newEvent.edad || "Todas las edades"}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 font-codec"
            >
              {["Todas las edades", "+4", "+6", "+8", "+10", "+18"].map(
                (age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ),
              )}
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
              disabled={aprobado}
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
                disabled={aprobado}
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
            {isEditing ? "Actualizar" : "Guardar"}
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
