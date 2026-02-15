using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using StateleSSE.AspNetCore;
using server.Data;


namespace server.Controllers;

[ApiController]
[Route("chat")]
public class ChatController (ISseBackplane backplane, ChatContext context) : ControllerBase
{
    [HttpGet("Connect")]
    public async Task Connect()
    {
        await using var sse = await HttpContext.OpenSseStreamAsync();
        await using var connection = backplane.CreateConnection();

        await sse.WriteAsync("connected", JsonSerializer.Serialize(new { connection.ConnectionId },
            new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));

        await foreach (var evt in connection.ReadAllAsync(HttpContext.RequestAborted))
            await sse.WriteAsync(evt.Group ?? "message", evt.Data);
    }

    [HttpPost("join")]
    [Produces<JoinResponse>]
    public async Task Join(string connectionId, string room)
    {
        await backplane.Groups.AddToGroupAsync(connectionId, room);
        await backplane.Clients.SendToGroupAsync(room, new JoinResponse("someone has entered room"));
    }
    
    [Authorize]
    [HttpPost("send")]
    [Produces<MessageResponse>]
    public async Task<IActionResult> Send(string room, string message)
    {
        var username = User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(username))
            return Unauthorized("Missing username from token.");

        var chatMessage = new ChatMessage
        {
            Room = room,
            Username = username,
            Content = message,
            Timestamp = DateTime.UtcNow
        };

        context.ChatMessages.Add(chatMessage);
        await context.SaveChangesAsync();

        await backplane.Clients.SendToGroupAsync(room, new MessageResponse($"{username}: {message}"));

        return Ok(chatMessage);
    }
    
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(string room)
    {
        var messages = await context.ChatMessages
            .Where(m => m.Room == room)
            .OrderBy(m => m.Timestamp)
            .Take(50)
            .ToListAsync();

        return Ok(messages);
    }


    [HttpPost("poke")]
    [Produces<PokeResponse>]
    public async Task Poke(string connectionId)
    {
        await backplane.Clients.SendToClientAsync(connectionId, new PokeResponse("you have been poked"));
    }

    [HttpPost("leave")]
    public async Task Leave(string roomId, string connectionId)
    {
        await backplane.Groups.RemoveFromGroupAsync(connectionId, roomId);
    }
    
    
    
}

public record PokeResponse(string Message) : BaseResponseDto;

public record MessageResponse(string Message) : BaseResponseDto;

public record JoinResponse(string Message) : BaseResponseDto;