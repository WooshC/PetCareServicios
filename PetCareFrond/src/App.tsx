import React, { useState, useEffect } from 'react';
import { authService, cuidadorService } from './services/api';
import { LoginRequest, RegisterRequest } from './types/auth';
import { CuidadorRequest, RegisterRequestWithRole, LoginRequestWithRole } from './types/cuidador';
import Layout from './components/Layout';
import CuidadorForm from './components/CuidadorForm';

type ViewType = 'login' | 'register' | 'cuidador-form' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [validated, setValidated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Cliente' | 'Cuidador'>('Cliente');

  // Form states
  const [loginForm, setLoginForm] = useState<LoginRequestWithRole>({
    email: '',
    password: '',
    role: 'Cliente'
  });

  const [registerForm, setRegisterForm] = useState<RegisterRequestWithRole>({
    email: '',
    password: '',
    name: '',
    role: 'Cliente'
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
      const response = await authService.loginWithRole(loginForm);
      
      if (response.success) {
        authService.setToken(response.token);
        setMessage({ text: '¡Inicio de sesión exitoso!', type: 'success' });
        
        // Si es cuidador, verificar si tiene perfil
        if (loginForm.role === 'Cuidador') {
          try {
            await cuidadorService.getMiPerfil();
            setCurrentView('dashboard');
          } catch (error) {
            setCurrentView('cuidador-form');
          }
        } else {
          setCurrentView('dashboard');
        }
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
      const response = await authService.registerWithRole(registerForm);
      
      if (response.success) {
        authService.setToken(response.token);
        setMessage({ text: '¡Registro exitoso!', type: 'success' });
        
        // Si es cuidador, ir al formulario de perfil
        if (registerForm.role === 'Cuidador') {
          setCurrentView('cuidador-form');
        } else {
          setCurrentView('dashboard');
        }
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

  const handleCuidadorSubmit = async (data: CuidadorRequest) => {
    setLoading(true);
    setMessage(null);

    try {
      await cuidadorService.createCuidador(data);
      setMessage({ text: '¡Perfil de cuidador creado exitosamente!', type: 'success' });
      setCurrentView('dashboard');
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al crear perfil de cuidador', 
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

  const handleRoleChange = (role: 'Cliente' | 'Cuidador') => {
    setSelectedRole(role);
    setLoginForm(prev => ({ ...prev, role }));
    setRegisterForm(prev => ({ ...prev, role }));
  };

  // Reset validation when switching forms
  useEffect(() => {
    setValidated(false);
  }, [isLogin]);

  const renderLoginForm = () => (
    <form 
      onSubmit={(e) => handleSubmit(e, 'login')} 
      id="loginForm"
      className={validated ? 'was-validated' : ''}
      noValidate
    >
      <div className="mb-3">
        <label className="form-label">Tipo de Usuario</label>
        <div className="btn-group w-100" role="group">
          <input
            type="radio"
            className="btn-check"
            name="loginRole"
            id="loginCliente"
            checked={selectedRole === 'Cliente'}
            onChange={() => handleRoleChange('Cliente')}
          />
          <label className="btn btn-outline-primary" htmlFor="loginCliente">
            <i className="bi bi-person"></i> Cliente
          </label>

          <input
            type="radio"
            className="btn-check"
            name="loginRole"
            id="loginCuidador"
            checked={selectedRole === 'Cuidador'}
            onChange={() => handleRoleChange('Cuidador')}
          />
          <label className="btn btn-outline-primary" htmlFor="loginCuidador">
            <i className="bi bi-heart"></i> Cuidador
          </label>
        </div>
      </div>

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

      <button 
        type="submit" 
        className="btn btn-primary w-100 py-2"
        disabled={loading}
      >
        <i className="bi bi-box-arrow-in-right"></i> 
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form 
      onSubmit={(e) => handleSubmit(e, 'register')} 
      id="registerForm"
      className={validated ? 'was-validated' : ''}
      noValidate
    >
      <div className="mb-3">
        <label className="form-label">Tipo de Usuario</label>
        <div className="btn-group w-100" role="group">
          <input
            type="radio"
            className="btn-check"
            name="registerRole"
            id="registerCliente"
            checked={selectedRole === 'Cliente'}
            onChange={() => handleRoleChange('Cliente')}
          />
          <label className="btn btn-outline-primary" htmlFor="registerCliente">
            <i className="bi bi-person"></i> Cliente
          </label>

          <input
            type="radio"
            className="btn-check"
            name="registerRole"
            id="registerCuidador"
            checked={selectedRole === 'Cuidador'}
            onChange={() => handleRoleChange('Cuidador')}
          />
          <label className="btn btn-outline-primary" htmlFor="registerCuidador">
            <i className="bi bi-heart"></i> Cuidador
          </label>
        </div>
      </div>

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
  );

  const renderCuidadorForm = () => (
    <div>
      <div className="text-center mb-4">
        <h3><i className="bi bi-heart text-primary"></i> Completa tu Perfil de Cuidador</h3>
        <p className="text-muted">Cuéntanos más sobre ti para que los clientes puedan conocerte</p>
      </div>
      <CuidadorForm onSubmit={handleCuidadorSubmit} loading={loading} />
    </div>
  );

  const renderDashboard = () => (
    <div className="text-center">
      <h2><i className="bi bi-house-heart text-primary"></i> ¡Bienvenido a PetCare!</h2>
      <p className="lead">Has iniciado sesión como {selectedRole}</p>
      <div className="mt-4">
        <button 
          className="btn btn-outline-danger"
          onClick={() => {
            authService.removeToken();
            setCurrentView('login');
            setMessage(null);
          }}
        >
          <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return renderLoginForm();
      case 'register':
        return renderRegisterForm();
      case 'cuidador-form':
        return renderCuidadorForm();
      case 'dashboard':
        return renderDashboard();
      default:
        return renderLoginForm();
    }
  };

  return (
    <Layout>
      <div className="login-container">
        <div className="row justify-content-center w-100">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h2 className="text-center mb-0">
                  <i className="bi bi-person-fill"></i> 
                  {currentView === 'login' && 'Iniciar Sesión'}
                  {currentView === 'register' && 'Registro'}
                  {currentView === 'cuidador-form' && 'Perfil de Cuidador'}
                  {currentView === 'dashboard' && 'Dashboard'}
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

                {renderContent()}

                {currentView !== 'cuidador-form' && currentView !== 'dashboard' && (
                  <>
                    <hr className="my-4" />
                    <div className="text-center">
                      <p className="mb-2">
                        {currentView === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                      </p>
                      <button 
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => {
                          setCurrentView(currentView === 'login' ? 'register' : 'login');
                          setMessage(null);
                          setValidated(false);
                        }}
                      >
                        <i className={`bi ${currentView === 'login' ? 'bi-person-plus' : 'bi-person-fill'}`}></i> 
                        {currentView === 'login' ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 d-none d-md-block">
            <div className="position-relative h-100">
              <img 
                src="https://imgs.search.brave.com/iMyHf6a6nt9hz_HwUzVHbgg17MwQqf282N9-Hn0bRLw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTMw/NjkwNzU4OC9lcy9m/b3RvL2hhcHB5LWdp/cmwtanVlZ2EtY29u/LXVuLXBlcnJvLWRl/LWZvbmRvLWdyaXMt/cGVycm8tbGFtZS1j/aGVlY2stZGUtbXVq/ZXItZmVsaXotc2Ul/QzMlQjFvcmEtZGUt/YnVlbm8uanBnP3M9/NjEyJnc9MCZrPTIwJmM9/Skh5S2dQLUloTm9O/a05CZDNEUkluVkZh/TWttYllhRjlkQ2xi/cFB0MWgtST0"
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