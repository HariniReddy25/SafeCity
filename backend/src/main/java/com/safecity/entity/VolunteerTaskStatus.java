package com.safecity.entity;

public enum VolunteerTaskStatus {
    OPPORTUNITY("Open Opportunity"),
    REQUESTED("Willingness Expressed"),
    APPROVED("Human Approved"),
    DECLINED("Declined"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    VolunteerTaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
