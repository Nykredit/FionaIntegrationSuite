namespace FionaIntegrationSuite.Events.Models;
public record ReportRequested(int UltimoDate, int SequenceNo, int ReportTypeId, int ReferenceDate, string Result, bool AllDepartmentsSelected, DateTime SendDate, int DestinationId, int ReportStatusId, string User, int SenderId)
{
    public virtual string Template => string.Empty;
}
