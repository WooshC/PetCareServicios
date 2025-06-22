import React, { useState } from 'react';
import { solicitudService } from '../services/api';

interface SolicitudFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

const SolicitudForm: React.FC<SolicitudFormProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    tipoServicio: '',
    descripcion: '',
    fechaHoraInicio: '',
    duracionHoras: 1,
    ubicacion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await solicitudService.createSolicitud(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h2 className="mb-0">
          <i className="bi bi-file-earmark-plus"></i> Crear Nueva Solicitud
        </h2>
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Tipo de Servicio */}
          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="tipoServicio"
              value={formData.tipoServicio}
              onChange={(e) => handleInputChange('tipoServicio', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Selecciona un tipo de servicio</option>
              <option value="Paseo">Paseo</option>
              <option value="Guardería">Guardería</option>
              <option value="Visita a domicilio">Visita a domicilio</option>
              <option value="Alimentación">Alimentación</option>
              <option value="Limpieza">Limpieza</option>
            </select>
            <label htmlFor="tipoServicio">Tipo de Servicio</label>
          </div>

          {/* Descripción */}
          <div className="form-floating mb-3">
            <textarea
              className="form-control"
              id="descripcion"
              placeholder="Descripción del servicio"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              required
              disabled={loading}
              rows={3}
              style={{ height: '100px' }}
            ></textarea>
            <label htmlFor="descripcion">Descripción del Servicio</label>
          </div>

          {/* Fecha y Hora de Inicio */}
          <div className="form-floating mb-3">
            <input
              type="datetime-local"
              className="form-control"
              id="fechaHoraInicio"
              value={formData.fechaHoraInicio}
              onChange={(e) => handleInputChange('fechaHoraInicio', e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="fechaHoraInicio">Fecha y Hora de Inicio</label>
          </div>

          {/* Duración en Horas */}
          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              id="duracionHoras"
              placeholder="Duración en Horas"
              value={formData.duracionHoras}
              onChange={(e) => handleInputChange('duracionHoras', parseInt(e.target.value))}
              required
              disabled={loading}
              min="1"
              max="24"
            />
            <label htmlFor="duracionHoras">Duración en Horas</label>
          </div>

          {/* Ubicación */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="ubicacion"
              placeholder="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => handleInputChange('ubicacion', e.target.value)}
              required
              disabled={loading}
              maxLength={200}
            />
            <label htmlFor="ubicacion">Ubicación</label>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle"></i> {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* Botones */}
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creando Solicitud...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i> Crear Solicitud
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onBack}
              disabled={loading}
            >
              <i className="bi bi-arrow-left"></i> Volver
            </button>
          </div>
        </form>

        {/* Información */}
        <div className="mt-3">
          <div className="alert alert-info">
            <i className="bi bi-info-circle"></i>
            <strong>Información:</strong> Tu solicitud será visible para todos los cuidadores disponibles. 
            Ellos podrán aceptarla y ponerse en contacto contigo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudForm; 