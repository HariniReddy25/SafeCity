package com.safecity.dto;

public class ResponderDashboardSummaryDTO {

    private long assignedEmergencies;
    private long activeEmergencies;
    private long completedResponses;
    private long highCriticalEmergencies;

    public ResponderDashboardSummaryDTO() {
    }

    public ResponderDashboardSummaryDTO(long assignedEmergencies, long activeEmergencies,
                                       long completedResponses, long highCriticalEmergencies) {
        this.assignedEmergencies = assignedEmergencies;
        this.activeEmergencies = activeEmergencies;
        this.completedResponses = completedResponses;
        this.highCriticalEmergencies = highCriticalEmergencies;
    }

    public long getAssignedEmergencies() {
        return assignedEmergencies;
    }

    public void setAssignedEmergencies(long assignedEmergencies) {
        this.assignedEmergencies = assignedEmergencies;
    }

    public long getActiveEmergencies() {
        return activeEmergencies;
    }

    public void setActiveEmergencies(long activeEmergencies) {
        this.activeEmergencies = activeEmergencies;
    }

    public long getCompletedResponses() {
        return completedResponses;
    }

    public void setCompletedResponses(long completedResponses) {
        this.completedResponses = completedResponses;
    }

    public long getHighCriticalEmergencies() {
        return highCriticalEmergencies;
    }

    public void setHighCriticalEmergencies(long highCriticalEmergencies) {
        this.highCriticalEmergencies = highCriticalEmergencies;
    }
}
