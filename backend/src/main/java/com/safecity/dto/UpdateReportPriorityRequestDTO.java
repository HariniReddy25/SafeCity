package com.safecity.dto;

import com.safecity.entity.ReportPriority;
import jakarta.validation.constraints.NotNull;

public class UpdateReportPriorityRequestDTO {

    @NotNull(message = "Report priority is required")
    private ReportPriority priority;

    public UpdateReportPriorityRequestDTO() {
    }

    public UpdateReportPriorityRequestDTO(ReportPriority priority) {
        this.priority = priority;
    }

    public ReportPriority getPriority() {
        return priority;
    }

    public void setPriority(ReportPriority priority) {
        this.priority = priority;
    }
}
