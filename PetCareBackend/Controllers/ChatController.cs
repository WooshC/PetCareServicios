using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/ws/chat")]
    public class ChatController : ControllerBase
    {
        // Diccionario de conexiones activas: userId -> WebSocket
        private static readonly Dictionary<int, WebSocket> _connectedUsers = new();
        // Historial simple en memoria (en producción usar base de datos)
        private static readonly List<ChatMessage> _messageHistory = new();

        [Authorize]
        [HttpGet("connect")]
        public async Task Connect()
        {
            if (!HttpContext.WebSockets.IsWebSocketRequest)
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                return;
            }

            // Obtener el userId del JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                HttpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            _connectedUsers[userId] = webSocket;

            // Enviar historial de mensajes relevantes
            var userMessages = _messageHistory
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderBy(m => m.Timestamp)
                .ToList();
            if (userMessages.Any())
            {
                await SendMessageAsync(webSocket, new {
                    type = "history",
                    messages = userMessages
                });
            }

            try
            {
                await HandleWebSocketConnection(userId, webSocket);
            }
            finally
            {
                _connectedUsers.Remove(userId, out _);
            }
        }

        private async Task HandleWebSocketConnection(int userId, WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var json = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var message = JsonSerializer.Deserialize<ChatMessage>(json);
                    if (message != null)
                    {
                        message.SenderId = userId;
                        message.Timestamp = DateTime.UtcNow;
                        _messageHistory.Add(message);

                        // Enviar confirmación al remitente
                        await SendMessageAsync(webSocket, new {
                            type = "message_sent",
                            messageId = message.MessageId,
                            timestamp = message.Timestamp
                        });

                        // Enviar al receptor si está conectado
                        if (_connectedUsers.TryGetValue(message.ReceiverId, out var receiverSocket))
                        {
                            await SendMessageAsync(receiverSocket, new {
                                type = "new_message",
                                message
                            });
                        }
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
                }
            }
        }

        private async Task SendMessageAsync(WebSocket socket, object message)
        {
            var json = JsonSerializer.Serialize(message);
            var bytes = Encoding.UTF8.GetBytes(json);
            await socket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        // Modelo de mensaje de chat
        private class ChatMessage
        {
            public Guid MessageId { get; set; } = Guid.NewGuid();
            public int SenderId { get; set; }
            public int ReceiverId { get; set; }
            public string Content { get; set; } = string.Empty;
            public DateTime Timestamp { get; set; }
        }
    }
} 