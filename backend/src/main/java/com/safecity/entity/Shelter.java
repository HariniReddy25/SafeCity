package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shelters", indexes = {
    @Index(name = "idx_shelter_code", columnList = "shelter_code", unique = true),
    @Index(name = "idx_shelter_status", columnList = "status")
})
public class Shelter extends BaseEntity {

    @Column(name = "shelter_code", nullable = false, unique = true)
    private String shelterCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "capacity", nullable = false)
    private Integer capacity = 100;

    @Column(name = "current_occupancy", nullable = false)
    private Integer currentOccupancy = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ShelterStatus status = ShelterStatus.AVAILABLE;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "facilities", columnDefinition = "TEXT")
    private String facilities;

    public Shelter() {
    }

    public Shelter(String shelterCode, String name, String description, String address,
                   Double latitude, Double longitude, Integer capacity, Integer currentOccupancy,
                   ShelterStatus status, String contactPhone, String facilities) {
        this.shelterCode = shelterCode;
        this.name = name;
        this.description = description;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacity = capacity != null ? capacity : 100;
        this.currentOccupancy = currentOccupancy != null ? currentOccupancy : 0;
        this.status = status != null ? status : ShelterStatus.AVAILABLE;
        this.contactPhone = contactPhone;
        this.facilities = facilities;
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

    public ShelterStatus getStatus() {
        return status;
    }

    public void setStatus(ShelterStatus status) {
        this.status = status;
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
}
