package com.safecity.dto;

import com.safecity.entity.EmergencyBroadcast;
import com.safecity.entity.EmergencyBroadcastSeverity;
import com.safecity.entity.IncidentCategory;

import java.time.LocalDateTime;

public class EmergencyBroadcastResponseDTO {

    private Long id;
    private String title;
    private String message;
    private EmergencyBroadcastSeverity severity;
    private String severityDisplayName;
    private Double centerLatitude;
    private Double centerLongitude;
    private Double radiusKm;
    private IncidentCategory category;
    private String categoryDisplayName;
    private Long senderId;
    private String senderName;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Optional calculated distance field for nearby queries
    private Double distanceFromUserKm;

    public EmergencyBroadcastResponseDTO() {
    }

    public static EmergencyBroadcastResponseDTO fromEntity(EmergencyBroadcast broadcast) {
        if (broadcast == null) return null;
        EmergencyBroadcastResponseDTO dto = new EmergencyBroadcastResponseDTO();
        dto.setId(broadcast.getId());
        dto.setTitle(broadcast.getTitle());
        dto.setMessage(broadcast.getMessage());
        dto.setSeverity(broadcast.getSeverity());
        dto.setSeverityDisplayName(broadcast.getSeverity() != null ? broadcast.getSeverity().getDisplayName() : "");
        dto.setCenterLatitude(broadcast.getCenterLatitude());
        dto.setCenterLongitude(broadcast.getCenterLongitude());
        dto.setRadiusKm(broadcast.getRadiusKm());
        dto.setCategory(broadcast.getCategory());
        dto.setCategoryDisplayName(broadcast.getCategory() != null ? broadcast.getCategory().getDisplayName() : "ALL");
        if (broadcast.getSender() != null) {
            dto.setSenderId(broadcast.getSender().getId());
            dto.setSenderName(broadcast.getSender().getFullName());
        }
        dto.setActive(broadcast.isActive());
        dto.setCreatedAt(broadcast.getCreatedAt());
        dto.setUpdatedAt(broadcast.getUpdatedAt());
        return dto;
    }

    public static EmergencyBroadcastResponseDTO fromEntityWithDistance(EmergencyBroadcast broadcast, Double distanceKm) {
        EmergencyBroadcastResponseDTO dto = fromEntity(broadcast);
        if (dto != null) {
            dto.setDistanceFromUserKm(distanceKm);
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getSeverityDisplayName() {
        return severityDisplayName;
    }

    public void setSeverityDisplayName(String severityDisplayName) {
        this.severityDisplayName = severityDisplayName;
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

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public void setCategoryDisplayName(String categoryDisplayName) {
        this.categoryDisplayName = categoryDisplayName;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Double getDistanceFromUserKm() {
        return distanceFromUserKm;
    }

    public void setDistanceFromUserKm(Double distanceFromUserKm) {
        this.distanceFromUserKm = distanceFromUserKm;
    }
}
