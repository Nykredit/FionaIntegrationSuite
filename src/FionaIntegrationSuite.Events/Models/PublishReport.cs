namespace FionaIntegrationSuite.Events.Models;
public record PublishReport(int ReportTypeId, string Xml, List<string> Errors)
{
    public virtual string Template => string.Empty;
}
