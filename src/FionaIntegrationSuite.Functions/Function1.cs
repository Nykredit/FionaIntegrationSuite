using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;

namespace FionaIntegrationSuite.Functions;

public class Function1
{
    private readonly ILogger<Function1> _logger;

    public Function1(ILogger<Function1> logger)
    {
        _logger = logger;
    }

    [Function("GetSendReport")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        // Connection string to your database
        string connectionString = "Server=172.20.1.133;Database=IndberetningNationalbanken;User Id=NYKVNRS;Password=SparVnrs2025;Encrypt=False;Trusted_Connection=False;MultipleActiveResultSets=true;";

        // The query to fetch data
        string query = "SELECT TOP 10 * FROM SendReport";

        try
        {
            // Connect to the database
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        var result = new System.Text.StringBuilder();
                        while (await reader.ReadAsync())
                        {
                            // Example: Append column values to the result
                            result.AppendLine(reader[0].ToString());
                            result.AppendLine(reader[1].ToString());
                            result.AppendLine(reader[2].ToString());
                            result.AppendLine(reader[3].ToString());
                            result.AppendLine(reader[4].ToString());
                            result.AppendLine(reader[5].ToString());
                            result.AppendLine(reader[6].ToString());

                        }

                        return new OkObjectResult(result.ToString());
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Database connection failed: {ex.Message}");
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }
}
