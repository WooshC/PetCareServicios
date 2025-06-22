import React, { useState, useEffect } from 'react';
import { authService, cuidadorService } from './services/api';
import { LoginRequest, RegisterRequest } from './types/auth';
import { CuidadorRequest, RegisterRequestWithRole, LoginRequestWithRole } from './types/cuidador';
import Layout from './components/Layout';
import CuidadorForm from './components/CuidadorForm';
import CuidadorDashboard from './components/cuidador/CuidadorDashboard';

// Tipos de vistas disponibles en la aplicación
type ViewType = 'login' | 'register' | 'cuidador-form' | 'dashboard' | 'cuidador-dashboard';

/**
 * Componente principal de la aplicación PetCare
 * Maneja la autenticación, registro y navegación entre diferentes vistas
 * según el rol del usuario (Cliente o Cuidador)
 */
function App() {
  // ===== ESTADOS PRINCIPALES =====
  
  // Vista actual de la aplicación
  const [currentView, setCurrentView] = useState<ViewType>('login');
  
  // Estado de carga para operaciones asíncronas
  const [loading, setLoading] = useState(false);
  
  // Mensajes de éxito/error para mostrar al usuario
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Estado de validación de formularios
  const [validated, setValidated] = useState(false);
  
  // Rol seleccionado por el usuario (Cliente o Cuidador)
  const [selectedRole, setSelectedRole] = useState<'Cliente' | 'Cuidador'>('Cliente');

  // ===== ESTADOS DE FORMULARIOS =====
  
  // Datos del formulario de login con rol
  const [loginForm, setLoginForm] = useState<LoginRequestWithRole>({
    email: '',
    password: '',
    role: 'Cliente'
  });

  // Datos del formulario de registro con rol
  const [registerForm, setRegisterForm] = useState<RegisterRequestWithRole>({
    email: '',
    password: '',
    name: '',
    role: 'Cliente'
  });

  // ===== MANEJADORES DE FORMULARIOS =====

  /**
   * Maneja el envío de formularios (login y registro)
   * Valida el formulario y ejecuta la acción correspondiente
   */
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

  /**
   * Procesa el login del usuario
   * FLUJO:
   * 1. Valida credenciales con la API
   * 2. Si es exitoso, guarda el token
   * 3. Si es Cuidador, verifica si tiene perfil
   * 4. Redirige según el resultado
   */
  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Llamada a la API para autenticación
      const response = await authService.loginWithRole(loginForm);
      
      if (response.success) {
        // Guardar token en localStorage
        authService.setToken(response.token);
        setMessage({ text: '¡Inicio de sesión exitoso!', type: 'success' });
        
        // FLUJO ESPECÍFICO PARA CUIDADORES
        if (loginForm.role === 'Cuidador') {
          try {
            // Verificar si el cuidador ya tiene un perfil creado
            await cuidadorService.getMiPerfil();
            // Si tiene perfil, ir al dashboard de cuidador
            setCurrentView('cuidador-dashboard');
          } catch (error) {
            // Si no tiene perfil, ir al formulario de creación
            setCurrentView('cuidador-form');
          }
        } else {
          // Si es Cliente, ir al dashboard general
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

  /**
   * Procesa el registro de nuevos usuarios
   * FLUJO:
   * 1. Crea el usuario en la API
   * 2. Si es exitoso, guarda el token
   * 3. Si es Cuidador, redirige al formulario de perfil
   * 4. Si es Cliente, redirige al dashboard
   */
  const handleRegister = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Llamada a la API para registro
      const response = await authService.registerWithRole(registerForm);
      
      if (response.success) {
        // Guardar token en localStorage
        authService.setToken(response.token);
        setMessage({ text: '¡Registro exitoso!', type: 'success' });
        
        // FLUJO ESPECÍFICO PARA CUIDADORES
        if (registerForm.role === 'Cuidador') {
          // Los cuidadores deben completar su perfil después del registro
          setCurrentView('cuidador-form');
        } else {
          // Los clientes van directamente al dashboard
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

  /**
   * Procesa la creación del perfil de cuidador
   * FLUJO:
   * 1. Envía datos del perfil a la API
   * 2. Si es exitoso, redirige al dashboard de cuidador
   */
  const handleCuidadorSubmit = async (data: CuidadorRequest) => {
    setLoading(true);
    setMessage(null);

    try {
      // Crear perfil de cuidador en la API
      await cuidadorService.createCuidador(data);
      setMessage({ text: '¡Perfil de cuidador creado exitosamente!', type: 'success' });
      // Ir al dashboard de cuidador
      setCurrentView('cuidador-dashboard');
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al crear perfil de cuidador', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el logout del usuario
   * FLUJO:
   * 1. Elimina el token del localStorage
   * 2. Resetea todos los estados
   * 3. Regresa a la vista de login
   */
  const handleLogout = () => {
    authService.removeToken();
    setCurrentView('login');
    setMessage(null);
    setSelectedRole('Cliente');
    setLoginForm({ email: '', password: '', role: 'Cliente' });
    setRegisterForm({ email: '', password: '', name: '', role: 'Cliente' });
  };

  // ===== MANEJADORES DE CAMBIOS =====

  /**
   * Actualiza los campos de los formularios
   */
  const handleInputChange = (form: 'login' | 'register', field: string, value: string) => {
    if (form === 'login') {
      setLoginForm(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterForm(prev => ({ ...prev, [field]: value }));
    }
  };

  /**
   * Maneja el cambio de rol seleccionado
   * Actualiza tanto el estado visual como los formularios
   */
  const handleRoleChange = (role: 'Cliente' | 'Cuidador') => {
    setSelectedRole(role);
    setLoginForm(prev => ({ ...prev, role }));
    setRegisterForm(prev => ({ ...prev, role }));
  };

  // ===== EFECTOS =====

  // Reset validation when switching forms
  useEffect(() => {
    setValidated(false);
  }, [isLogin]);

  // ===== RENDERIZADO DE FORMULARIOS =====

  /**
   * Renderiza el formulario de login con selección de rol
   */
  const renderLoginForm = () => (
    <form 
      onSubmit={(e) => handleSubmit(e, 'login')} 
      id="loginForm"
      className={validated ? 'was-validated' : ''}
      noValidate
    >
      {/* Selector de rol */}
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

      {/* Campo de email */}
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

      {/* Campo de contraseña */}
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

      {/* Botón de envío */}
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

  /**
   * Renderiza el formulario de registro con selección de rol
   */
  const renderRegisterForm = () => (
    <form 
      onSubmit={(e) => handleSubmit(e, 'register')} 
      id="registerForm"
      className={validated ? 'was-validated' : ''}
      noValidate
    >
      {/* Selector de rol */}
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

      {/* Campo de nombre */}
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

      {/* Campo de email */}
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

      {/* Campo de contraseña */}
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

      {/* Botón de envío */}
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

  /**
   * Renderiza el formulario de creación de perfil de cuidador
   */
  const renderCuidadorForm = () => (
    <div>
      <div className="text-center mb-4">
        <h3><i className="bi bi-heart text-primary"></i> Completa tu Perfil de Cuidador</h3>
        <p className="text-muted">Cuéntanos más sobre ti para que los clientes puedan conocerte</p>
      </div>
      <CuidadorForm onSubmit={handleCuidadorSubmit} loading={loading} />
    </div>
  );

  /**
   * Renderiza el dashboard general para clientes
   */
  const renderDashboard = () => (
    <div className="text-center">
      <h2><i className="bi bi-house-heart text-primary"></i> ¡Bienvenido a PetCare!</h2>
      <p className="lead">Has iniciado sesión como {selectedRole}</p>
      <div className="mt-4">
        <button 
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
        </button>
      </div>
    </div>
  );

  // ===== RENDERIZADO PRINCIPAL =====

  /**
   * Determina qué contenido mostrar según la vista actual
   */
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
      case 'cuidador-dashboard':
        return <CuidadorDashboard onLogout={handleLogout} />;
      default:
        return renderLoginForm();
    }
  };

  // ===== LÓGICA DE RENDERIZADO =====

  // Si estamos en el dashboard de cuidador, no usar el layout de login
  // Esto permite que el dashboard tenga su propio diseño completo
  if (currentView === 'cuidador-dashboard') {
    return <CuidadorDashboard onLogout={handleLogout} />;
  }

  // Renderizado principal con layout de login/registro
  return (
    <Layout>
      <div className="login-container">
        <div className="row justify-content-center w-100">
          {/* Columna del formulario */}
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
                {/* Mensajes de estado */}
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

                {/* Contenido principal */}
                {renderContent()}

                {/* Navegación entre login y registro */}
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

          {/* Columna de imagen decorativa */}
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