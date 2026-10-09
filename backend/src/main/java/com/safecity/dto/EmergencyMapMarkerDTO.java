package com.safecity.dto;

import com.safecity.entity.EmergencyReport;
import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;

import java.time.LocalDateTime;

public class EmergencyMapMarkerDTO {

    private Long id;
    private String reportId;
    private Double latitude;
    private Double longitude;
    private IncidentCategory category;
    private String categoryDisplayName;
    private ReportPriority priority;
    private ReportStatus status;
    private String statusDisplayName;
    private String address;
    private LocalDateTime createdAt;

    public EmergencyMapMarkerDTO() {
    }

    public static EmergencyMapMarkerDTO fromEntity(EmergencyReport report) {
        if (report == null) return null;
        EmergencyMapMarkerDTO dto = new EmergencyMapMarkerDTO();
        dto.setId(report.getId());
        dto.setReportId(report.getReportId());
        dto.setLatitude(report.getLatitude());
        dto.setLongitude(report.getLongitude());
        dto.setCategory(report.getCategory());
        dto.setCategoryDisplayName(report.getCategory() != null ? report.getCategory().getDisplayName() : "");
        dto.setPriority(report.getPriority());
        dto.setStatus(report.getStatus());
        dto.setStatusDisplayName(report.getStatus() != null ? report.getStatus().getDisplayName() : "");
        dto.setAddress(report.getAddress());
        dto.setCreatedAt(report.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
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

    public ReportPriority getPriority() {
        return priority;
    }

    public void setPriority(ReportPriority priority) {
        this.priority = priority;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
