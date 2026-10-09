package com.safecity.dto;

import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class EmergencyReportRequestDTO {

    @NotNull(message = "Incident category is required")
    private IncidentCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Report priority is required")
    private ReportPriority priority;

    private Double latitude;

    private Double longitude;

    private String address;

    private LocalDateTime incidentDateTime;

    public EmergencyReportRequestDTO() {
    }

    public EmergencyReportRequestDTO(IncidentCategory category, String description, ReportPriority priority,
                                    Double latitude, Double longitude, String address, LocalDateTime incidentDateTime) {
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.incidentDateTime = incidentDateTime;
    }

    public IncidentCategory getCategory() {
        return category;
    }

    public void setCategory(IncidentCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ReportPriority getPriority() {
        return priority;
    }

    public void setPriority(ReportPriority priority) {
        this.priority = priority;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getIncidentDateTime() {
        return incidentDateTime;
    }

    public void setIncidentDateTime(LocalDateTime incidentDateTime) {
        this.incidentDateTime = incidentDateTime;
    }
}
