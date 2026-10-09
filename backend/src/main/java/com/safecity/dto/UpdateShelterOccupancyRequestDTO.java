package com.safecity.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateShelterOccupancyRequestDTO {

    @NotNull(message = "Current occupancy is required.")
    @Min(value = 0, message = "Occupancy cannot be negative.")
    private Integer currentOccupancy;

    public UpdateShelterOccupancyRequestDTO() {
    }

    public Integer getCurrentOccupancy() {
        return currentOccupancy;
    }

    public void setCurrentOccupancy(Integer currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
    }
}
