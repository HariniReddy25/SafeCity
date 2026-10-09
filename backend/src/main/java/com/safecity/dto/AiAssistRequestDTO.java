package com.safecity.dto;

import jakarta.validation.constraints.NotBlank;

public class AiAssistRequestDTO {

    @NotBlank(message = "Report description cannot be blank")
    private String description;

    private String city;

    public AiAssistRequestDTO() {}

    public AiAssistRequestDTO(String description, String city) {
        this.description = description;
        this.city = city;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
