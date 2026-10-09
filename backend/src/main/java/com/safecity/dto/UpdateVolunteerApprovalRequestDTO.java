package com.safecity.dto;

import com.safecity.entity.VolunteerApprovalStatus;

public class UpdateVolunteerApprovalRequestDTO {

    private VolunteerApprovalStatus approvalStatus;
    private String reason;

    public UpdateVolunteerApprovalRequestDTO() {
    }

    public UpdateVolunteerApprovalRequestDTO(VolunteerApprovalStatus approvalStatus, String reason) {
        this.approvalStatus = approvalStatus;
        this.reason = reason;
    }

    public VolunteerApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(VolunteerApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
