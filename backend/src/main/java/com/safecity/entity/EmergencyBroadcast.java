package com.safecity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "emergency_broadcasts", indexes = {
    @Index(name = "idx_broadcast_active", columnList = "active"),
    @Index(name = "idx_broadcast_severity", columnList = "severity"),
    @Index(name = "idx_broadcast_created_at", columnList = "created_at")
})
public class EmergencyBroadcast extends BaseEntity {

    @NotBlank(message = "Broadcast title is required")
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank(message = "Broadcast message content is required")
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @NotNull(message = "Broadcast severity is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private EmergencyBroadcastSeverity severity;

    @NotNull(message = "Center latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
    @Column(name = "center_latitude", nullable = false)
    private Double centerLatitude;

    @NotNull(message = "Center longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
    @Column(name = "center_longitude", nullable = false)
    private Double centerLongitude;

    @NotNull(message = "Radius in kilometers is required")
    @Positive(message = "Broadcast radius must be greater than zero")
    @Column(name = "radius_km", nullable = false)
    private Double radiusKm;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private IncidentCategory category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public EmergencyBroadcast() {
    }

    public EmergencyBroadcast(String title, String message, EmergencyBroadcastSeverity severity,
                              Double centerLatitude, Double centerLongitude, Double radiusKm,
                              IncidentCategory category, User sender) {
        this.title = title;
        this.message = message;
        this.severity = severity != null ? severity : EmergencyBroadcastSeverity.WARNING;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.radiusKm = radiusKm;
        this.category = category;
        this.sender = sender;
        this.active = true;
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

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
