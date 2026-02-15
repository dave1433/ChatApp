using server;
using server.Data;
using StackExchange.Redis;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<HostOptions>(options =>
{
    options.ShutdownTimeout = TimeSpan.FromSeconds(0); 
});



var redisConnection = builder.Environment.IsDevelopment()
    ?Environment.GetEnvironmentVariable("PRODUCTION_REDIS_CONNECTION") 
    :Environment.GetEnvironmentVariable("DEVELOPMENT_REDIS_CONNECTION");

if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddRedisSseBackplane(redisConnection);
}
else
{
    builder.Services.AddInMemorySseBackplane();
}

builder.Services.AddControllers();
builder.Services.AddOpenApiDocument(config =>
{
    
});
builder.Services.AddCors();

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();
app.UseCors(conf => conf.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_ => true));
app.Run();