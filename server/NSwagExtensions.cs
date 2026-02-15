using NJsonSchema;
using NSwag.Generation;
using NSwag.Generation.Processors;
using NSwag.Generation.Processors.Contexts;
using StateleSSE.AspNetCore;

public static class NSwagExtensions
{
    public static void AddStringConstants<T>(this OpenApiDocumentGeneratorSettings settings)
    {
        settings.DocumentProcessors.Add(new StringConstantsProcessor<T>());
    }

    private sealed class StringConstantsProcessor<T> : IDocumentProcessor
    {
        public void Process(DocumentProcessorContext context)
        {
            var schema = new JsonSchema { Type = JsonObjectType.String };
            foreach (var c in StringConstantsDiscovery.GetAll<T>())
                schema.Enumeration.Add(c);
            context.Document.Definitions["StringConstants"] = schema;
        }
    }
}