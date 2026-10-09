package com.safecity.entity;

public enum VolunteerApprovalStatus {
    PENDING("Pending Approval"),
    APPROVED("Approved Volunteer"),
    REJECTED("Rejected"),
    SUSPENDED("Suspended");

    private final String displayName;

    VolunteerApprovalStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
