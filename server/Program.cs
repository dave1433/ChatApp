using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.Data;
using StackExchange.Redis;
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
    ? Environment.GetEnvironmentVariable("DEVELOPMENT_REDIS_CONNECTION")
    : Environment.GetEnvironmentVariable("PRODUCTION_REDIS_CONNECTION");

if (!string.IsNullOrWhiteSpace(redisConnection))
{
    builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
        ConnectionMultiplexer.Connect(redisConnection));

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

builder.Services.AddEfRealtime();

if (!string.IsNullOrWhiteSpace(dbConnection))
{
    builder.Services.AddDbContext<ChatContext>((sp, options) =>
    {
        options.UseNpgsql(dbConnection);
        options.AddEfRealtimeInterceptor(sp);
    });
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
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret.Trim())
            )
        };
    });


// ---------- Services ----------
builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "SSE Chat API";

    config.AddSecurity("Bearer", new NSwag.OpenApiSecurityScheme
    {
        Type = NSwag.OpenApiSecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token"
    });

    config.OperationProcessors.Add(
        new NSwag.Generation.Processors.Security.AspNetCoreOperationSecurityScopeProcessor("Bearer"));
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