using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using StateleSSE.AspNetCore;
using server.Data;
using StateleSSE.AspNetCore.EfRealtime;


namespace server.Controllers;

[ApiController]
[Route("chat")]
public class ChatController(ISseBackplane backplane, IRealtimeManager realtimeManager, ChatContext context)
    : RealtimeControllerBase(backplane)
{
    [HttpGet("messages-realtime")]
    public async Task<RealtimeListenResponse<List<ChatMessage>>> GetMessagesRealtime(string connectionId, string room)
    {
        var group = $"room-messages:{room}";
        await backplane.Groups.AddToGroupAsync(connectionId, group);

        realtimeManager.Subscribe<ChatContext>(connectionId, group,
            criteria: changes => changes.OfType<ChatMessage>().Any(e => e.Entity.Room == room),
            query: async ctx => await ctx.ChatMessages
                .Where(m => m.Room == room)
                .OrderBy(m => m.Timestamp)
                .Take(50)
                .ToListAsync());

        var initialData = await context.ChatMessages
            .Where(m => m.Room == room)
            .OrderBy(m => m.Timestamp)
            .Take(50)
            .ToListAsync();

        return new RealtimeListenResponse<List<ChatMessage>>(group, initialData);
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

public abstract record BaseResponseDto;

public record PokeResponse(string Message) : BaseResponseDto;

public record MessageResponse(string Message) : BaseResponseDto;

public record JoinResponse(string Message) : BaseResponseDto;