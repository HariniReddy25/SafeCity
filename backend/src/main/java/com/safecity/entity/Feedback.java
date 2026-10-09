package com.safecity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_feedbacks", indexes = {
    @Index(name = "idx_feedback_user_id", columnList = "user_id")
})
public class Feedback extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "rating", nullable = false)
    private int rating;

    @Column(name = "category")
    private String category;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    public Feedback() {}

    public Feedback(User user, int rating, String category, String comment) {
        this.user = user;
        this.rating = rating;
        this.category = category;
        this.comment = comment;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
}
