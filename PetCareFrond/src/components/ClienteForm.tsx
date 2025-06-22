import React, { useState } from 'react';
import { clienteService } from '../services/api';

interface ClienteFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    documentoIdentidad: '',
    telefonoEmergencia: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await clienteService.createCliente(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear perfil de cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h2 className="mb-0">
          <i className="bi bi-person"></i> Completar Perfil de Cliente
        </h2>
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Documento de Identidad */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="documentoIdentidad"
              placeholder="Documento de Identidad"
              value={formData.documentoIdentidad}
              onChange={(e) => handleInputChange('documentoIdentidad', e.target.value)}
              required
              disabled={loading}
              maxLength={20}
            />
            <label htmlFor="documentoIdentidad">Documento de Identidad</label>
          </div>

          {/* Teléfono de Emergencia */}
          <div className="form-floating mb-3">
            <input
              type="tel"
              className="form-control"
              id="telefonoEmergencia"
              placeholder="Teléfono de Emergencia"
              value={formData.telefonoEmergencia}
              onChange={(e) => handleInputChange('telefonoEmergencia', e.target.value)}
              required
              disabled={loading}
              maxLength={15}
            />
            <label htmlFor="telefonoEmergencia">Teléfono de Emergencia</label>
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
                  Creando Perfil...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i> Completar Perfil
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
            <strong>Información:</strong> Completa tu perfil para poder crear solicitudes de servicios.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteForm; 