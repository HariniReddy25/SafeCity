package com.safecity.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "master_incidents", indexes = {
    @Index(name = "idx_master_code", columnList = "master_code", unique = true),
    @Index(name = "idx_master_responder_id", columnList = "responder_id")
})
public class MasterIncident extends BaseEntity {

    @Column(name = "master_code", nullable = false, unique = true)
    private String masterCode;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private IncidentCategory category;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id")
    private User assignedResponder;

    @OneToMany(mappedBy = "masterIncident", fetch = FetchType.LAZY)
    private List<EmergencyReport> reports = new ArrayList<>();

    public MasterIncident() {
    }

    public MasterIncident(String masterCode, String title, IncidentCategory category, ReportPriority priority,
                          Double latitude, Double longitude, String address) {
        this.masterCode = masterCode;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.status = ReportStatus.SUBMITTED;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
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

    public User getAssignedResponder() {
        return assignedResponder;
    }

    public void setAssignedResponder(User assignedResponder) {
        this.assignedResponder = assignedResponder;
    }

    public List<EmergencyReport> getReports() {
        return reports;
    }

    public void setReports(List<EmergencyReport> reports) {
        this.reports = reports;
    }
}
