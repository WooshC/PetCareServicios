import React, { useState } from 'react';
import { CuidadorRequest } from '../types/cuidador';

interface CuidadorFormProps {
  onSubmit: (data: CuidadorRequest) => void;
  loading?: boolean;
  initialData?: CuidadorRequest;
  isEdit?: boolean;
}

const CuidadorForm: React.FC<CuidadorFormProps> = ({ 
  onSubmit, 
  loading = false, 
  initialData,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState<CuidadorRequest>({
    documentoIdentidad: initialData?.documentoIdentidad || '',
    telefonoEmergencia: initialData?.telefonoEmergencia || '',
    biografia: initialData?.biografia || '',
    experiencia: initialData?.experiencia || '',
    horarioAtencion: initialData?.horarioAtencion || '',
    tarifaPorHora: initialData?.tarifaPorHora || undefined
  });

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    setValidated(false);
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CuidadorRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={validated ? 'was-validated' : ''} noValidate>
      <div className="row">
        <div className="col-md-6">
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="documentoIdentidad"
              value={formData.documentoIdentidad}
              onChange={(e) => handleInputChange('documentoIdentidad', e.target.value)}
              placeholder="12345678"
              maxLength={20}
              required
            />
            <label htmlFor="documentoIdentidad">Documento de Identidad</label>
            <div className="invalid-feedback">Por favor ingrese su documento de identidad</div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating mb-3">
            <input
              type="tel"
              className="form-control"
              id="telefonoEmergencia"
              value={formData.telefonoEmergencia}
              onChange={(e) => handleInputChange('telefonoEmergencia', e.target.value)}
              placeholder="+57 300 123 4567"
              maxLength={15}
              required
            />
            <label htmlFor="telefonoEmergencia">Teléfono de Emergencia</label>
            <div className="invalid-feedback">Por favor ingrese un teléfono válido</div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="horarioAtencion"
              value={formData.horarioAtencion || ''}
              onChange={(e) => handleInputChange('horarioAtencion', e.target.value)}
              placeholder="Lunes a Viernes 8:00 AM - 6:00 PM"
              maxLength={100}
            />
            <label htmlFor="horarioAtencion">Horario de Atención</label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              id="tarifaPorHora"
              value={formData.tarifaPorHora || ''}
              onChange={(e) => handleInputChange('tarifaPorHora', parseFloat(e.target.value) || 0)}
              placeholder="25000"
              min="0"
              step="0.01"
            />
            <label htmlFor="tarifaPorHora">Tarifa por Hora (COP)</label>
          </div>
        </div>
      </div>

      <div className="form-floating mb-3">
        <textarea
          className="form-control"
          id="biografia"
          value={formData.biografia || ''}
          onChange={(e) => handleInputChange('biografia', e.target.value)}
          placeholder="Cuéntanos sobre ti y tu experiencia con mascotas..."
          style={{ height: '100px' }}
        />
        <label htmlFor="biografia">Biografía</label>
      </div>

      <div className="form-floating mb-3">
        <textarea
          className="form-control"
          id="experiencia"
          value={formData.experiencia || ''}
          onChange={(e) => handleInputChange('experiencia', e.target.value)}
          placeholder="Describe tu experiencia cuidando mascotas..."
          style={{ height: '100px' }}
        />
        <label htmlFor="experiencia">Experiencia</label>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-100 py-2"
        disabled={loading}
      >
        <i className={`bi ${isEdit ? 'bi-check-circle' : 'bi-person-plus'}`}></i> 
        {loading ? 'Guardando...' : (isEdit ? 'Actualizar Perfil' : 'Crear Perfil de Cuidador')}
      </button>
    </form>
  );
};

export default CuidadorForm; 