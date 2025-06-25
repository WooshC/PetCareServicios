using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PetCareServicios.Data;

namespace PetCareServicios.Hubs
{
    /// <summary>
    /// Hub de SignalR para comunicación en tiempo real entre clientes y cuidadores
    /// Los mensajes se almacenan en memoria y se borran al finalizar el servicio
    /// </summary>
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly AppDbContext _authContext;

        // Diccionario para mantener las conexiones activas
        private static readonly Dictionary<string, UserConnection> _userConnections = new();
        
        // Almacenamiento en memoria de mensajes por solicitud (se borra al finalizar)
        private static readonly Dictionary<int, List<ChatMessage>> _chatMessages = new();

        public ChatHub(ILogger<ChatHub> logger, AppDbContext authContext)
        {
            _logger = logger;
            _authContext = authContext;
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

            // Crear mensaje en memoria
            var chatMessage = new ChatMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SolicitudId = solicitudId,
                SenderId = userId.Value,
                SenderName = user.Name,
                Message = message,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            // Almacenar mensaje en memoria
            if (!_chatMessages.ContainsKey(solicitudId))
            {
                _chatMessages[solicitudId] = new List<ChatMessage>();
            }
            _chatMessages[solicitudId].Add(chatMessage);

            // Enviar mensaje a todos los miembros del grupo
            var groupName = $"solicitud_{solicitudId}";
            await Clients.Group(groupName).SendAsync("ReceiveMessage", chatMessage);

            _logger.LogInformation($"Mensaje enviado en solicitud {solicitudId} por {user.Name}");
        }

        /// <summary>
        /// Marcar mensajes como leídos
        /// </summary>
        public async Task MarkMessagesAsRead(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            // Marcar mensajes no leídos como leídos en memoria
            if (_chatMessages.ContainsKey(solicitudId))
            {
                var unreadMessages = _chatMessages[solicitudId]
                    .Where(m => m.SenderId != userId.Value && !m.IsRead)
                    .ToList();

                foreach (var message in unreadMessages)
                {
                    message.IsRead = true;
                    message.ReadAt = DateTime.UtcNow;
                }
            }

            // Notificar al remitente que sus mensajes fueron leídos
            var groupName = $"solicitud_{solicitudId}";
            await Clients.Group(groupName).SendAsync("MessagesRead", solicitudId, userId.Value);
        }

        /// <summary>
        /// Obtener mensajes de una solicitud desde memoria
        /// </summary>
        public async Task GetChatHistory(int solicitudId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return;

            var messages = _chatMessages.ContainsKey(solicitudId) 
                ? _chatMessages[solicitudId].OrderBy(m => m.Timestamp).ToList()
                : new List<ChatMessage>();

            await Clients.Caller.SendAsync("ChatHistory", solicitudId, messages);
        }

        /// <summary>
        /// Limpiar mensajes de una solicitud (llamado cuando finaliza el servicio)
        /// </summary>
        public async Task ClearChatHistory(int solicitudId)
        {
            if (_chatMessages.ContainsKey(solicitudId))
            {
                _chatMessages.Remove(solicitudId);
                _logger.LogInformation($"Historial de chat limpiado para solicitud {solicitudId}");
            }

            // Notificar a todos los miembros del grupo
            var groupName = $"solicitud_{solicitudId}";
            await Clients.Group(groupName).SendAsync("ChatCleared", solicitudId);
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