package com.safecity.dto;

import com.safecity.entity.VolunteerAvailability;

public class UpdateVolunteerAvailabilityRequestDTO {

    private VolunteerAvailability availability;

    public UpdateVolunteerAvailabilityRequestDTO() {
    }

    public UpdateVolunteerAvailabilityRequestDTO(VolunteerAvailability availability) {
        this.availability = availability;
    }

    public VolunteerAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(VolunteerAvailability availability) {
        this.availability = availability;
    }
}
