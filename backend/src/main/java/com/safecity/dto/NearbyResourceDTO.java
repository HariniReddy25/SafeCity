package com.safecity.dto;

import com.safecity.entity.Resource;
import com.safecity.entity.ResourceStatus;
import com.safecity.entity.ResourceType;

public class NearbyResourceDTO {

    private Long resourceId;
    private String resourceCode;
    private String name;
    private ResourceType type;
    private String typeDisplayName;
    private ResourceStatus status;
    private String stationLocation;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private Boolean isRecommended;

    public NearbyResourceDTO() {
    }

    public NearbyResourceDTO(Long resourceId, String resourceCode, String name, ResourceType type,
                             String typeDisplayName, ResourceStatus status, String stationLocation,
                             Double latitude, Double longitude, Double distanceKm, Boolean isRecommended) {
        this.resourceId = resourceId;
        this.resourceCode = resourceCode;
        this.name = name;
        this.type = type;
        this.typeDisplayName = typeDisplayName;
        this.status = status;
        this.stationLocation = stationLocation;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
        this.isRecommended = isRecommended;
    }

    public static NearbyResourceDTO fromResource(Resource resource, Double distanceKm, Boolean isRecommended) {
        if (resource == null) return null;
        NearbyResourceDTO dto = new NearbyResourceDTO();
        dto.setResourceId(resource.getId());
        dto.setResourceCode(resource.getResourceCode());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setTypeDisplayName(resource.getType() != null ? resource.getType().getDisplayName() : "");
        dto.setStatus(resource.getStatus());
        dto.setStationLocation(resource.getStationLocation());
        dto.setLatitude(resource.getLatitude());
        dto.setLongitude(resource.getLongitude());
        dto.setDistanceKm(distanceKm);
        dto.setIsRecommended(isRecommended != null ? isRecommended : false);
        return dto;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
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

    public String getStationLocation() {
        return stationLocation;
    }

    public void setStationLocation(String stationLocation) {
        this.stationLocation = stationLocation;
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

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Boolean getIsRecommended() {
        return isRecommended;
    }

    public void setIsRecommended(Boolean isRecommended) {
        this.isRecommended = isRecommended;
    }
}
