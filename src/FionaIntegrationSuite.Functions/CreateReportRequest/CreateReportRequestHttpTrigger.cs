using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FionaIntegrationSuite.Functions;

public class CreateReportRequest
{
    private readonly ILogger<CreateReportRequest> _logger;

    public CreateReportRequest(ILogger<CreateReportRequest> logger)
    {
        _logger = logger;
    }

    [Function("CreateReportRequest")]
    public IActionResult Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");
        return new OkObjectResult("Welcome to Azure Functions!");
    }
}