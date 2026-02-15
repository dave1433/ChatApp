using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.Data;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.Extensions;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<HostOptions>(options =>
{
    options.ShutdownTimeout = TimeSpan.FromSeconds(0); 
});

Env.Load("../.env");

// ---------- Redis Backplane ----------
var redisConnection = builder.Environment.IsDevelopment()
    ?Environment.GetEnvironmentVariable("DEVELOPMENT_REDIS_CONNECTION") 
    :Environment.GetEnvironmentVariable("PRODUCTION_REDIS_CONNECTION");

if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddRedisSseBackplane(redisConnection);
}
else
{
    builder.Services.AddInMemorySseBackplane();
}

//---------- Database ----------
var dbConnection = builder.Environment.IsDevelopment()
    ? Environment.GetEnvironmentVariable("DEVELOPMENT_DB_CONNECTION")
    : Environment.GetEnvironmentVariable("PRODUCTION_DB_CONNECTION");

if (!string.IsNullOrWhiteSpace(dbConnection))
{
    builder.Services.AddDbContext<ChatContext>(options =>
        options.UseNpgsql(dbConnection));
}

//---------- Authentication ----------
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new Exception("JWT_SECRET is missing in environment variables (.env).");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// ---------- Services ----------
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "SSE Chat API";
});
builder.Services.AddCors();
//---------- Build ----------
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<ChatContext>();
    ctx.Database.Migrate();

    if (!ctx.Users.Any())
    {
        ctx.Users.Add(new User
        {
            Username = "admin", 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), 
            Role = "Admin"
        });

        ctx.Users.Add(new User
        {
            Username = "user",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
            Role = "User"
        });
        
        ctx.SaveChanges();
    }
}

// ---------- Middleware ----------
app.UseCors(conf =>
    conf.AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin()
        .SetIsOriginAllowed(_ => true));

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.UseOpenApi();
app.UseSwaggerUi();

app.MapControllers();

app.Run();