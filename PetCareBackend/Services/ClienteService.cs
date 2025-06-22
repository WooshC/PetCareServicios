using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Models.Clientes;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    /// <summary>
    /// Servicio para la gestión de clientes usando la base de datos separada
    /// </summary>
    public class ClienteService : IClienteService
    {
        private readonly ClientesDbContext _clientesContext;
        private readonly AppDbContext _authContext;

        public ClienteService(ClientesDbContext clientesContext, AppDbContext authContext)
        {
            _clientesContext = clientesContext;
            _authContext = authContext;
        }

        /// <summary>
        /// Obtiene un cliente por su ID de usuario
        /// </summary>
        public async Task<ClienteResponse?> GetClienteByUsuarioIdAsync(int usuarioId)
        {
            var cliente = await _clientesContext.Clientes
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId);

            if (cliente == null)
                return null;

            // Obtener información del usuario desde la base de datos de autenticación
            var usuario = await _authContext.Users.FindAsync(usuarioId);
            
            return MapToResponse(cliente, usuario);
        }

        /// <summary>
        /// Obtiene un cliente por su ID
        /// </summary>
        public async Task<ClienteResponse?> GetClienteByIdAsync(int clienteId)
        {
            var cliente = await _clientesContext.Clientes
                .FirstOrDefaultAsync(c => c.ClienteID == clienteId);

            if (cliente == null)
                return null;

            // Obtener información del usuario desde la base de datos de autenticación
            var usuario = await _authContext.Users.FindAsync(cliente.UsuarioID);
            
            return MapToResponse(cliente, usuario);
        }

        /// <summary>
        /// Obtiene todos los clientes activos
        /// </summary>
        public async Task<List<ClienteResponse>> GetAllClientesAsync()
        {
            var clientes = await _clientesContext.Clientes
                .Where(c => c.Estado == "Activo")
                .ToListAsync();

            // Obtener todos los usuarios correspondientes
            var usuarioIds = clientes.Select(c => c.UsuarioID).ToList();
            var usuarios = await _authContext.Users
                .Where(u => usuarioIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u);

            return clientes.Select(c => MapToResponse(c, usuarios.GetValueOrDefault(c.UsuarioID))).ToList();
        }

        /// <summary>
        /// Crea un nuevo perfil de cliente
        /// </summary>
        public async Task<ClienteResponse> CreateClienteAsync(int usuarioId, ClienteRequest request)
        {
            // Verificar que el usuario existe en la base de datos de autenticación
            var usuario = await _authContext.Users.FindAsync(usuarioId);
            if (usuario == null)
                throw new ArgumentException("Usuario no encontrado");

            // Verificar que no existe ya un cliente para este usuario
            var clienteExistente = await _clientesContext.Clientes
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId);
            
            if (clienteExistente != null)
                throw new InvalidOperationException("Ya existe un perfil de cliente para este usuario");

            var cliente = new Cliente
            {
                UsuarioID = usuarioId,
                DocumentoIdentidad = request.DocumentoIdentidad,
                TelefonoEmergencia = request.TelefonoEmergencia,
                Estado = "Activo",
                FechaCreacion = DateTime.UtcNow
            };

            _clientesContext.Clientes.Add(cliente);
            await _clientesContext.SaveChangesAsync();

            return MapToResponse(cliente, usuario);
        }

        /// <summary>
        /// Actualiza un perfil de cliente existente
        /// </summary>
        public async Task<ClienteResponse?> UpdateClienteAsync(int clienteId, ClienteRequest request)
        {
            var cliente = await _clientesContext.Clientes.FindAsync(clienteId);
            if (cliente == null)
                return null;

            cliente.DocumentoIdentidad = request.DocumentoIdentidad;
            cliente.TelefonoEmergencia = request.TelefonoEmergencia;
            cliente.FechaActualizacion = DateTime.UtcNow;

            await _clientesContext.SaveChangesAsync();

            // Obtener información del usuario
            var usuario = await _authContext.Users.FindAsync(cliente.UsuarioID);
            
            return MapToResponse(cliente, usuario);
        }

        /// <summary>
        /// Elimina un perfil de cliente (marca como inactivo)
        /// </summary>
        public async Task<bool> DeleteClienteAsync(int clienteId)
        {
            var cliente = await _clientesContext.Clientes.FindAsync(clienteId);
            if (cliente == null)
                return false;

            cliente.Estado = "Inactivo";
            cliente.FechaActualizacion = DateTime.UtcNow;

            await _clientesContext.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Verifica el documento de un cliente
        /// </summary>
        public async Task<bool> VerificarDocumentoAsync(int clienteId)
        {
            var cliente = await _clientesContext.Clientes.FindAsync(clienteId);
            if (cliente == null)
                return false;

            cliente.DocumentoVerificado = true;
            cliente.FechaVerificacion = DateTime.UtcNow;
            cliente.FechaActualizacion = DateTime.UtcNow;

            await _clientesContext.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Mapea un cliente a su respuesta DTO
        /// </summary>
        private static ClienteResponse MapToResponse(Cliente cliente, User? usuario)
        {
            return new ClienteResponse
            {
                ClienteID = cliente.ClienteID,
                UsuarioID = cliente.UsuarioID,
                DocumentoIdentidad = cliente.DocumentoIdentidad,
                TelefonoEmergencia = cliente.TelefonoEmergencia,
                DocumentoVerificado = cliente.DocumentoVerificado,
                FechaVerificacion = cliente.FechaVerificacion,
                FechaCreacion = cliente.FechaCreacion,
                FechaActualizacion = cliente.FechaActualizacion,
                Estado = cliente.Estado,
                NombreUsuario = usuario?.Name ?? string.Empty,
                EmailUsuario = usuario?.Email ?? string.Empty
            };
        }
    }
} 