package com.safecity.entity;

public enum ShelterStatus {
    AVAILABLE("Available"),
    FULL("Full"),
    CLOSED("Closed"),
    MAINTENANCE("Maintenance"),
    EMERGENCY_ONLY("Emergency Only");

    private final String displayName;

    ShelterStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
