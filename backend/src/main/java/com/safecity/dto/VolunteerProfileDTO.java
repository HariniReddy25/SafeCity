package com.safecity.dto;

import com.safecity.entity.VolunteerApprovalStatus;
import com.safecity.entity.VolunteerAvailability;
import com.safecity.entity.VolunteerProfile;

import java.time.LocalDateTime;

public class VolunteerProfileDTO {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private VolunteerApprovalStatus approvalStatus;
    private VolunteerAvailability availability;
    private String skills;
    private String bioNotes;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VolunteerProfileDTO() {
    }

    public static VolunteerProfileDTO fromEntity(VolunteerProfile profile, boolean includeLocation) {
        if (profile == null) return null;
        VolunteerProfileDTO dto = new VolunteerProfileDTO();
        dto.setId(profile.getId());
        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setFullName(profile.getUser().getFullName());
            dto.setEmail(profile.getUser().getEmail());
        }
        dto.setApprovalStatus(profile.getApprovalStatus());
        dto.setAvailability(profile.getAvailability());
        dto.setSkills(profile.getSkills());
        dto.setBioNotes(profile.getBioNotes());
        if (includeLocation) {
            dto.setLatitude(profile.getLatitude());
            dto.setLongitude(profile.getLongitude());
        } else if (profile.getLatitude() != null && profile.getLongitude() != null) {
            // Approximate to 2 decimal places (~1km precision) for privacy
            dto.setLatitude(Math.round(profile.getLatitude() * 100.0) / 100.0);
            dto.setLongitude(Math.round(profile.getLongitude() * 100.0) / 100.0);
        }
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public VolunteerApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(VolunteerApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public VolunteerAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(VolunteerAvailability availability) {
        this.availability = availability;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getBioNotes() {
        return bioNotes;
    }

    public void setBioNotes(String bioNotes) {
        this.bioNotes = bioNotes;
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
