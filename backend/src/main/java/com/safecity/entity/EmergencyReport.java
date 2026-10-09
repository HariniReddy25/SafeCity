package com.safecity.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_reports", indexes = {
    @Index(name = "idx_report_id", columnList = "report_id", unique = true),
    @Index(name = "idx_citizen_id", columnList = "citizen_id"),
    @Index(name = "idx_responder_id", columnList = "responder_id")
})
public class EmergencyReport extends BaseEntity {

    @Column(name = "report_id", nullable = false, unique = true)
    private String reportId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id")
    private User assignedResponder;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private IncidentCategory category;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private ReportPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status = ReportStatus.SUBMITTED;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "address")
    private String address;

    @Column(name = "incident_date_time", nullable = false)
    private LocalDateTime incidentDateTime;

    @Column(name = "evidence_path")
    private String evidencePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_incident_id", nullable = true)
    private MasterIncident masterIncident;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    public EmergencyReport() {
    }

    public EmergencyReport(String reportId, User citizen, IncidentCategory category, String description,
                           ReportPriority priority, Double latitude, Double longitude, String address,
                           LocalDateTime incidentDateTime, String evidencePath) {
        this.reportId = reportId;
        this.citizen = citizen;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.status = ReportStatus.SUBMITTED;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.incidentDateTime = incidentDateTime != null ? incidentDateTime : LocalDateTime.now();
        this.evidencePath = evidencePath;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public User getCitizen() {
        return citizen;
    }

    public void setCitizen(User citizen) {
        this.citizen = citizen;
    }

    public User getAssignedResponder() {
        return assignedResponder;
    }

    public void setAssignedResponder(User assignedResponder) {
        this.assignedResponder = assignedResponder;
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

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
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

    public MasterIncident getMasterIncident() {
        return masterIncident;
    }

    public void setMasterIncident(MasterIncident masterIncident) {
        this.masterIncident = masterIncident;
    }

    public LocalDateTime getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(LocalDateTime escalatedAt) {
        this.escalatedAt = escalatedAt;
    }
}
