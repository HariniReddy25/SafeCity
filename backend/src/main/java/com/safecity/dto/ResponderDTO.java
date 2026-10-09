package com.safecity.dto;

import com.safecity.entity.User;

public class ResponderDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private boolean enabled;
    private long activeAssignmentsCount;
    private long totalAssignmentsCount;
    private long completedAssignmentsCount;

    public ResponderDTO() {
    }

    public ResponderDTO(Long id, String fullName, String email, String phoneNumber, boolean enabled,
                        long activeAssignmentsCount, long totalAssignmentsCount, long completedAssignmentsCount) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.enabled = enabled;
        this.activeAssignmentsCount = activeAssignmentsCount;
        this.totalAssignmentsCount = totalAssignmentsCount;
        this.completedAssignmentsCount = completedAssignmentsCount;
    }

    public static ResponderDTO fromUser(User user, long active, long total, long completed) {
        if (user == null) return null;
        ResponderDTO dto = new ResponderDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEnabled(user.isEnabled());
        dto.setActiveAssignmentsCount(active);
        dto.setTotalAssignmentsCount(total);
        dto.setCompletedAssignmentsCount(completed);
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public long getActiveAssignmentsCount() {
        return activeAssignmentsCount;
    }

    public void setActiveAssignmentsCount(long activeAssignmentsCount) {
        this.activeAssignmentsCount = activeAssignmentsCount;
    }

    public long getTotalAssignmentsCount() {
        return totalAssignmentsCount;
    }

    public void setTotalAssignmentsCount(long totalAssignmentsCount) {
        this.totalAssignmentsCount = totalAssignmentsCount;
    }

    public long getCompletedAssignmentsCount() {
        return completedAssignmentsCount;
    }

    public void setCompletedAssignmentsCount(long completedAssignmentsCount) {
        this.completedAssignmentsCount = completedAssignmentsCount;
    }
}
