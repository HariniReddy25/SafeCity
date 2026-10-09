package com.safecity.dto;

import com.safecity.entity.EmergencyReport;
import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;

import java.time.LocalDateTime;

public class CommunityFeedItemDTO {

    private Long id;
    private String reportId;
    private IncidentCategory category;
    private String categoryDisplayName;
    private ReportPriority priority;
    private ReportStatus status;
    private String generalLocation;
    private LocalDateTime incidentDateTime;
    private LocalDateTime createdAt;
    private String safetyInformation;

    public CommunityFeedItemDTO() {}

    public CommunityFeedItemDTO(Long id, String reportId, IncidentCategory category, String categoryDisplayName,
                                ReportPriority priority, ReportStatus status, String generalLocation,
                                LocalDateTime incidentDateTime, LocalDateTime createdAt, String safetyInformation) {
        this.id = id;
        this.reportId = reportId;
        this.category = category;
        this.categoryDisplayName = categoryDisplayName;
        this.priority = priority;
        this.status = status;
        this.generalLocation = generalLocation;
        this.incidentDateTime = incidentDateTime;
        this.createdAt = createdAt;
        this.safetyInformation = safetyInformation;
    }

    public static CommunityFeedItemDTO fromReport(EmergencyReport report) {
        if (report == null) return null;

        // Anonymize precise street addresses into general sector area to protect citizen privacy
        String genLocation = "Sector Location logged";
        if (report.getAddress() != null && !report.getAddress().isBlank()) {
            String addr = report.getAddress();
            String[] parts = addr.split(",");
            genLocation = parts.length > 1 ? parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim() : parts[0].trim();
        }

        String safetyInfo = "Emergency responders notified. Exercise normal vigilance in area.";
        if (report.getCategory() == IncidentCategory.FIRE) {
            safetyInfo = "Keep distance from clear smoke zones and yield to emergency fire vehicles.";
        } else if (report.getCategory() == IncidentCategory.ROAD_ACCIDENT) {
            safetyInfo = "Drive cautiously near incident sector and obey traffic divert markers.";
        } else if (report.getCategory() == IncidentCategory.PUBLIC_SAFETY_HAZARD) {
            safetyInfo = "Watch for road hazards or structural obstructions.";
        }

        return new CommunityFeedItemDTO(
                report.getId(),
                report.getReportId(),
                report.getCategory(),
                report.getCategory() != null ? report.getCategory().getDisplayName() : "Emergency",
                report.getPriority(),
                report.getStatus(),
                genLocation,
                report.getIncidentDateTime(),
                report.getCreatedAt(),
                safetyInfo
        );
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

    public String getGeneralLocation() {
        return generalLocation;
    }

    public void setGeneralLocation(String generalLocation) {
        this.generalLocation = generalLocation;
    }

    public LocalDateTime getIncidentDateTime() {
        return incidentDateTime;
    }

    public void setIncidentDateTime(LocalDateTime incidentDateTime) {
        this.incidentDateTime = incidentDateTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSafetyInformation() {
        return safetyInformation;
    }

    public void setSafetyInformation(String safetyInformation) {
        this.safetyInformation = safetyInformation;
    }
}
