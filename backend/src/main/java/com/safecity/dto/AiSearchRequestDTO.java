package com.safecity.dto;

import jakarta.validation.constraints.NotBlank;

public class AiSearchRequestDTO {

    @NotBlank(message = "Search query cannot be blank")
    private String query;

    public AiSearchRequestDTO() {}

    public AiSearchRequestDTO(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
