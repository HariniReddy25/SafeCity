package com.safecity.dto;

import com.safecity.entity.Notification;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;
    private String title;
    private String message;
    private String type;
    private String relatedReportId;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationDTO() {}

    public NotificationDTO(Long id, String title, String message, String type, String relatedReportId, boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedReportId = relatedReportId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationDTO fromEntity(Notification entity) {
        if (entity == null) return null;
        return new NotificationDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.getRelatedReportId(),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRelatedReportId() {
        return relatedReportId;
    }

    public void setRelatedReportId(String relatedReportId) {
        this.relatedReportId = relatedReportId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
