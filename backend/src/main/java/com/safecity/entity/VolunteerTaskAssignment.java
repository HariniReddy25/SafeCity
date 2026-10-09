package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "volunteer_task_assignments", indexes = {
    @Index(name = "idx_vta_volunteer_id", columnList = "volunteer_profile_id"),
    @Index(name = "idx_vta_status", columnList = "status")
})
public class VolunteerTaskAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_profile_id")
    private VolunteerProfile volunteerProfile;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "skill_required")
    private String skillRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_id")
    private Shelter shelter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broadcast_id")
    private EmergencyBroadcast broadcast;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VolunteerTaskStatus status = VolunteerTaskStatus.OPPORTUNITY;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "location_name")
    private String locationName;

    public VolunteerTaskAssignment() {
    }

    public VolunteerTaskAssignment(VolunteerProfile volunteerProfile, String title, String description,
                                   String skillRequired, Shelter shelter, EmergencyBroadcast broadcast,
                                   VolunteerTaskStatus status, String notes, String locationName) {
        this.volunteerProfile = volunteerProfile;
        this.title = title;
        this.description = description;
        this.skillRequired = skillRequired;
        this.shelter = shelter;
        this.broadcast = broadcast;
        this.status = status != null ? status : VolunteerTaskStatus.OPPORTUNITY;
        this.notes = notes;
        this.locationName = locationName;
    }

    public VolunteerProfile getVolunteerProfile() {
        return volunteerProfile;
    }

    public void setVolunteerProfile(VolunteerProfile volunteerProfile) {
        this.volunteerProfile = volunteerProfile;
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

    public Shelter getShelter() {
        return shelter;
    }

    public void setShelter(Shelter shelter) {
        this.shelter = shelter;
    }

    public EmergencyBroadcast getBroadcast() {
        return broadcast;
    }

    public void setBroadcast(EmergencyBroadcast broadcast) {
        this.broadcast = broadcast;
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
}
