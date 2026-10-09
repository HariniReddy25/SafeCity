package com.safecity.dto;

import com.safecity.entity.IncidentCategory;
import com.safecity.entity.MasterIncident;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class MasterIncidentResponseDTO {

    private Long id;
    private String masterCode;
    private String title;
    private IncidentCategory category;
    private String categoryDisplayName;
    private ReportPriority priority;
    private ReportStatus status;
    private String statusDisplayName;
    private Double latitude;
    private Double longitude;
    private String address;
    private Long assignedResponderId;
    private String assignedResponderName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<EmergencyReportResponseDTO> linkedReports = new ArrayList<>();
    private int linkedReportsCount;

    public MasterIncidentResponseDTO() {
    }

    public static MasterIncidentResponseDTO fromEntity(MasterIncident incident) {
        if (incident == null) return null;

        MasterIncidentResponseDTO dto = new MasterIncidentResponseDTO();
        dto.setId(incident.getId());
        dto.setMasterCode(incident.getMasterCode());
        dto.setTitle(incident.getTitle());
        dto.setCategory(incident.getCategory());
        dto.setCategoryDisplayName(incident.getCategory() != null ? incident.getCategory().getDisplayName() : "");
        dto.setPriority(incident.getPriority());
        dto.setStatus(incident.getStatus());
        dto.setStatusDisplayName(incident.getStatus() != null ? incident.getStatus().getDisplayName() : "");
        dto.setLatitude(incident.getLatitude());
        dto.setLongitude(incident.getLongitude());
        dto.setAddress(incident.getAddress());

        if (incident.getAssignedResponder() != null) {
            dto.setAssignedResponderId(incident.getAssignedResponder().getId());
            dto.setAssignedResponderName(incident.getAssignedResponder().getFullName());
        }

        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());

        if (incident.getReports() != null) {
            dto.setLinkedReports(incident.getReports().stream()
                    .map(EmergencyReportResponseDTO::fromEntity)
                    .collect(Collectors.toList()));
            dto.setLinkedReportsCount(incident.getReports().size());
        } else {
            dto.setLinkedReportsCount(0);
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMasterCode() {
        return masterCode;
    }

    public void setMasterCode(String masterCode) {
        this.masterCode = masterCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public Long getAssignedResponderId() {
        return assignedResponderId;
    }

    public void setAssignedResponderId(Long assignedResponderId) {
        this.assignedResponderId = assignedResponderId;
    }

    public String getAssignedResponderName() {
        return assignedResponderName;
    }

    public void setAssignedResponderName(String assignedResponderName) {
        this.assignedResponderName = assignedResponderName;
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

    public List<EmergencyReportResponseDTO> getLinkedReports() {
        return linkedReports;
    }

    public void setLinkedReports(List<EmergencyReportResponseDTO> linkedReports) {
        this.linkedReports = linkedReports;
    }

    public int getLinkedReportsCount() {
        return linkedReportsCount;
    }

    public void setLinkedReportsCount(int linkedReportsCount) {
        this.linkedReportsCount = linkedReportsCount;
    }
}
