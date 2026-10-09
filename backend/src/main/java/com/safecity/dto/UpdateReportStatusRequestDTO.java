package com.safecity.dto;

import com.safecity.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateReportStatusRequestDTO {

    @NotNull(message = "Report status is required")
    private ReportStatus status;

    public UpdateReportStatusRequestDTO() {
    }

    public UpdateReportStatusRequestDTO(ReportStatus status) {
        this.status = status;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }
}
