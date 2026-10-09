package com.safecity.dto;

public class ReportSummaryDTO {

    private long totalReports;
    private long activeReports;
    private long resolvedReports;

    public ReportSummaryDTO() {
    }

    public ReportSummaryDTO(long totalReports, long activeReports, long resolvedReports) {
        this.totalReports = totalReports;
        this.activeReports = activeReports;
        this.resolvedReports = resolvedReports;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getActiveReports() {
        return activeReports;
    }

    public void setActiveReports(long activeReports) {
        this.activeReports = activeReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public void setResolvedReports(long resolvedReports) {
        this.resolvedReports = resolvedReports;
    }
}
