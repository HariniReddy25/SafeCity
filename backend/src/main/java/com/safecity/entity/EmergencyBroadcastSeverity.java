package com.safecity.entity;

public enum EmergencyBroadcastSeverity {
    INFO("Informational Notice"),
    WARNING("High Alert Warning"),
    CRITICAL("Civil Defense Crisis");

    private final String displayName;

    EmergencyBroadcastSeverity(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
