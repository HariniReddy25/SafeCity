package com.safecity.dto;

import com.safecity.entity.VolunteerAvailability;

public class UpdateVolunteerProfileRequestDTO {

    private String skills;
    private String bioNotes;
    private VolunteerAvailability availability;
    private Double latitude;
    private Double longitude;

    public UpdateVolunteerProfileRequestDTO() {
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

    public VolunteerAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(VolunteerAvailability availability) {
        this.availability = availability;
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
