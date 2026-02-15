using Microsoft.EntityFrameworkCore;

namespace server.Data;

public class ChatContext : DbContext
{
    public ChatContext(DbContextOptions<ChatContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>(); 
    
}
