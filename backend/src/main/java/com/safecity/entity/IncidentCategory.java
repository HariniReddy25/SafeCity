package com.safecity.entity;

public enum IncidentCategory {
    ROAD_ACCIDENT("Road Accident"),
    FIRE("Fire"),
    MEDICAL_EMERGENCY("Medical Emergency"),
    CRIME("Crime"),
    SUSPICIOUS_ACTIVITY("Suspicious Activity"),
    MISSING_PERSON("Missing Person"),
    PUBLIC_SAFETY_HAZARD("Public Safety Hazard"),
    NATURAL_DISASTER("Natural Disaster"),
    HARASSMENT("Harassment"),
    OTHER("Other");

    private final String displayName;

    IncidentCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
