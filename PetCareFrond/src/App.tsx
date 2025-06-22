import React, { useState, useEffect } from 'react';
import { authService } from './services/api';
import { LoginRequest, RegisterRequest } from './types/auth';
import Layout from './components/Layout';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [validated, setValidated] = useState(false);

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

  // Form validation
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, formType: 'login' | 'register') => {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    setValidated(false);
    
    if (formType === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleLogin = async () => {
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

  const handleRegister = async () => {
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

  // Reset validation when switching forms
  useEffect(() => {
    setValidated(false);
  }, [isLogin]);

  return (
    <Layout>
      <div className="login-container">
        <div className="row justify-content-center w-100">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h2 className="text-center mb-0">
                  <i className="bi bi-person-fill"></i> {isLogin ? 'Iniciar Sesión' : 'Registro'}
                </h2>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {isLogin ? (
                  <form 
                    onSubmit={(e) => handleSubmit(e, 'login')} 
                    id="loginForm"
                    className={validated ? 'was-validated' : ''}
                    noValidate
                  >
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="loginEmail"
                        value={loginForm.email}
                        onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        required
                      />
                      <label htmlFor="loginEmail">Correo Electrónico</label>
                      <div className="invalid-feedback">Por favor ingrese un email válido</div>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control"
                        id="loginPassword"
                        value={loginForm.password}
                        onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                        placeholder="Contraseña"
                        required
                      />
                      <label htmlFor="loginPassword">Contraseña</label>
                      <div className="invalid-feedback">La contraseña debe tener al menos 6 caracteres</div>
                    </div>

                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Recordar mis datos
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2"
                      disabled={loading}
                    >
                      <i className="bi bi-box-arrow-in-right"></i> 
                      {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>

                    <div className="text-center mt-3">
                      <a href="#" className="text-decoration-none">¿Olvidaste tu contraseña?</a>
                    </div>
                  </form>
                ) : (
                  <form 
                    onSubmit={(e) => handleSubmit(e, 'register')} 
                    id="registerForm"
                    className={validated ? 'was-validated' : ''}
                    noValidate
                  >
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="registerName"
                        value={registerForm.name}
                        onChange={(e) => handleInputChange('register', 'name', e.target.value)}
                        placeholder="Tu nombre completo"
                        required
                      />
                      <label htmlFor="registerName">Nombre Completo</label>
                      <div className="invalid-feedback">Por favor ingrese su nombre</div>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="registerEmail"
                        value={registerForm.email}
                        onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        required
                      />
                      <label htmlFor="registerEmail">Correo Electrónico</label>
                      <div className="invalid-feedback">Por favor ingrese un email válido</div>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control"
                        id="registerPassword"
                        value={registerForm.password}
                        onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                        placeholder="Contraseña"
                        minLength={8}
                        required
                      />
                      <label htmlFor="registerPassword">Contraseña</label>
                      <div className="invalid-feedback">La contraseña debe tener al menos 8 caracteres</div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2"
                      disabled={loading}
                    >
                      <i className="bi bi-person-plus"></i> 
                      {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                  </form>
                )}

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-2">
                    {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                  </p>
                  <button 
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setMessage(null);
                      setValidated(false);
                    }}
                  >
                    <i className={`bi ${isLogin ? 'bi-person-plus' : 'bi-person-fill'}`}></i> 
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 d-none d-md-block">
            <div className="position-relative h-100">
              <img 
                src="https://imgs.search.brave.com/iMyHf6a6nt9hz_HwUzVHbgg17MwQqf282N9-Hn0bRLw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTMw/NjkwNzU4OC9lcy9m/b3RvL2hhcHB5LWdp/cmwtanVlZ2EtY29u/LXVuLXBlcnJvLWRl/LWZvbmRvLWdyaXMt/cGVycm8tbGFtZS1j/aGVlY2stZGUtbXVq/ZXItZmVsaXotc2Ul/QzMlQjFvcmEtZGUt/YnVlbi5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9Skh5S2dQ/LUloTm9Oa05CZDNE/UkluVkZhTWttYllh/RjlkQ2xicFB0MWgt/ST0"
                alt="Mascota feliz con su dueño"
                className="img-fluid rounded shadow-lg h-100 w-100 object-fit-cover"
              />
              <div className="position-absolute bottom-0 start-0 p-4 text-white bg-dark bg-opacity-50 w-100">
                <h3>Bienvenido a PetCare</h3>
                <p className="mb-0">El mejor cuidado para tu mascota</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App; 