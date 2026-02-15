namespace server.Data;

public class ChatMessage
{
    public long Id { get; set; }
    public required string Room { get; set; }
    public required string Message { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? UserId { get; set; }
}
