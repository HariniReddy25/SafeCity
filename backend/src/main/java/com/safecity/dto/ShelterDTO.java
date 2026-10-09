package com.safecity.dto;

import com.safecity.entity.Shelter;
import com.safecity.entity.ShelterStatus;

import java.time.LocalDateTime;

public class ShelterDTO {

    private Long id;
    private String shelterCode;
    private String name;
    private String description;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer capacity;
    private Integer currentOccupancy;
    private Integer availableSlots;
    private ShelterStatus status;
    private String statusDisplayName;
    private String contactPhone;
    private String facilities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ShelterDTO() {
    }

    public static ShelterDTO fromEntity(Shelter shelter) {
        if (shelter == null) return null;
        ShelterDTO dto = new ShelterDTO();
        dto.setId(shelter.getId());
        dto.setShelterCode(shelter.getShelterCode());
        dto.setName(shelter.getName());
        dto.setDescription(shelter.getDescription());
        dto.setAddress(shelter.getAddress());
        dto.setLatitude(shelter.getLatitude());
        dto.setLongitude(shelter.getLongitude());
        dto.setCapacity(shelter.getCapacity());
        dto.setCurrentOccupancy(shelter.getCurrentOccupancy());

        int cap = shelter.getCapacity() != null ? shelter.getCapacity() : 0;
        int occ = shelter.getCurrentOccupancy() != null ? shelter.getCurrentOccupancy() : 0;
        dto.setAvailableSlots(Math.max(0, cap - occ));

        dto.setStatus(shelter.getStatus());
        dto.setStatusDisplayName(shelter.getStatus() != null ? shelter.getStatus().getDisplayName() : null);
        dto.setContactPhone(shelter.getContactPhone());
        dto.setFacilities(shelter.getFacilities());
        dto.setCreatedAt(shelter.getCreatedAt());
        dto.setUpdatedAt(shelter.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShelterCode() {
        return shelterCode;
    }

    public void setShelterCode(String shelterCode) {
        this.shelterCode = shelterCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getCurrentOccupancy() {
        return currentOccupancy;
    }

    public void setCurrentOccupancy(Integer currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
    }

    public Integer getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(Integer availableSlots) {
        this.availableSlots = availableSlots;
    }

    public ShelterStatus getStatus() {
        return status;
    }

    public void setStatus(ShelterStatus status) {
        this.status = status;
    }

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getFacilities() {
        return facilities;
    }

    public void setFacilities(String facilities) {
        this.facilities = facilities;
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
