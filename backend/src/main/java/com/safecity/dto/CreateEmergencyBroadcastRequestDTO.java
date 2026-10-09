package com.safecity.dto;

import com.safecity.entity.EmergencyBroadcastSeverity;
import com.safecity.entity.IncidentCategory;
import jakarta.validation.constraints.*;

public class CreateEmergencyBroadcastRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message content is required")
    private String message;

    @NotNull(message = "Severity level is required")
    private EmergencyBroadcastSeverity severity;

    @NotNull(message = "Center latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
    private Double centerLatitude;

    @NotNull(message = "Center longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
    private Double centerLongitude;

    @NotNull(message = "Radius in kilometers is required")
    @Positive(message = "Radius must be greater than zero")
    private Double radiusKm;

    private IncidentCategory category;

    public CreateEmergencyBroadcastRequestDTO() {
    }

    public CreateEmergencyBroadcastRequestDTO(String title, String message, EmergencyBroadcastSeverity severity,
                                              Double centerLatitude, Double centerLongitude, Double radiusKm,
                                              IncidentCategory category) {
        this.title = title;
        this.message = message;
        this.severity = severity;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.radiusKm = radiusKm;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public EmergencyBroadcastSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(EmergencyBroadcastSeverity severity) {
        this.severity = severity;
    }

    public Double getCenterLatitude() {
        return centerLatitude;
    }

    public void setCenterLatitude(Double centerLatitude) {
        this.centerLatitude = centerLatitude;
    }

    public Double getCenterLongitude() {
        return centerLongitude;
    }

    public void setCenterLongitude(Double centerLongitude) {
        this.centerLongitude = centerLongitude;
    }

    public Double getRadiusKm() {
        return radiusKm;
    }

    public void setRadiusKm(Double radiusKm) {
        this.radiusKm = radiusKm;
    }

    public IncidentCategory getCategory() {
        return category;
    }

    public void setCategory(IncidentCategory category) {
        this.category = category;
    }
}
