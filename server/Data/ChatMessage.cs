namespace server.Data;

public class ChatMessage
{
    public long Id { get; set; }
    public string Room { get; set; } = "general";
    public string Username { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}