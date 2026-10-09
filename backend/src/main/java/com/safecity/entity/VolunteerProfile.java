package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "volunteer_profiles", indexes = {
    @Index(name = "idx_volunteer_user_id", columnList = "user_id", unique = true),
    @Index(name = "idx_volunteer_approval", columnList = "approval_status"),
    @Index(name = "idx_volunteer_availability", columnList = "availability")
})
public class VolunteerProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private VolunteerApprovalStatus approvalStatus = VolunteerApprovalStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability", nullable = false)
    private VolunteerAvailability availability = VolunteerAvailability.AVAILABLE;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "bio_notes", columnDefinition = "TEXT")
    private String bioNotes;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    public VolunteerProfile() {
    }

    public VolunteerProfile(User user, VolunteerApprovalStatus approvalStatus, VolunteerAvailability availability,
                            String skills, String bioNotes, Double latitude, Double longitude) {
        this.user = user;
        this.approvalStatus = approvalStatus != null ? approvalStatus : VolunteerApprovalStatus.PENDING;
        this.availability = availability != null ? availability : VolunteerAvailability.AVAILABLE;
        this.skills = skills;
        this.bioNotes = bioNotes;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
}
