package com.safecity.dto;

public class AdminDashboardSummaryDTO {

    private long totalReports;
    private long submittedReports;
    private long underReviewReports;
    private long verifiedReports;
    private long assignedReports;
    private long activeReports;
    private long resolvedReports;

    public AdminDashboardSummaryDTO() {
    }

    public AdminDashboardSummaryDTO(long totalReports, long submittedReports, long underReviewReports,
                                  long verifiedReports, long assignedReports, long activeReports,
                                  long resolvedReports) {
        this.totalReports = totalReports;
        this.submittedReports = submittedReports;
        this.underReviewReports = underReviewReports;
        this.verifiedReports = verifiedReports;
        this.assignedReports = assignedReports;
        this.activeReports = activeReports;
        this.resolvedReports = resolvedReports;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getSubmittedReports() {
        return submittedReports;
    }

    public void setSubmittedReports(long submittedReports) {
        this.submittedReports = submittedReports;
    }

    public long getUnderReviewReports() {
        return underReviewReports;
    }

    public void setUnderReviewReports(long underReviewReports) {
        this.underReviewReports = underReviewReports;
    }

    public long getVerifiedReports() {
        return verifiedReports;
    }

    public void setVerifiedReports(long verifiedReports) {
        this.verifiedReports = verifiedReports;
    }

    public long getAssignedReports() {
        return assignedReports;
    }

    public void setAssignedReports(long assignedReports) {
        this.assignedReports = assignedReports;
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
