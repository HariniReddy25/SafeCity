package com.safecity.dto;

public class ResourceDispatchRequestDTO {

    private Long operatorId;

    public ResourceDispatchRequestDTO() {
    }

    public ResourceDispatchRequestDTO(Long operatorId) {
        this.operatorId = operatorId;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }
}
