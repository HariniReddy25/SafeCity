package com.safecity.dto;

import com.safecity.entity.ReportPriority;

public class AiSummaryResponseDTO {

    private String reportId;
    private String whatHappened;
    private String importantDetails;
    private String reportedLocation;
    private ReportPriority suggestedUrgency;
    private boolean fallback;
    private String notice;

    public AiSummaryResponseDTO() {}

    public AiSummaryResponseDTO(String reportId, String whatHappened, String importantDetails, String reportedLocation, ReportPriority suggestedUrgency, boolean fallback, String notice) {
        this.reportId = reportId;
        this.whatHappened = whatHappened;
        this.importantDetails = importantDetails;
        this.reportedLocation = reportedLocation;
        this.suggestedUrgency = suggestedUrgency;
        this.fallback = fallback;
        this.notice = notice;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getWhatHappened() {
        return whatHappened;
    }

    public void setWhatHappened(String whatHappened) {
        this.whatHappened = whatHappened;
    }

    public String getImportantDetails() {
        return importantDetails;
    }

    public void setImportantDetails(String importantDetails) {
        this.importantDetails = importantDetails;
    }

    public String getReportedLocation() {
        return reportedLocation;
    }

    public void setReportedLocation(String reportedLocation) {
        this.reportedLocation = reportedLocation;
    }

    public ReportPriority getSuggestedUrgency() {
        return suggestedUrgency;
    }

    public void setSuggestedUrgency(ReportPriority suggestedUrgency) {
        this.suggestedUrgency = suggestedUrgency;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }

    public String getNotice() {
        return notice;
    }

    public void setNotice(String notice) {
        this.notice = notice;
    }
}
