using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FionaIntegrationSuite.Functions.ReportProcessor;

public class IfsReportGeneratorKafkaConsumer
{
    private readonly ILogger<IfsReportGeneratorKafkaConsumer> _logger;

    public IfsReportGeneratorKafkaConsumer(ILogger<IfsReportGeneratorKafkaConsumer> logger)
    {
        _logger = logger;
    }

    [Function(nameof(IfsReportGeneratorKafkaConsumer))]
    public async Task Run([BlobTrigger("samples-workitems/{name}", Connection = "")] Stream stream, string name)
    {
        using var blobStreamReader = new StreamReader(stream);
        var content = await blobStreamReader.ReadToEndAsync();
        _logger.LogInformation("C# Blob trigger function Processed blob\n Name: {name} \n Data: {content}", name, content);
    }
}