using Microsoft.EntityFrameworkCore;

namespace server.Data;

public class ChatContext : DbContext
{
    public ChatContext(DbContextOptions<ChatContext> options) : base(options)
    {
    }

    public DbSet<ChatMessage> ChatMessages { get; set; }
}
