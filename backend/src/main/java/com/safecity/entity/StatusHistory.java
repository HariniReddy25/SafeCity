package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "status_history", indexes = {
    @Index(name = "idx_history_report_id", columnList = "report_id"),
    @Index(name = "idx_history_user_id", columnList = "changed_by_user_id")
})
public class StatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private EmergencyReport report;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private ReportStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private ReportStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id")
    private User changedBy;

    @Column(name = "reason_note", columnDefinition = "TEXT")
    private String reasonNote;

    public StatusHistory() {
    }

    public StatusHistory(EmergencyReport report, ReportStatus previousStatus, ReportStatus newStatus, User changedBy, String reasonNote) {
        this.report = report;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.reasonNote = reasonNote;
    }

    public EmergencyReport getReport() {
        return report;
    }

    public void setReport(EmergencyReport report) {
        this.report = report;
    }

    public ReportStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(ReportStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public ReportStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ReportStatus newStatus) {
        this.newStatus = newStatus;
    }

    public User getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(User changedBy) {
        this.changedBy = changedBy;
    }

    public String getReasonNote() {
        return reasonNote;
    }

    public void setReasonNote(String reasonNote) {
        this.reasonNote = reasonNote;
    }
}
