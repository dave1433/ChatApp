namespace server.Data;

public class ChatMessage
{
    public long Id { get; set; }
    public string RoomId { get; set; } = "general";
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Task 5: User relationship
    public int UserId { get; set; }
    public User? User { get; set; }
}