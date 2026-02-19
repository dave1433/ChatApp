using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
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
    // Task 2 & 3 & 5: Filter by RoomId, Limit to 5, Include User
    [HttpGet("messages-realtime")]
    public async Task<RealtimeListenResponse<List<ChatMessage>>> GetMessagesRealtime(string connectionId, string roomId)
    {
        var group = $"room-messages:{roomId}";
        await backplane.Groups.AddToGroupAsync(connectionId, group);

        realtimeManager.Subscribe<ChatContext>(connectionId, group,
            criteria: changes => changes.OfType<ChatMessage>().Any(e => e.Entity.RoomId == roomId),
            query: async ctx => await ctx.ChatMessages
                .Include(m => m.User)
                .Where(m => m.RoomId == roomId)
                .OrderByDescending(m => m.Timestamp)
                .Take(5)
                .OrderBy(m => m.Timestamp) // re-sort for UI
                .ToListAsync());

        var initialData = await context.ChatMessages
            .Include(m => m.User)
            .Where(m => m.RoomId == roomId)
            .OrderByDescending(m => m.Timestamp)
            .Take(5)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return new RealtimeListenResponse<List<ChatMessage>>(group, initialData);
    }

    // Task 4: Realtime query for "@everyone"
    [HttpGet("everyone-notifications")]
    public async Task<RealtimeListenResponse<string>> ListenForEveryone(string connectionId)
    {
        var group = "everyone-alerts";
        await backplane.Groups.AddToGroupAsync(connectionId, group);

        realtimeManager.Subscribe<ChatContext>(connectionId, group,
            criteria: changes => changes.OfType<ChatMessage>().Any(e => e.Entity.Content.Contains("@everyone")),
            query: async ctx => "Someone mentioned @everyone!");

        return new RealtimeListenResponse<string>(group);
    }

    [HttpPost("join")]
    [Produces<JoinResponse>]
    public async Task Join(string connectionId, string roomId)
    {
        await backplane.Groups.AddToGroupAsync(connectionId, roomId);
        await backplane.Clients.SendToGroupAsync(roomId, new JoinResponse("someone has entered room"));
    }

    [Authorize]
    [HttpPost("send")]
    [Produces<ChatMessage>]
    public async Task<IActionResult> Send(string roomId, string message)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var user = await context.Users.FirstAsync(u => u.Username == username);

        var chatMessage = new ChatMessage
        {
            RoomId = roomId,
            UserId = user.Id,
            Content = message,
            Timestamp = DateTime.UtcNow
        };

        context.ChatMessages.Add(chatMessage);
        await context.SaveChangesAsync(); // Triggers live queries

        return Ok(chatMessage);
    }

    // Task 1: Update Endpoint
    [Authorize]
    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(long id, string newContent)
    {
        var msg = await context.ChatMessages.FindAsync(id);
        if (msg == null) return NotFound();

        // Check if user owns the message (optional but good)
        var username = User.Identity?.Name;
        var user = await context.Users.FirstAsync(u => u.Username == username);
        if (msg.UserId != user.Id) return Forbid();

        msg.Content = newContent;
        await context.SaveChangesAsync(); // Triggers live queries

        return Ok(msg);
    }

    // Task 1: Delete Endpoint
    [Authorize]
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var msg = await context.ChatMessages.FindAsync(id);
        if (msg == null) return NotFound();

        var username = User.Identity?.Name;
        var user = await context.Users.FirstAsync(u => u.Username == username);
        if (msg.UserId != user.Id) return Forbid();

        context.ChatMessages.Remove(msg);
        await context.SaveChangesAsync(); // Triggers live queries

        return Ok();
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(string roomId)
    {
        var messages = await context.ChatMessages
            .Include(m => m.User)
            .Where(m => m.RoomId == roomId)
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