import React, { useState } from 'react';
import { authService } from '../services/api';

interface ChangePasswordFormProps {
  onBack: () => void;
  onSuccess: (message: string) => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
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

    // Validaciones básicas
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.changePasswordDirect({
        email: formData.email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.success) {
        onSuccess(response.message);
        setFormData({ email: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h2 className="mb-0">
          <i className="bi bi-key"></i> Cambiar Contraseña
        </h2>
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="email">Email</label>
          </div>

          {/* Nueva Contraseña */}
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="newPassword"
              placeholder="Nueva Contraseña"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="newPassword">Nueva Contraseña</label>
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
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
                  Cambiando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i> Cambiar Contraseña
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
            <strong>Nota:</strong> Este formulario es para testing. Solo necesitas el email del usuario para cambiar la contraseña.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm; 