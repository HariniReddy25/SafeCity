package com.safecity.dto;

import com.safecity.entity.EmergencyReport;
import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EmergencyReportResponseDTO {

    private Long id;
    private String reportId;
    private Long citizenId;
    private String citizenName;
    private Long assignedResponderId;
    private String assignedResponderName;
    private String assignedResponderEmail;
    private String assignedResponderPhone;
    private IncidentCategory category;
    private String categoryDisplayName;
    private String description;
    private ReportPriority priority;
    private ReportStatus status;
    private String statusDisplayName;
    private Double latitude;
    private Double longitude;
    private String address;
    private LocalDateTime incidentDateTime;
    private String evidencePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long masterIncidentId;
    private String masterIncidentCode;

    // SLA Emergency Escalation Clock fields (Phase 2 Passive SLA)
    private Integer slaTargetMinutes;
    private Long elapsedMinutes;
    private Long slaMinutesRemaining;
    private String slaStatus;
    private Boolean isEscalated;

    private List<ResponseNoteDTO> notes = new ArrayList<>();
    private List<StatusHistoryDTO> statusHistory = new ArrayList<>();

    public EmergencyReportResponseDTO() {
    }

    public static EmergencyReportResponseDTO fromEntity(EmergencyReport report) {
        if (report == null) return null;
        EmergencyReportResponseDTO dto = new EmergencyReportResponseDTO();
        dto.setId(report.getId());
        dto.setReportId(report.getReportId());
        if (report.getCitizen() != null) {
            dto.setCitizenId(report.getCitizen().getId());
            dto.setCitizenName(report.getCitizen().getFullName());
        }
        if (report.getAssignedResponder() != null) {
            dto.setAssignedResponderId(report.getAssignedResponder().getId());
            dto.setAssignedResponderName(report.getAssignedResponder().getFullName());
            dto.setAssignedResponderEmail(report.getAssignedResponder().getEmail());
            dto.setAssignedResponderPhone(report.getAssignedResponder().getPhoneNumber());
        }
        if (report.getMasterIncident() != null) {
            dto.setMasterIncidentId(report.getMasterIncident().getId());
            dto.setMasterIncidentCode(report.getMasterIncident().getMasterCode());
        }
        dto.setCategory(report.getCategory());
        dto.setCategoryDisplayName(report.getCategory() != null ? report.getCategory().getDisplayName() : "");
        dto.setDescription(report.getDescription());
        dto.setPriority(report.getPriority());
        dto.setStatus(report.getStatus());
        dto.setStatusDisplayName(report.getStatus() != null ? report.getStatus().getDisplayName() : "");
        dto.setLatitude(report.getLatitude());
        dto.setLongitude(report.getLongitude());
        dto.setAddress(report.getAddress());
        dto.setIncidentDateTime(report.getIncidentDateTime());
        dto.setEvidencePath(report.getEvidencePath());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());

        // Calculate and populate SLA fields
        com.safecity.util.SlaCalculatorUtil.applySlaFields(dto);

        return dto;
    }

    // Getters and Setters
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

    public Long getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(Long citizenId) {
        this.citizenId = citizenId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public void setCitizenName(String citizenName) {
        this.citizenName = citizenName;
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

    public String getAssignedResponderEmail() {
        return assignedResponderEmail;
    }

    public void setAssignedResponderEmail(String assignedResponderEmail) {
        this.assignedResponderEmail = assignedResponderEmail;
    }

    public String getAssignedResponderPhone() {
        return assignedResponderPhone;
    }

    public void setAssignedResponderPhone(String assignedResponderPhone) {
        this.assignedResponderPhone = assignedResponderPhone;
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

    public LocalDateTime getIncidentDateTime() {
        return incidentDateTime;
    }

    public void setIncidentDateTime(LocalDateTime incidentDateTime) {
        this.incidentDateTime = incidentDateTime;
    }

    public String getEvidencePath() {
        return evidencePath;
    }

    public void setEvidencePath(String evidencePath) {
        this.evidencePath = evidencePath;
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

    public List<ResponseNoteDTO> getNotes() {
        return notes;
    }

    public void setNotes(List<ResponseNoteDTO> notes) {
        this.notes = notes;
    }

    public List<StatusHistoryDTO> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusHistoryDTO> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public Long getMasterIncidentId() {
        return masterIncidentId;
    }

    public void setMasterIncidentId(Long masterIncidentId) {
        this.masterIncidentId = masterIncidentId;
    }

    public String getMasterIncidentCode() {
        return masterIncidentCode;
    }

    public void setMasterIncidentCode(String masterIncidentCode) {
        this.masterIncidentCode = masterIncidentCode;
    }

    public Integer getSlaTargetMinutes() {
        return slaTargetMinutes;
    }

    public void setSlaTargetMinutes(Integer slaTargetMinutes) {
        this.slaTargetMinutes = slaTargetMinutes;
    }

    public Long getElapsedMinutes() {
        return elapsedMinutes;
    }

    public void setElapsedMinutes(Long elapsedMinutes) {
        this.elapsedMinutes = elapsedMinutes;
    }

    public Long getSlaMinutesRemaining() {
        return slaMinutesRemaining;
    }

    public void setSlaMinutesRemaining(Long slaMinutesRemaining) {
        this.slaMinutesRemaining = slaMinutesRemaining;
    }

    public String getSlaStatus() {
        return slaStatus;
    }

    public void setSlaStatus(String slaStatus) {
        this.slaStatus = slaStatus;
    }

    public Boolean getIsEscalated() {
        return isEscalated;
    }

    public void setIsEscalated(Boolean isEscalated) {
        this.isEscalated = isEscalated;
    }
}
