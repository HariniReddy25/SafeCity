package com.safecity.entity;

public enum VolunteerAvailability {
    AVAILABLE("Available for Support"),
    UNAVAILABLE("Currently Unavailable");

    private final String displayName;

    VolunteerAvailability(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
