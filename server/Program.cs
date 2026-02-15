using server;
using StackExchange.Redis;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<HostOptions>(options =>
{
    options.ShutdownTimeout = TimeSpan.FromSeconds(0); 
});



builder.Services.AddInMemorySseBackplane();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument(config =>
{
    
});
builder.Services.AddRedisSseBackplane("localhost: 6379");
builder.Services.AddOpenApiDocument();
builder.Services.AddCors();

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();
app.UseCors(conf => conf.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_ => true));
app.Run();