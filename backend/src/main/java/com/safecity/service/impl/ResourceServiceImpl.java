package com.safecity.service.impl;

import com.safecity.dto.CreateResourceRequestDTO;
import com.safecity.dto.ResourceResponseDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.MasterIncidentRepository;
import com.safecity.repository.ResourceRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.NotificationService;
import com.safecity.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceServiceImpl implements ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private MasterIncidentRepository masterIncidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public ResourceResponseDTO createResource(CreateResourceRequestDTO request) {
        if (request.getResourceCode() == null || request.getResourceCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Resource code is required.");
        }

        String code = request.getResourceCode().trim().toUpperCase();
        if (resourceRepository.findByResourceCode(code).isPresent()) {
            throw new IllegalArgumentException("Resource code already registered: " + code);
        }

        User operator = null;
        if (request.getOperatorId() != null) {
            operator = userRepository.findById(request.getOperatorId())
                    .orElseThrow(() -> new IllegalArgumentException("Operator user not found with ID: " + request.getOperatorId()));
            if (operator.getRole() != Role.RESPONDER) {
                throw new IllegalArgumentException("Invalid operator: User is not a RESPONDER.");
            }
        }

        Resource resource = new Resource(
                code,
                request.getName().trim(),
                request.getType(),
                ResourceStatus.AVAILABLE,
                request.getLatitude(),
                request.getLongitude(),
                request.getStationLocation() != null ? request.getStationLocation().trim() : null
        );

        if (operator != null) {
            resource.setAssignedOperator(operator);
        }

        Resource saved = resourceRepository.save(resource);
        return ResourceResponseDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAllResources(ResourceStatus status, ResourceType type) {
        List<Resource> resources;
        if (status != null && type != null) {
            resources = resourceRepository.findByStatusAndTypeOrderByCreatedAtDesc(status, type);
        } else if (status != null) {
            resources = resourceRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (type != null) {
            resources = resourceRepository.findByTypeOrderByCreatedAtDesc(type);
        } else {
            resources = resourceRepository.findAllByOrderByCreatedAtDesc();
        }

        return resources.stream().map(ResourceResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAvailableResources() {
        List<Resource> resources = resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE);
        return resources.stream().map(ResourceResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getResourcesForReport(Long reportId) {
        List<Resource> resources = resourceRepository.findByAssignedReportId(reportId);
        return resources.stream().map(ResourceResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDTO dispatchResourceToReport(Long reportId, Long resourceId, Long operatorId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + resourceId));

        if (resource.getStatus() != ResourceStatus.AVAILABLE) {
            throw new IllegalStateException("Resource is not available for dispatch. Current status: " + resource.getStatus());
        }

        if (resource.getAssignedReport() != null || resource.getAssignedMasterIncident() != null) {
            throw new IllegalStateException("Resource is already assigned to another active incident.");
        }

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.CLOSED) {
            throw new IllegalStateException("Cannot dispatch resources to a RESOLVED or CLOSED emergency report.");
        }

        User operator = null;
        if (operatorId != null) {
            operator = userRepository.findById(operatorId)
                    .orElseThrow(() -> new IllegalArgumentException("Operator user not found with ID: " + operatorId));
            if (operator.getRole() != Role.RESPONDER) {
                throw new IllegalArgumentException("Invalid operator: Target user must be a RESPONDER.");
            }
        } else if (resource.getAssignedOperator() != null) {
            operator = resource.getAssignedOperator();
        }

        // Apply Assignment Invariant: assign report, clear master incident
        resource.setStatus(ResourceStatus.DISPATCHED);
        resource.setAssignedMasterIncident(null);
        resource.setAssignedReport(report);
        if (operator != null) {
            resource.setAssignedOperator(operator);
        }

        Resource savedResource = resourceRepository.save(resource);

        // Audit Trail: StatusHistory Log
        String reasonNote = "Emergency Resource [" + savedResource.getResourceCode() + "] " + savedResource.getName() + " dispatched to report " + report.getReportId() + ".";
        StatusHistory history = new StatusHistory(report, report.getStatus(), report.getStatus(), null, reasonNote);
        statusHistoryRepository.save(history);

        // Notifications
        if (operator != null) {
            notificationService.createNotification(
                    operator,
                    "Resource Dispatched",
                    "Your unit resource [" + savedResource.getResourceCode() + "] has been dispatched to report " + report.getReportId() + ".",
                    "RESOURCE_DISPATCH",
                    report.getReportId()
            );
        }

        notificationService.notifyAdminsAndResponders(
                "🚨 RESOURCE DISPATCHED",
                "Resource [" + savedResource.getResourceCode() + "] (" + savedResource.getName() + ") dispatched to report " + report.getReportId() + ".",
                "RESOURCE_DISPATCH",
                report.getReportId()
        );

        return ResourceResponseDTO.fromEntity(savedResource);
    }

    @Override
    public ResourceResponseDTO releaseResourceFromReport(Long reportId, Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + resourceId));

        if (resource.getStatus() != ResourceStatus.DISPATCHED) {
            throw new IllegalStateException("Resource is not currently dispatched.");
        }

        if (resource.getAssignedReport() == null || !resource.getAssignedReport().getId().equals(reportId)) {
            throw new IllegalArgumentException("Resource is not assigned to emergency report ID: " + reportId);
        }

        EmergencyReport report = resource.getAssignedReport();

        // Release resource
        resource.setStatus(ResourceStatus.AVAILABLE);
        resource.clearAssignment();

        Resource savedResource = resourceRepository.save(resource);

        // Audit Trail: StatusHistory Log
        String reasonNote = "Emergency Resource [" + savedResource.getResourceCode() + "] " + savedResource.getName() + " released from report " + report.getReportId() + ".";
        StatusHistory history = new StatusHistory(report, report.getStatus(), report.getStatus(), null, reasonNote);
        statusHistoryRepository.save(history);

        // Notifications
        notificationService.notifyAdminsAndResponders(
                "RESOURCE RELEASED",
                "Resource [" + savedResource.getResourceCode() + "] released from report " + report.getReportId() + " and returned to AVAILABLE status.",
                "RESOURCE_RELEASE",
                report.getReportId()
        );

        return ResourceResponseDTO.fromEntity(savedResource);
    }

    @Override
    public void autoReleaseResourcesForReport(Long reportId) {
        List<Resource> assignedResources = resourceRepository.findByAssignedReportId(reportId);
        for (Resource resource : assignedResources) {
            resource.setStatus(ResourceStatus.AVAILABLE);
            resource.clearAssignment();
            resourceRepository.save(resource);
        }
    }

    @Override
    public void autoReleaseResourcesForMasterIncident(Long masterId) {
        List<Resource> assignedResources = resourceRepository.findByAssignedMasterIncidentId(masterId);
        for (Resource resource : assignedResources) {
            resource.setStatus(ResourceStatus.AVAILABLE);
            resource.clearAssignment();
            resourceRepository.save(resource);
        }
    }
}
