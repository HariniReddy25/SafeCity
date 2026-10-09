package com.safecity.dto;

import com.safecity.entity.VolunteerTaskAssignment;
import com.safecity.entity.VolunteerTaskStatus;

import java.time.LocalDateTime;

public class VolunteerTaskAssignmentDTO {

    private Long id;
    private Long volunteerProfileId;
    private String volunteerName;
    private String title;
    private String description;
    private String skillRequired;
    private Long shelterId;
    private String shelterName;
    private Long broadcastId;
    private String broadcastTitle;
    private VolunteerTaskStatus status;
    private String notes;
    private String locationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VolunteerTaskAssignmentDTO() {
    }

    public static VolunteerTaskAssignmentDTO fromEntity(VolunteerTaskAssignment assignment) {
        if (assignment == null) return null;
        VolunteerTaskAssignmentDTO dto = new VolunteerTaskAssignmentDTO();
        dto.setId(assignment.getId());
        if (assignment.getVolunteerProfile() != null) {
            dto.setVolunteerProfileId(assignment.getVolunteerProfile().getId());
            if (assignment.getVolunteerProfile().getUser() != null) {
                dto.setVolunteerName(assignment.getVolunteerProfile().getUser().getFullName());
            }
        }
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setSkillRequired(assignment.getSkillRequired());
        if (assignment.getShelter() != null) {
            dto.setShelterId(assignment.getShelter().getId());
            dto.setShelterName(assignment.getShelter().getName());
        }
        if (assignment.getBroadcast() != null) {
            dto.setBroadcastId(assignment.getBroadcast().getId());
            dto.setBroadcastTitle(assignment.getBroadcast().getTitle());
        }
        dto.setStatus(assignment.getStatus());
        dto.setNotes(assignment.getNotes());
        dto.setLocationName(assignment.getLocationName());
        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setUpdatedAt(assignment.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVolunteerProfileId() {
        return volunteerProfileId;
    }

    public void setVolunteerProfileId(Long volunteerProfileId) {
        this.volunteerProfileId = volunteerProfileId;
    }

    public String getVolunteerName() {
        return volunteerName;
    }

    public void setVolunteerName(String volunteerName) {
        this.volunteerName = volunteerName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSkillRequired() {
        return skillRequired;
    }

    public void setSkillRequired(String skillRequired) {
        this.skillRequired = skillRequired;
    }

    public Long getShelterId() {
        return shelterId;
    }

    public void setShelterId(Long shelterId) {
        this.shelterId = shelterId;
    }

    public String getShelterName() {
        return shelterName;
    }

    public void setShelterName(String shelterName) {
        this.shelterName = shelterName;
    }

    public Long getBroadcastId() {
        return broadcastId;
    }

    public void setBroadcastId(Long broadcastId) {
        this.broadcastId = broadcastId;
    }

    public String getBroadcastTitle() {
        return broadcastTitle;
    }

    public void setBroadcastTitle(String broadcastTitle) {
        this.broadcastTitle = broadcastTitle;
    }

    public VolunteerTaskStatus getStatus() {
        return status;
    }

    public void setStatus(VolunteerTaskStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
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
