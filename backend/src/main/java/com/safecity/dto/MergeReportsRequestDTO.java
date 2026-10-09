package com.safecity.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MergeReportsRequestDTO {

    @NotNull(message = "Master report ID is required")
    private Long masterReportId;

    @NotEmpty(message = "Duplicate report IDs list cannot be empty")
    private List<Long> duplicateReportIds;

    public MergeReportsRequestDTO() {
    }

    public MergeReportsRequestDTO(Long masterReportId, List<Long> duplicateReportIds) {
        this.masterReportId = masterReportId;
        this.duplicateReportIds = duplicateReportIds;
    }

    public Long getMasterReportId() {
        return masterReportId;
    }

    public void setMasterReportId(Long masterReportId) {
        this.masterReportId = masterReportId;
    }

    public List<Long> getDuplicateReportIds() {
        return duplicateReportIds;
    }

    public void setDuplicateReportIds(List<Long> duplicateReportIds) {
        this.duplicateReportIds = duplicateReportIds;
    }
}
