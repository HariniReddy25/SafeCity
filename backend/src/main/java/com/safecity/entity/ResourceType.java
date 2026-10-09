package com.safecity.entity;

public enum ResourceType {
    AMBULANCE("Emergency Medical Ambulance"),
    FIRE_ENGINE("Fire & Rescue Engine"),
    POLICE_PATROL("Police Patrol Unit"),
    RESCUE_SQUAD("Disaster Rescue Squad"),
    HAZMAT_UNIT("Hazardous Materials Unit");

    private final String displayName;

    ResourceType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
