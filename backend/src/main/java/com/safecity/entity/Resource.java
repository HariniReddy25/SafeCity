package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resources", indexes = {
    @Index(name = "idx_resource_code", columnList = "resource_code", unique = true),
    @Index(name = "idx_resource_status", columnList = "status"),
    @Index(name = "idx_resource_type", columnList = "type")
})
public class Resource extends BaseEntity {

    @Column(name = "resource_code", nullable = false, unique = true)
    private String resourceCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ResourceType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "station_location")
    private String stationLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_report_id")
    private EmergencyReport assignedReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_master_incident_id")
    private MasterIncident assignedMasterIncident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_operator_id")
    private User assignedOperator;

    public Resource() {
    }

    public Resource(String resourceCode, String name, ResourceType type, ResourceStatus status,
                    Double latitude, Double longitude, String stationLocation) {
        this.resourceCode = resourceCode;
        this.name = name;
        this.type = type;
        this.status = status != null ? status : ResourceStatus.AVAILABLE;
        this.latitude = latitude;
        this.longitude = longitude;
        this.stationLocation = stationLocation;
    }

    public String getResourceCode() {
        return resourceCode;
    }

    public void setResourceCode(String resourceCode) {
        this.resourceCode = resourceCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
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

    public String getStationLocation() {
        return stationLocation;
    }

    public void setStationLocation(String stationLocation) {
        this.stationLocation = stationLocation;
    }

    public EmergencyReport getAssignedReport() {
        return assignedReport;
    }

    public void setAssignedReport(EmergencyReport assignedReport) {
        if (assignedReport != null && this.assignedMasterIncident != null) {
            throw new IllegalStateException("Assignment Invariant Violation: A resource cannot be assigned to both a report and a master incident simultaneously.");
        }
        this.assignedReport = assignedReport;
    }

    public MasterIncident getAssignedMasterIncident() {
        return assignedMasterIncident;
    }

    public void setAssignedMasterIncident(MasterIncident assignedMasterIncident) {
        if (assignedMasterIncident != null && this.assignedReport != null) {
            throw new IllegalStateException("Assignment Invariant Violation: A resource cannot be assigned to both a report and a master incident simultaneously.");
        }
        this.assignedMasterIncident = assignedMasterIncident;
    }

    public User getAssignedOperator() {
        return assignedOperator;
    }

    public void setAssignedOperator(User assignedOperator) {
        this.assignedOperator = assignedOperator;
    }

    public void clearAssignment() {
        this.assignedReport = null;
        this.assignedMasterIncident = null;
        this.assignedOperator = null;
    }
}
