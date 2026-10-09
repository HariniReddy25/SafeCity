package com.safecity.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateResponseNoteRequestDTO {

    @NotBlank(message = "Note text is required")
    private String noteText;

    public CreateResponseNoteRequestDTO() {
    }

    public CreateResponseNoteRequestDTO(String noteText) {
        this.noteText = noteText;
    }

    public String getNoteText() {
        return noteText;
    }

    public void setNoteText(String noteText) {
        this.noteText = noteText;
    }
}
