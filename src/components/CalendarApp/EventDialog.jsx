import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useEscapeKey from './useEscapeKey'; // Ajusta la ruta según la ubicación del hook

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
    console.log('newEvent en EventDialog:', newEvent);
  }, [show, newEvent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewEvent((prev) => ({ ...prev, afiche: file }));
  };

  const handleSubmit = () => {
    onAdd(setErrors);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        show ? '' : 'hidden'
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar Evento' : 'Agregar Evento'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la actividad *</label>
            <input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Fecha de inicio *</label>
              <input
                type="date"
                name="date"
                value={formatDateForInput(newEvent.date)}
                onChange={handleInputChange}
                min={today}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Fecha de fin *</label>
              <input
                type="date"
                name="fechaFin"
                value={formatDateForInput(newEvent.fechaFin)}
                onChange={handleInputChange}
                min={formatDateForInput(newEvent.date) || today}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin}</p>}
            </div>
          </div>
          {showTimeField && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Hora de inicio *</label>
                <input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Hora de fin *</label>
                <input
                  type="time"
                  name="endTime"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción *</label>
            <textarea
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows="3"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={newEvent.direccion}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Institución organizadora *</label>
            <input
              type="text"
              name="organiza"
              value={newEvent.organiza}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.organiza && <p className="text-red-500 text-xs mt-1">{errors.organiza}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría *</label>
            <select
              name="categoria"
              value={newEvent.categoria}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="Artes y diseño">Artes y diseño</option>
              <option value="Música y teatro">Música y teatro</option>
              <option value="Cultura y tradiciones">Cultura y tradiciones</option>
              <option value="Gastronomía">Gastronomía</option>
              <option value="Deportes y aire libre">Deportes y aire libre</option>
              <option value="Ferias y exposiciones">Ferias y exposiciones</option>
              <option value="Fiestas y celebraciones">Fiestas y celebraciones</option>
              <option value="Otros">Otros</option>
            </select>
            {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio *</label>
            <input
              type="number"
              name="precio"
              value={newEvent.precio}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Ingrese -1 para 'Consultar'"
            />
            {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Afiche *</label>
            <input
              type="file"
              name="afiche"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              accept="image/*"
            />
            {errors.afiche && <p className="text-red-500 text-xs mt-1">{errors.afiche}</p>}
            {isEditing && newEvent.afiche && typeof newEvent.afiche === 'string' && (
              <p className="text-sm text-gray-600 mt-1">
                Afiche actual: <a href={newEvent.afiche} target="_blank" rel="noopener noreferrer">Ver afiche</a>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Responsable *</label>
            <input
              type="text"
              name="persona"
              value={newEvent.persona}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.persona && <p className="text-red-500 text-xs mt-1">{errors.persona}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={newEvent.telefono}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo *</label>
            <input
              type="email"
              name="correo"
              value={newEvent.correo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link *</label>
            <input
              type="url"
              name="link"
              value={newEvent.link}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Edad mínima *</label>
            <select
              name="edad"
              value={newEvent.edad}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="Todas las edades">Todas las edades</option>
              <option value="3+">3+</option>
              <option value="6+">6+</option>
              <option value="12+">12+</option>
              <option value="18+">18+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color *</label>
            <input
              type="color"
              name="color"
              value={newEvent.color}
              onChange={handleInputChange}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md p-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recurrencia *</label>
            <select
              name="recurrence"
              value={newEvent.recurrence}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="None">Ninguna</option>
              <option value="Daily">Diaria</option>
              <option value="Weekly">Semanal</option>
              <option value="Monthly">Mensual</option>
            </select>
          </div>
          {newEvent.recurrence !== 'None' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de fin de recurrencia *
              </label>
              <input
                type="date"
                name="endRecurrenceDate"
                value={formatDateForInput(newEvent.endRecurrenceDate)}
                onChange={handleInputChange}
                min={formatDateForInput(newEvent.date) || today}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {errors.endRecurrenceDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endRecurrenceDate}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Valor actual: {newEvent.endRecurrenceDate || 'No establecido'}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {isEditing ? 'Actualizar' : 'Agregar'}
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