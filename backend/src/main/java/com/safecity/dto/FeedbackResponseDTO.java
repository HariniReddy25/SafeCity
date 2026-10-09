package com.safecity.dto;

import com.safecity.entity.Feedback;

import java.time.LocalDateTime;

public class FeedbackResponseDTO {

    private Long id;
    private int rating;
    private String category;
    private String comment;
    private String userName;
    private LocalDateTime createdAt;

    public FeedbackResponseDTO() {}

    public FeedbackResponseDTO(Long id, int rating, String category, String comment, String userName, LocalDateTime createdAt) {
        this.id = id;
        this.rating = rating;
        this.category = category;
        this.comment = comment;
        this.userName = userName;
        this.createdAt = createdAt;
    }

    public static FeedbackResponseDTO fromEntity(Feedback entity) {
        if (entity == null) return null;
        String name = entity.getUser() != null ? entity.getUser().getFullName() : "Anonymous Citizen";
        return new FeedbackResponseDTO(
                entity.getId(),
                entity.getRating(),
                entity.getCategory(),
                entity.getComment(),
                name,
                entity.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
