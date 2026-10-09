package com.safecity.dto;

import com.safecity.entity.Resource;
import com.safecity.entity.ResourceStatus;
import com.safecity.entity.ResourceType;

import java.time.LocalDateTime;

public class ResourceResponseDTO {

    private Long id;
    private String resourceCode;
    private String name;
    private ResourceType type;
    private String typeDisplayName;
    private ResourceStatus status;
    private String statusDisplayName;
    private Double latitude;
    private Double longitude;
    private String stationLocation;
    private Long assignedReportId;
    private String assignedReportCode;
    private Long assignedMasterIncidentId;
    private String assignedMasterIncidentCode;
    private Long assignedOperatorId;
    private String assignedOperatorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResourceResponseDTO() {
    }

    public static ResourceResponseDTO fromEntity(Resource resource) {
        if (resource == null) return null;

        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(resource.getId());
        dto.setResourceCode(resource.getResourceCode());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setTypeDisplayName(resource.getType() != null ? resource.getType().getDisplayName() : "");
        dto.setStatus(resource.getStatus());
        dto.setStatusDisplayName(resource.getStatus() != null ? resource.getStatus().getDisplayName() : "");
        dto.setLatitude(resource.getLatitude());
        dto.setLongitude(resource.getLongitude());
        dto.setStationLocation(resource.getStationLocation());

        if (resource.getAssignedReport() != null) {
            dto.setAssignedReportId(resource.getAssignedReport().getId());
            dto.setAssignedReportCode(resource.getAssignedReport().getReportId());
        }

        if (resource.getAssignedMasterIncident() != null) {
            dto.setAssignedMasterIncidentId(resource.getAssignedMasterIncident().getId());
            dto.setAssignedMasterIncidentCode(resource.getAssignedMasterIncident().getMasterCode());
        }

        if (resource.getAssignedOperator() != null) {
            dto.setAssignedOperatorId(resource.getAssignedOperator().getId());
            dto.setAssignedOperatorName(resource.getAssignedOperator().getFullName());
        }

        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTypeDisplayName() {
        return typeDisplayName;
    }

    public void setTypeDisplayName(String typeDisplayName) {
        this.typeDisplayName = typeDisplayName;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
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

    public String getStationLocation() {
        return stationLocation;
    }

    public void setStationLocation(String stationLocation) {
        this.stationLocation = stationLocation;
    }

    public Long getAssignedReportId() {
        return assignedReportId;
    }

    public void setAssignedReportId(Long assignedReportId) {
        this.assignedReportId = assignedReportId;
    }

    public String getAssignedReportCode() {
        return assignedReportCode;
    }

    public void setAssignedReportCode(String assignedReportCode) {
        this.assignedReportCode = assignedReportCode;
    }

    public Long getAssignedMasterIncidentId() {
        return assignedMasterIncidentId;
    }

    public void setAssignedMasterIncidentId(Long assignedMasterIncidentId) {
        this.assignedMasterIncidentId = assignedMasterIncidentId;
    }

    public String getAssignedMasterIncidentCode() {
        return assignedMasterIncidentCode;
    }

    public void setAssignedMasterIncidentCode(String assignedMasterIncidentCode) {
        this.assignedMasterIncidentCode = assignedMasterIncidentCode;
    }

    public Long getAssignedOperatorId() {
        return assignedOperatorId;
    }

    public void setAssignedOperatorId(Long assignedOperatorId) {
        this.assignedOperatorId = assignedOperatorId;
    }

    public String getAssignedOperatorName() {
        return assignedOperatorName;
    }

    public void setAssignedOperatorName(String assignedOperatorName) {
        this.assignedOperatorName = assignedOperatorName;
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
}
