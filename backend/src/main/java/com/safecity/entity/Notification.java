package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user_id", columnList = "user_id"),
    @Index(name = "idx_notification_is_read", columnList = "is_read")
})
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "related_report_id")
    private String relatedReportId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    public Notification() {}

    public Notification(User user, String title, String message, String type, String relatedReportId) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedReportId = relatedReportId;
        this.isRead = false;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
