using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace server.Controllers;

public class WeatherController
{
    [ApiController]
    [Route("weather")]
    public class WeatherForecastController : ControllerBase
    {
        [HttpGet("stream")]
        public async Task Stream()
        {
            Response.Headers.ContentType = "text/event-stream";
            while (!HttpContext.RequestAborted.IsCancellationRequested)
            {
                await Task.Delay(1000);
                var weatherUpdate = Encoding.UTF8.GetBytes(
                    $"it's rainy outside! and {new Random().Next()} degrees at {DateTime.Now.ToLocalTime()}\n\n");
                await Response.Body.WriteAsync(weatherUpdate);
                await Response.Body.FlushAsync();
            }
        }
    }
}