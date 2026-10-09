package com.safecity.dto;

import com.safecity.entity.VolunteerTaskStatus;

public class ReviewVolunteerTaskRequestDTO {

    private VolunteerTaskStatus status;
    private String notes;

    public ReviewVolunteerTaskRequestDTO() {
    }

    public ReviewVolunteerTaskRequestDTO(VolunteerTaskStatus status, String notes) {
        this.status = status;
        this.notes = notes;
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
}
