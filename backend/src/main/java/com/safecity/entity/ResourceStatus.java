package com.safecity.entity;

public enum ResourceStatus {
    AVAILABLE("Available"),
    DISPATCHED("Dispatched"),
    MAINTENANCE("Maintenance"),
    OFFLINE("Offline");

    private final String displayName;

    ResourceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
