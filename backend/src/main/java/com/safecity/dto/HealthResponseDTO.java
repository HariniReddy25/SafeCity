package com.safecity.dto;

import java.time.LocalDateTime;

public class HealthResponseDTO {

    private String status;
    private String message;
    private String database;
    private LocalDateTime timestamp;
    private String version;

    public HealthResponseDTO() {
    }

    public HealthResponseDTO(String status, String message, String database, LocalDateTime timestamp, String version) {
        this.status = status;
        this.message = message;
        this.database = database;
        this.timestamp = timestamp;
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
