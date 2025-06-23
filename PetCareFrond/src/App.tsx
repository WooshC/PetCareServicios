import React, { useState, useEffect } from 'react';
import { authService, cuidadorService, clienteService } from './services/api';
import { CuidadorRequest, RegisterRequestWithRole, LoginRequestWithRole } from './types/cuidador';
import Layout from './components/Layout';
import CuidadorForm from './components/CuidadorForm';
import CuidadorMain from './components/cuidador/CuidadorMain';
import ChangePasswordForm from './components/ChangePasswordForm';
import ClienteForm from './components/ClienteForm';
import ClienteDashboard from './components/cliente/ClienteDashboard';
// Tipos de vistas disponibles en la aplicación
type ViewType = 'login' | 'register' | 'cuidador-form' | 'cliente-form' | 'dashboard' | 'cuidador-dashboard' | 'cliente-dashboard' | 'change-password';

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

  // Estado para verificar si el cliente tiene perfil creado
  const [clienteHasProfile, setClienteHasProfile] = useState<boolean | null>(null);

  // ===== ESTADOS DE FORMULARIOS =====
  
  // Formulario de login
  const [loginForm, setLoginForm] = useState<LoginRequestWithRole>({
    email: '',
    password: '',
    role: 'Cliente'
  });

  // Formulario de registro
  const [registerForm, setRegisterForm] = useState<RegisterRequestWithRole>({
    email: '',
    password: '',
    name: '',
    role: 'Cliente'
  });

  // ===== MANEJADORES DE FORMULARIOS =====

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, formType: 'login' | 'register') => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formType === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  /**
   * Maneja el proceso de login
   * FLUJO:
   * 1. Valida las credenciales con la API
   * 2. Si es exitoso, guarda el token y redirige al dashboard
   * 3. Si falla, muestra mensaje de error
   */
  const handleLogin = async () => {
    try {
      // Llamada a la API para autenticación
      const response = await authService.loginWithRole(loginForm);
      
      if (response.success) {
        setMessage({ 
          text: '¡Login exitoso!', 
          type: 'success' 
        });
        
        // Redirigir según el rol
        if (loginForm.role === 'Cuidador') {
          setCurrentView('cuidador-dashboard');
        } else {
          // Para clientes, verificar si tienen perfil
          try {
            await clienteService.getMiPerfil();
            setClienteHasProfile(true);
            setCurrentView('cliente-dashboard');
          } catch (error) {
            // Si no tiene perfil, redirigir al formulario de creación
            setClienteHasProfile(false);
            setCurrentView('cliente-form');
          }
        }
      } else {
        setMessage({ 
          text: response.message || 'Error en el login', 
          type: 'error' 
        });
      }
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error de conexión', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el proceso de registro
   * FLUJO:
   * 1. Registra el usuario con la API
   * 2. Si es exitoso, guarda el token y redirige según el rol
   * 3. Si falla, muestra mensaje de error
   */
  const handleRegister = async () => {
    try {
      // Llamada a la API para registro
      const response = await authService.registerWithRole(registerForm);
      
      if (response.success) {
        setMessage({ 
          text: '¡Registro exitoso!', 
          type: 'success' 
        });
        
        // Redirigir según el rol
        if (registerForm.role === 'Cuidador') {
          setCurrentView('cuidador-form');
        } else {
          setCurrentView('cliente-form');
        }
      } else {
        setMessage({ 
          text: response.message || 'Error en el registro', 
          type: 'error' 
        });
      }
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error de conexión', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario de cuidador
   * FLUJO:
   * 1. Crea el perfil de cuidador en la API
   * 2. Si es exitoso, redirige al dashboard del cuidador
   * 3. Si falla, muestra mensaje de error
   */
  const handleCuidadorSubmit = async (data: CuidadorRequest) => {
    try {
      // Crear perfil de cuidador en la API
      const response = await cuidadorService.createCuidador(data);
      
      setMessage({ 
        text: '¡Perfil de cuidador creado exitosamente!', 
        type: 'success' 
      });
      
      // Redirigir al dashboard del cuidador
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
   * Maneja el envío del formulario de cliente
   * FLUJO:
   * 1. Crea el perfil de cliente en la API
   * 2. Si es exitoso, redirige al dashboard del cliente
   * 3. Si falla, muestra mensaje de error
   */
  const handleClienteSubmit = async (data: { documentoIdentidad: string; telefonoEmergencia: string }) => {
    try {
      // Crear perfil de cliente en la API
      const response = await clienteService.createCliente(data);
      
      setMessage({ 
        text: '¡Perfil de cliente creado exitosamente!', 
        type: 'success' 
      });
      
      // Marcar que el cliente tiene perfil y redirigir al dashboard
      setClienteHasProfile(true);
      setCurrentView('cliente-dashboard');
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error al crear perfil de cliente', 
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
   * 2. Limpia los estados de la aplicación
   * 3. Redirige al login
   */
  const handleLogout = () => {
    // Limpiar token y estado de autenticación
    authService.removeToken();
    
    // Resetear todos los estados
    setCurrentView('login');
    setClienteHasProfile(null);
    
    // Resetear formularios
    setLoginForm({
      email: '',
      password: '',
      role: 'Cliente'
    });
    setRegisterForm({
      email: '',
      password: '',
      name: '',
      role: 'Cliente'
    });
    setSelectedRole('Cliente');
    
    // Limpiar cualquier estado adicional
    setLoading(false);
    setMessage(null);
  };

  // ===== MANEJADORES DE CAMBIOS =====

  /**
   * Maneja los cambios en los campos de los formularios
   * @param form - Tipo de formulario ('login' o 'register')
   * @param field - Campo que cambió
   * @param value - Nuevo valor
   */
  const handleInputChange = (form: 'login' | 'register', field: string, value: string) => {
    if (form === 'login') {
      setLoginForm(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterForm(prev => ({ ...prev, [field]: value }));
    }
    setMessage(null);
  };

  /**
   * Maneja el cambio de rol seleccionado
   * @param role - Nuevo rol seleccionado
   */
  const handleRoleChange = (role: 'Cliente' | 'Cuidador') => {
    setSelectedRole(role);
    // También actualizar el rol en el formulario de registro
    setRegisterForm(prev => ({ ...prev, role }));
    // También actualizar el rol en el formulario de login
    setLoginForm(prev => ({ ...prev, role }));
  };

  // ===== MANEJADORES DE CAMBIO DE CONTRASEÑA =====

  const handleChangePassword = () => {
    setCurrentView('change-password');
    setMessage(null);
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setMessage(null);
  };

  const handlePasswordChangeSuccess = (message: string) => {
    setMessage({ text: message, type: 'success' });
    // Redirigir al login después de cambiar la contraseña
    setTimeout(() => {
      setCurrentView('login');
      setMessage(null);
    }, 2000);
  };

  // ===== EFECTOS =====

  // Verificar token al cargar la aplicación para mantener sesión
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          // Obtener el rol real del usuario autenticado
          const userInfo = await authService.getMiRol();
          
          // Verificar si el usuario tiene el rol de Cuidador
          if (userInfo.roles.includes('Cuidador')) {
            // Es un cuidador, verificar si tiene perfil
            try {
              await cuidadorService.getMiPerfil();
              setCurrentView('cuidador-dashboard');
            } catch (error: any) {
              // Cuidador sin perfil, redirigir al formulario de creación
              setCurrentView('cuidador-form');
            }
          } else if (userInfo.roles.includes('Cliente')) {
            // Es un cliente, verificar si tiene perfil
            try {
              await clienteService.getMiPerfil();
              setClienteHasProfile(true);
              setCurrentView('cliente-dashboard');
            } catch (error: any) {
              // Cliente sin perfil, redirigir al formulario de creación
              setClienteHasProfile(false);
              setCurrentView('cliente-form');
            }
          } else {
            // Usuario sin roles válidos, limpiar token y mostrar login
            authService.removeToken();
            setCurrentView('login');
          }
        } catch (error: any) {
          // Error al obtener información del usuario (token inválido, etc.)
          if (error.response?.status === 401) {
            // Token inválido, limpiar y mostrar login
            authService.removeToken();
            setCurrentView('login');
          } else {
            // Otro error, limpiar token por seguridad
            authService.removeToken();
            setCurrentView('login');
          }
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Reset validation when switching forms
  useEffect(() => {
    setValidated(false);
  }, [currentView]);

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
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      {/* Enlace para cambiar contraseña */}
      <div className="text-center mt-3">
        <button 
          type="button" 
          className="btn btn-link text-decoration-none"
          onClick={handleChangePassword}
          disabled={loading}
        >
          <i className="bi bi-question-circle"></i> ¿Olvidaste tu contraseña? Haz clic aquí
        </button>
      </div>

      {/* Enlace para ir al registro */}
      <div className="text-center mt-2">
        <button 
          type="button" 
          className="btn btn-link text-decoration-none"
          onClick={() => {
            console.log('Botón de registro clickeado');
            setCurrentView('register');
          }}
          disabled={loading}
        >
          <i className="bi bi-person-plus"></i> ¿No tienes una cuenta? Regístrate
        </button>
      </div>
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
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>

      {/* Enlace para volver al login */}
      <div className="text-center mt-3">
        <button 
          type="button" 
          className="btn btn-link text-decoration-none"
          onClick={() => setCurrentView('login')}
          disabled={loading}
        >
          <i className="bi bi-arrow-left"></i> ¿Ya tienes una cuenta? Inicia sesión
        </button>
      </div>
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
      case 'register':
        return renderRegisterForm();
      case 'cuidador-form':
        return <CuidadorForm onSubmit={handleCuidadorSubmit} />;
      case 'cliente-form':
        return <ClienteForm onSuccess={() => setCurrentView('cliente-dashboard')} onBack={() => setCurrentView('login')} />;
      case 'cuidador-dashboard':
        return <CuidadorMain onLogout={handleLogout} />;
      case 'cliente-dashboard':
        return <ClienteDashboard onLogout={handleLogout} />;
      case 'change-password':
        return <ChangePasswordForm 
          onBack={handleBackToLogin}
          onSuccess={handlePasswordChangeSuccess}
        />;
      default:
        return renderLoginForm();
    }
  };

  // ===== LÓGICA DE RENDERIZADO =====

  // Si estamos en el dashboard de cuidador o cliente, no usar el layout de login
  // Esto permite que el dashboard tenga su propio diseño completo
  if (currentView === 'cuidador-dashboard' || currentView === 'cliente-dashboard') {
    return renderContent();
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
                  {currentView === 'cliente-form' && 'Perfil de Cliente'}
                  {currentView === 'change-password' && 'Cambiar Contraseña'}
                </h2>
              </div>
              <div className="card-body p-4">
                {/* Mensaje de estado */}
                {message && (
                  <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                    <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`}></i> {message.text}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setMessage(null)}
                    ></button>
                  </div>
                )}

                {/* Contenido principal */}
                {renderContent()}
              </div>
            </div>
          </div>

          {/* Columna de imagen decorativa */}
          <div className="col-md-6 d-none d-md-block">
            <div className="position-relative h-100">
              <img 
                src="https://imgs.search.brave.com/b_o8-I_BsPh4aB7qALl6zh-Sw7jI8OyhAjjQKXZiaWA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM0/MTc1OTc0OS9lcy9m/b3RvL2ZlbGl6LXkt/ZW4lQzMlQTlyZ2lj/by1nb2xkZW4tcmV0/cmlldmVyLWp1Z2Fu/ZG8tYS1sYS1wZXJz/ZWN1Y2klQzMlQjNu/LWNvbi1lbC1kdWUl/QzMlQjFvLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1XWWZG/TlFZcXB1aFdlLXVr/bXA3WGJuRUpGcnhF/VTl4aXZHZDFxbkpN/UUhjPQ"
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