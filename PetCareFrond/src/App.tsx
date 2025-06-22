import React, { useState } from 'react';
import { authService } from './services/api';
import { LoginRequest, RegisterRequest } from './types/auth';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await authService.login(loginForm);
      
      if (response.success) {
        authService.setToken(response.token);
        setMessage({ text: '¡Inicio de sesión exitoso!', type: 'success' });
        // Here you could redirect to dashboard or main app
      } else {
        setMessage({ text: response.message, type: 'error' });
      }
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al iniciar sesión', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await authService.register(registerForm);
      
      if (response.success) {
        authService.setToken(response.token);
        setMessage({ text: '¡Registro exitoso!', type: 'success' });
        // Here you could redirect to dashboard or main app
      } else {
        setMessage({ text: response.message, type: 'error' });
      }
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al registrar usuario', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (form: 'login' | 'register', field: string, value: string) => {
    if (form === 'login') {
      setLoginForm(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {isLogin ? '🐕 PetCare Login' : '🐕 PetCare Registro'}
        </h1>

        {message && (
          <div className={`${message.type === 'error' ? 'error-message' : 'success-message'}`}>
            {message.text}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={loginForm.email}
                onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                value={loginForm.password}
                onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                required
                placeholder="Tu contraseña"
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-input"
                value={registerForm.name}
                onChange={(e) => handleInputChange('register', 'name', e.target.value)}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={registerForm.email}
                onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                value={registerForm.password}
                onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}

        <div className="toggle-form">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
          >
            {isLogin 
              ? '¿No tienes cuenta? Regístrate aquí' 
              : '¿Ya tienes cuenta? Inicia sesión aquí'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default App; 