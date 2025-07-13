using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PetCareServicios.Data;
using PetCareServicios.Services.Interfaces;
using PetCareServicios.Models.Mensajes;

namespace PetCareServicios.Hubs
{
    /// <summary>
    /// Hub de SignalR para comunicación en tiempo real entre clientes y cuidadores
    /// Los mensajes se almacenan en base de datos para persistencia
    /// </summary>
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly AppDbContext _authContext;
        private readonly IMensajeService _mensajeService;

        // Diccionario para mantener las conexiones activas
        private static readonly Dictionary<string, UserConnection> _userConnections = new();

        public ChatHub(ILogger<ChatHub> logger, AppDbContext authContext, IMensajeService mensajeService)
        {
            _logger = logger;
            _authContext = authContext;
            _mensajeService = mensajeService;
        }

        /// <summary>
        /// Se ejecuta cuando un usuario se conecta al hub
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                var user = await _authContext.Users.FindAsync(userId.Value);
                if (user != null)
                {
                    var connection = new UserConnection
                    {
                        ConnectionId = Context.ConnectionId,
                        UserId = userId.Value,
                        UserName = user.Name,
                        Email = user.Email ?? string.Empty,
                        ConnectedAt = DateTime.UtcNow
                    };

                    _userConnections[Context.ConnectionId] = connection;
                    
                    _logger.LogInformation($"Usuario {user.Name} ({user.Email}) conectado con ID: {Context.ConnectionId}");
                }
            }

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Se ejecuta cuando un usuario se desconecta del hub
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_userConnections.TryGetValue(Context.ConnectionId, out var connection))
            {
                _userConnections.Remove(Context.ConnectionId);
                _logger.LogInformation($"Usuario {connection.UserName} desconectado");
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Unirse a un grupo de chat específico (solicitud)
        /// </summary>
        public async Task JoinChatGroup(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            var groupName = $"solicitud_{solicitudId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation($"Usuario {userId} se unió al grupo de chat: {groupName}");
            
            // Notificar a otros miembros del grupo
            await Clients.OthersInGroup(groupName).SendAsync("UserJoinedChat", solicitudId, userId.Value);
        }

        /// <summary>
        /// Salir de un grupo de chat
        /// </summary>
        public async Task LeaveChatGroup(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            var groupName = $"solicitud_{solicitudId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation($"Usuario {userId} salió del grupo de chat: {groupName}");
            
            // Notificar a otros miembros del grupo
            await Clients.OthersInGroup(groupName).SendAsync("UserLeftChat", solicitudId, userId.Value);
        }

        /// <summary>
        /// Enviar mensaje a un grupo de chat
        /// </summary>
        public async Task SendMessage(int solicitudId, string message)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            var user = await _authContext.Users.FindAsync(userId.Value);
            if (user == null) return;

            try
            {
                // Crear mensaje en base de datos
                var mensaje = await _mensajeService.CrearMensajeAsync(solicitudId, userId.Value, message);

                // Crear objeto de respuesta para SignalR
                var chatMessage = new ChatMessage
                {
                    MessageId = mensaje.MensajeID.ToString(),
                    SolicitudId = solicitudId,
                    SenderId = userId.Value,
                    SenderName = user.Name,
                    Message = message,
                    Timestamp = mensaje.Timestamp,
                    IsRead = false
                };

                // Enviar mensaje a todos los miembros del grupo
                var groupName = $"solicitud_{solicitudId}";
                await Clients.Group(groupName).SendAsync("ReceiveMessage", chatMessage);

                _logger.LogInformation($"Mensaje enviado en solicitud {solicitudId} por {user.Name}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al enviar mensaje en solicitud {solicitudId}");
                await Clients.Caller.SendAsync("ErrorMessage", "Error al enviar el mensaje");
            }
        }

        /// <summary>
        /// Marcar mensajes como leídos
        /// </summary>
        public async Task MarkMessagesAsRead(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            try
            {
                // Marcar mensajes como leídos en base de datos
                await _mensajeService.MarcarMensajesComoLeidosAsync(solicitudId, userId.Value);

                // Notificar al remitente que sus mensajes fueron leídos
                var groupName = $"solicitud_{solicitudId}";
                await Clients.Group(groupName).SendAsync("MessagesRead", solicitudId, userId.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al marcar mensajes como leídos en solicitud {solicitudId}");
            }
        }

        /// <summary>
        /// Obtener mensajes de una solicitud desde base de datos
        /// </summary>
        public async Task GetChatHistory(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            try
            {
                var mensajes = await _mensajeService.ObtenerMensajesPorSolicitudAsync(solicitudId);
                
                // Convertir a formato ChatMessage para compatibilidad
                var chatMessages = mensajes.Select(m => new ChatMessage
                {
                    MessageId = m.MensajeID.ToString(),
                    SolicitudId = m.SolicitudID,
                    SenderId = m.RemitenteID,
                    SenderName = "", // Se llenará desde el frontend
                    Message = m.Contenido,
                    Timestamp = m.Timestamp,
                    IsRead = m.EsLeido,
                    ReadAt = m.FechaLectura
                }).ToList();

                await Clients.Caller.SendAsync("ChatHistory", solicitudId, chatMessages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener historial de chat para solicitud {solicitudId}");
                await Clients.Caller.SendAsync("ErrorMessage", "Error al cargar el historial de mensajes");
            }
        }

        /// <summary>
        /// Obtener cantidad de mensajes no leídos
        /// </summary>
        public async Task GetUnreadCount(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            try
            {
                var cantidad = await _mensajeService.ObtenerCantidadMensajesNoLeidosAsync(solicitudId, userId.Value);
                await Clients.Caller.SendAsync("UnreadCount", solicitudId, cantidad);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener cantidad de mensajes no leídos para solicitud {solicitudId}");
            }
        }

        /// <summary>
        /// Obtener el ID del usuario actual desde el token JWT
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            return userId;
        }
    }

    /// <summary>
    /// Clase para mantener información de conexiones de usuarios
    /// </summary>
    public class UserConnection
    {
        public string ConnectionId { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime ConnectedAt { get; set; }
    }

    /// <summary>
    /// Modelo de mensaje de chat en memoria
    /// </summary>
    public class ChatMessage
    {
        public string MessageId { get; set; } = string.Empty;
        public int SolicitudId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
} 