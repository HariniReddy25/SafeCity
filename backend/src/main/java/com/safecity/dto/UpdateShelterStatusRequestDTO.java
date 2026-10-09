package com.safecity.dto;

import com.safecity.entity.ShelterStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateShelterStatusRequestDTO {

    @NotNull(message = "Shelter status is required.")
    private ShelterStatus status;

    public UpdateShelterStatusRequestDTO() {
    }

    public ShelterStatus getStatus() {
        return status;
    }

    public void setStatus(ShelterStatus status) {
        this.status = status;
    }
}
