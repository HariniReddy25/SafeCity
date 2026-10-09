package com.safecity.dto;

import jakarta.validation.constraints.NotBlank;

public class AiChatRequestDTO {

    @NotBlank(message = "Message cannot be blank")
    private String message;

    private String city;

    public AiChatRequestDTO() {}

    public AiChatRequestDTO(String message, String city) {
        this.message = message;
        this.city = city;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
