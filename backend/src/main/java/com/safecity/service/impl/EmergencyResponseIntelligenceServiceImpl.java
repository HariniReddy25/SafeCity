package com.safecity.service.impl;

import com.safecity.dto.EmergencyIntelligenceResponseDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.dto.NearbyResourceDTO;
import com.safecity.dto.ResourceResponseDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.MasterIncidentRepository;
import com.safecity.repository.ResourceRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.EmergencyResponseIntelligenceService;
import com.safecity.util.HaversineDistanceUtil;
import com.safecity.util.SlaCalculatorUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmergencyResponseIntelligenceServiceImpl implements EmergencyResponseIntelligenceService {

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private MasterIncidentRepository masterIncidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public EmergencyIntelligenceResponseDTO getReportIntelligence(Long reportId) {
        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        return buildIntelligenceDTO(report);
    }

    @Override
    @Transactional(readOnly = true)
    public EmergencyIntelligenceResponseDTO getResponderEmergencyIntelligence(String responderEmail, Long reportId) {
        User user = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new IllegalArgumentException("Responder user not found with email: " + responderEmail));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        // Enforce responder security authorization invariant
        if (user.getRole() != Role.ADMIN) {
            if (report.getAssignedResponder() == null || !report.getAssignedResponder().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You are not assigned to this emergency report.");
            }
        }

        return buildIntelligenceDTO(report);
    }

    private EmergencyIntelligenceResponseDTO buildIntelligenceDTO(EmergencyReport report) {
        EmergencyIntelligenceResponseDTO dto = new EmergencyIntelligenceResponseDTO();
        dto.setReportId(report.getId());
        dto.setReportCode(report.getReportId());
        dto.setCategory(report.getCategory());
        dto.setPriority(report.getPriority());

        // 1. SLA Calculations (Reusing SlaCalculatorUtil)
        EmergencyReportResponseDTO dummyReportDto = EmergencyReportResponseDTO.fromEntity(report);
        dto.setSlaStatus(dummyReportDto.getSlaStatus());
        dto.setElapsedMinutes(dummyReportDto.getElapsedMinutes());
        dto.setSlaMinutesRemaining(dummyReportDto.getSlaMinutesRemaining());
        dto.setIsEscalated(dummyReportDto.getIsEscalated());

        // 2. Master Incident Information
        int masterLinkedCount = 0;
        String masterCode = null;
        if (report.getMasterIncident() != null) {
            MasterIncident master = report.getMasterIncident();
            masterCode = master.getMasterCode();
            if (master.getReports() != null) {
                masterLinkedCount = master.getReports().size();
            }
        }

        // 3. Severity Analysis
        calculateSeverityAnalysis(report, dto, masterLinkedCount, masterCode);

        // 4. Recommended Resource Types Mapping
        List<ResourceType> recommendedTypes = getRecommendedResourceTypes(report.getCategory());
        dto.setRecommendedResourceTypes(recommendedTypes);
        ResourceType primaryType = recommendedTypes.isEmpty() ? null : recommendedTypes.get(0);

        // 5. Currently Dispatched Resources
        List<Resource> dispatchedEntities = resourceRepository.findByAssignedReportId(report.getId());
        List<ResourceResponseDTO> dispatchedDTOs = dispatchedEntities.stream()
                .map(ResourceResponseDTO::fromEntity)
                .collect(Collectors.toList());
        dto.setCurrentlyDispatchedResources(dispatchedDTOs);

        boolean primaryDispatched = false;
        if (primaryType != null) {
            primaryDispatched = dispatchedEntities.stream().anyMatch(r -> r.getType() == primaryType);
        }
        dto.setPrimaryResourceDispatched(primaryDispatched);

        // 6. Nearby Available Resources & Proximity (Haversine)
        List<NearbyResourceDTO> nearbyResources = calculateNearbyAvailableResources(report, recommendedTypes);
        dto.setNearbyAvailableResources(nearbyResources);

        // 7. Personnel Workload Analysis
        if (report.getAssignedResponder() != null) {
            User responder = report.getAssignedResponder();
            dto.setIsResponderAssigned(true);
            dto.setAssignedResponderName(responder.getFullName());
            long activeWorkload = reportRepository.countActiveByAssignedResponderId(
                    responder.getId(),
                    Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED)
            );
            dto.setResponderActiveWorkload(activeWorkload);
        } else {
            dto.setIsResponderAssigned(false);
            dto.setAssignedResponderName(null);
            dto.setResponderActiveWorkload(0L);
        }

        // 8. Operational Readiness Score (0 - 100)
        calculateReadinessScore(dto, primaryType, dispatchedEntities.size(), nearbyResources);

        // 9. Explainable Recommendations Generation
        generateActionRecommendations(report, dto, primaryType, masterCode, masterLinkedCount, nearbyResources);

        return dto;
    }

    private void calculateSeverityAnalysis(EmergencyReport report, EmergencyIntelligenceResponseDTO dto, int masterLinkedCount, String masterCode) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        // Base priority modifier
        ReportPriority priority = report.getPriority();
        int baseScore = 10;
        if (priority == ReportPriority.CRITICAL) {
            baseScore = 40;
        } else if (priority == ReportPriority.HIGH) {
            baseScore = 30;
        } else if (priority == ReportPriority.MEDIUM) {
            baseScore = 20;
        } else if (priority == ReportPriority.LOW) {
            baseScore = 10;
        }
        score += baseScore;
        reasons.add("Base priority level " + (priority != null ? priority.name() : "LOW") + " (+" + baseScore + " pts)");

        // SLA Modifier
        String slaStatus = dto.getSlaStatus();
        if ("BREACHED".equals(slaStatus)) {
            score += 25;
            reasons.add("SLA status BREACHED (+25 pts)");
        } else if ("WARNING".equals(slaStatus)) {
            score += 15;
            reasons.add("SLA status WARNING (+15 pts)");
        }

        // Master Incident Cluster Modifier
        if (masterLinkedCount > 3) {
            score += 15;
            reasons.add("Linked to Master Incident " + masterCode + " with " + masterLinkedCount + " reports (+15 pts)");
        }

        // Category Intrinsic Risk Modifier
        IncidentCategory category = report.getCategory();
        if (category == IncidentCategory.FIRE ||
            category == IncidentCategory.PUBLIC_SAFETY_HAZARD ||
            category == IncidentCategory.NATURAL_DISASTER) {
            score += 10;
            reasons.add("High intrinsic risk category " + (category != null ? category.getDisplayName() : "") + " (+10 pts)");
        }

        dto.setSeverityScore(score);
        dto.setSeverityReasons(reasons);

        // Severity Level boundaries
        if (score >= 65) {
            dto.setSeverityLevel("CRITICAL");
        } else if (score >= 45) {
            dto.setSeverityLevel("HIGH");
        } else if (score >= 25) {
            dto.setSeverityLevel("MODERATE");
        } else {
            dto.setSeverityLevel("ROUTINE");
        }
    }

    private List<ResourceType> getRecommendedResourceTypes(IncidentCategory category) {
        if (category == null) {
            return Arrays.asList(ResourceType.RESCUE_SQUAD, ResourceType.POLICE_PATROL);
        }
        switch (category) {
            case FIRE:
                return Arrays.asList(ResourceType.FIRE_ENGINE, ResourceType.AMBULANCE, ResourceType.RESCUE_SQUAD);
            case MEDICAL_EMERGENCY:
                return Arrays.asList(ResourceType.AMBULANCE, ResourceType.RESCUE_SQUAD);
            case ROAD_ACCIDENT:
                return Arrays.asList(ResourceType.AMBULANCE, ResourceType.POLICE_PATROL);
            case CRIME:
            case HARASSMENT:
                return Arrays.asList(ResourceType.POLICE_PATROL, ResourceType.RESCUE_SQUAD);
            case SUSPICIOUS_ACTIVITY:
                return Collections.singletonList(ResourceType.POLICE_PATROL);
            case PUBLIC_SAFETY_HAZARD:
                return Arrays.asList(ResourceType.HAZMAT_UNIT, ResourceType.RESCUE_SQUAD);
            case NATURAL_DISASTER:
                return Arrays.asList(ResourceType.RESCUE_SQUAD, ResourceType.AMBULANCE, ResourceType.FIRE_ENGINE);
            case MISSING_PERSON:
            case OTHER:
            default:
                return Arrays.asList(ResourceType.RESCUE_SQUAD, ResourceType.POLICE_PATROL);
        }
    }

    private List<NearbyResourceDTO> calculateNearbyAvailableResources(EmergencyReport report, List<ResourceType> recommendedTypes) {
        List<Resource> availableFleet = resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE);
        List<NearbyResourceDTO> nearbyList = new ArrayList<>();

        Double repLat = report.getLatitude();
        Double repLon = report.getLongitude();

        for (Resource res : availableFleet) {
            Double distance = HaversineDistanceUtil.calculateDistanceKm(repLat, repLon, res.getLatitude(), res.getLongitude());
            boolean isRecommended = recommendedTypes.contains(res.getType());
            nearbyList.add(NearbyResourceDTO.fromResource(res, distance, isRecommended));
        }

        // Sort by distance ascending (handling null distances by sorting them last)
        nearbyList.sort(Comparator.comparing(NearbyResourceDTO::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder())));

        return nearbyList;
    }

    private void calculateReadinessScore(EmergencyIntelligenceResponseDTO dto, ResourceType primaryType, int dispatchedCount, List<NearbyResourceDTO> nearbyResources) {
        Map<String, Integer> breakdown = new HashMap<>();

        // 1. Personnel Component (max 25 pts)
        int personnelPts = 0;
        if (Boolean.TRUE.equals(dto.getIsResponderAssigned())) {
            Long workload = dto.getResponderActiveWorkload();
            if (workload != null && workload < 3) {
                personnelPts = 25;
            } else {
                personnelPts = 15;
            }
        }
        breakdown.put("personnel", personnelPts);

        // 2. Dispatched Resources Component (max 35 pts)
        int dispatchPts = 0;
        if (Boolean.TRUE.equals(dto.getPrimaryResourceDispatched())) {
            dispatchPts = 35;
        } else if (dispatchedCount > 0) {
            dispatchPts = 20;
        }
        breakdown.put("dispatchedResources", dispatchPts);

        // 3. Resource Availability & Proximity Component (max 20 pts)
        int availabilityPts = 0;
        Optional<NearbyResourceDTO> closestRecommended = nearbyResources.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsRecommended()))
                .findFirst();

        if (closestRecommended.isPresent()) {
            Double dist = closestRecommended.get().getDistanceKm();
            if (dist != null) {
                if (dist < 5.0) {
                    availabilityPts = 20;
                } else if (dist <= 15.0) {
                    availabilityPts = 10;
                }
            } else {
                // Distance cannot be calculated due to missing report coordinates, but unit is available
                availabilityPts = 10;
            }
        }
        breakdown.put("resourceAvailability", availabilityPts);

        // 4. SLA Component (max 20 pts)
        int slaPts = 0;
        String slaStatus = dto.getSlaStatus();
        if ("NORMAL".equals(slaStatus) || "STOPPED".equals(slaStatus)) {
            slaPts = 20;
        } else if ("WARNING".equals(slaStatus)) {
            slaPts = 10;
        } else if ("BREACHED".equals(slaStatus)) {
            slaPts = 0;
        }
        breakdown.put("sla", slaPts);

        int totalReadiness = personnelPts + dispatchPts + availabilityPts + slaPts;
        dto.setReadinessScore(Math.min(100, Math.max(0, totalReadiness)));
        dto.setReadinessScoreBreakdown(breakdown);
    }

    private void generateActionRecommendations(EmergencyReport report, EmergencyIntelligenceResponseDTO dto, ResourceType primaryType,
                                                String masterCode, int masterLinkedCount, List<NearbyResourceDTO> nearbyResources) {
        List<String> recs = new ArrayList<>();

        // Personnel checks
        if (!Boolean.TRUE.equals(dto.getIsResponderAssigned())) {
            recs.add("No primary first-responder assigned to this emergency report.");
        } else if (dto.getResponderActiveWorkload() != null && dto.getResponderActiveWorkload() >= 3) {
            recs.add("Assigned responder (" + dto.getAssignedResponderName() + ") has a heavy workload (" + dto.getResponderActiveWorkload() + " active incidents).");
        }

        // SLA checks
        if ("WARNING".equals(dto.getSlaStatus())) {
            recs.add("SLA timer is in WARNING state (" + dto.getSlaMinutesRemaining() + " minutes remaining).");
        } else if ("BREACHED".equals(dto.getSlaStatus())) {
            recs.add("SLA timer is BREACHED. Immediate operational escalation advised.");
        }

        // Primary Resource checks
        if (primaryType != null && !Boolean.TRUE.equals(dto.getPrimaryResourceDispatched())) {
            recs.add("Primary recommended resource type (" + primaryType.getDisplayName() + ") is not currently dispatched.");
        }

        // Nearby Resource availability check
        Optional<NearbyResourceDTO> closestRecommended = nearbyResources.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsRecommended()))
                .findFirst();

        if (closestRecommended.isPresent()) {
            NearbyResourceDTO nearest = closestRecommended.get();
            if (nearest.getDistanceKm() != null) {
                recs.add("Recommended unit (" + nearest.getResourceCode() + " - " + nearest.getName() + ") is available " + nearest.getDistanceKm() + " km away at " + (nearest.getStationLocation() != null ? nearest.getStationLocation() : "station") + ".");
            } else {
                recs.add("Recommended unit (" + nearest.getResourceCode() + " - " + nearest.getName() + ") is available in inventory roster.");
            }
        } else {
            recs.add("No recommended resource types are currently available in fleet inventory roster.");
        }

        // Master Incident check
        if (masterCode != null) {
            recs.add("Emergency is linked to Master Incident " + masterCode + " with " + masterLinkedCount + " clustered reports.");
        }

        dto.setActionRecommendations(recs);
    }
}
