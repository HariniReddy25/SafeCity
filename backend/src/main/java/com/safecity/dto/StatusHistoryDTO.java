package com.safecity.dto;

import com.safecity.entity.ReportStatus;
import com.safecity.entity.StatusHistory;

import java.time.LocalDateTime;

public class StatusHistoryDTO {

    private Long id;
    private Long reportId;
    private ReportStatus previousStatus;
    private String previousStatusDisplayName;
    private ReportStatus newStatus;
    private String newStatusDisplayName;
    private Long changedByUserId;
    private String changedByName;
    private String changedByRole;
    private String reasonNote;
    private LocalDateTime timestamp;

    public StatusHistoryDTO() {
    }

    public static StatusHistoryDTO fromEntity(StatusHistory history) {
        if (history == null) return null;
        StatusHistoryDTO dto = new StatusHistoryDTO();
        dto.setId(history.getId());
        if (history.getReport() != null) {
            dto.setReportId(history.getReport().getId());
        }
        dto.setPreviousStatus(history.getPreviousStatus());
        dto.setPreviousStatusDisplayName(history.getPreviousStatus() != null ? history.getPreviousStatus().getDisplayName() : null);
        dto.setNewStatus(history.getNewStatus());
        dto.setNewStatusDisplayName(history.getNewStatus() != null ? history.getNewStatus().getDisplayName() : "");
        if (history.getChangedBy() != null) {
            dto.setChangedByUserId(history.getChangedBy().getId());
            dto.setChangedByName(history.getChangedBy().getFullName());
            dto.setChangedByRole(history.getChangedBy().getRole() != null ? history.getChangedBy().getRole().name() : "SYSTEM");
        } else {
            dto.setChangedByName("SafeCity System");
            dto.setChangedByRole("SYSTEM");
        }
        dto.setReasonNote(history.getReasonNote());
        dto.setTimestamp(history.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public ReportStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(ReportStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getPreviousStatusDisplayName() {
        return previousStatusDisplayName;
    }

    public void setPreviousStatusDisplayName(String previousStatusDisplayName) {
        this.previousStatusDisplayName = previousStatusDisplayName;
    }

    public ReportStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ReportStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getNewStatusDisplayName() {
        return newStatusDisplayName;
    }

    public void setNewStatusDisplayName(String newStatusDisplayName) {
        this.newStatusDisplayName = newStatusDisplayName;
    }

    public Long getChangedByUserId() {
        return changedByUserId;
    }

    public void setChangedByUserId(Long changedByUserId) {
        this.changedByUserId = changedByUserId;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public String getChangedByRole() {
        return changedByRole;
    }

    public void setChangedByRole(String changedByRole) {
        this.changedByRole = changedByRole;
    }

    public String getReasonNote() {
        return reasonNote;
    }

    public void setReasonNote(String reasonNote) {
        this.reasonNote = reasonNote;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
