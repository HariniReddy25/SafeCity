package com.safecity.dto;

import jakarta.validation.constraints.NotNull;

public class AssignResponderRequestDTO {

    @NotNull(message = "Responder ID is required")
    private Long responderId;

    public AssignResponderRequestDTO() {
    }

    public AssignResponderRequestDTO(Long responderId) {
        this.responderId = responderId;
    }

    public Long getResponderId() {
        return responderId;
    }

    public void setResponderId(Long responderId) {
        this.responderId = responderId;
    }
}
