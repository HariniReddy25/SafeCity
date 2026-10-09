package com.safecity.service;

import com.safecity.dto.CreateResourceRequestDTO;
import com.safecity.dto.ResourceResponseDTO;
import com.safecity.entity.ResourceStatus;
import com.safecity.entity.ResourceType;

import java.util.List;

public interface ResourceService {

    ResourceResponseDTO createResource(CreateResourceRequestDTO request);

    List<ResourceResponseDTO> getAllResources(ResourceStatus status, ResourceType type);

    List<ResourceResponseDTO> getAvailableResources();

    List<ResourceResponseDTO> getResourcesForReport(Long reportId);

    ResourceResponseDTO dispatchResourceToReport(Long reportId, Long resourceId, Long operatorId);

    ResourceResponseDTO releaseResourceFromReport(Long reportId, Long resourceId);

    void autoReleaseResourcesForReport(Long reportId);

    void autoReleaseResourcesForMasterIncident(Long masterId);
}
