package com.safecity.service;

import com.safecity.dto.EmergencyIntelligenceResponseDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.MasterIncidentRepository;
import com.safecity.repository.ResourceRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.impl.EmergencyResponseIntelligenceServiceImpl;
import com.safecity.util.HaversineDistanceUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmergencyResponseIntelligenceServiceTest {

    @Mock
    private EmergencyReportRepository reportRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private MasterIncidentRepository masterIncidentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmergencyResponseIntelligenceServiceImpl intelligenceService;

    private User testCitizen;
    private User testResponder;
    private User testAdminUser;
    private EmergencyReport fireReport;
    private Resource fireEngine;
    private Resource ambulance;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Sarah Jenkins", "citizen@test.com", "+1-555-0101", "password", Role.CITIZEN);
        testCitizen.setId(1L);

        testResponder = new User("Captain Miller", "responder@test.com", "+1-555-0102", "password", Role.RESPONDER);
        testResponder.setId(2L);

        testAdminUser = new User("Chief Admin", "admin@test.com", "+1-555-0103", "password", Role.ADMIN);
        testAdminUser.setId(3L);

        fireReport = new EmergencyReport(
                "SC-2026-0001", testCitizen, IncidentCategory.FIRE, "Building fire",
                ReportPriority.HIGH, 17.3850, 78.4867, "Abids, Hyderabad", LocalDateTime.now().minusMinutes(5), null
        );
        fireReport.setId(100L);
        fireReport.setStatus(ReportStatus.VERIFIED);

        fireEngine = new Resource("ENG-01", "Fire Engine 1", ResourceType.FIRE_ENGINE, ResourceStatus.AVAILABLE,
                17.3900, 78.4800, "Central Station");
        fireEngine.setId(201L);

        ambulance = new Resource("AMB-01", "Ambulance 1", ResourceType.AMBULANCE, ResourceStatus.AVAILABLE,
                17.4000, 78.4900, "Medical Depot");
        ambulance.setId(202L);
    }

    @Test
    @DisplayName("Haversine Distance -> Valid coordinates return correct distance in km")
    void testHaversineDistance_ValidCoordinates() {
        Double dist = HaversineDistanceUtil.calculateDistanceKm(17.3850, 78.4867, 17.3616, 78.4747);
        assertNotNull(dist);
        assertEquals(2.9, dist, 0.2);
    }

    @Test
    @DisplayName("Haversine Distance -> Null/missing coordinates return null safely")
    void testHaversineDistance_NullCoordinates() {
        assertNull(HaversineDistanceUtil.calculateDistanceKm(null, 78.4867, 17.3616, 78.4747));
        assertNull(HaversineDistanceUtil.calculateDistanceKm(17.3850, null, 17.3616, 78.4747));
        assertNull(HaversineDistanceUtil.calculateDistanceKm(17.3850, 78.4867, null, 78.4747));
        assertNull(HaversineDistanceUtil.calculateDistanceKm(17.3850, 78.4867, 17.3616, null));
    }

    @Test
    @DisplayName("Severity Calculation -> Each Priority Level Base Score")
    void testSeverityCalculation_PriorityBaseScores() {
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        // HIGH priority (30) + FIRE category (10) = 40 (MODERATE)
        EmergencyIntelligenceResponseDTO dtoHigh = intelligenceService.getReportIntelligence(100L);
        assertEquals(40, dtoHigh.getSeverityScore());
        assertEquals("MODERATE", dtoHigh.getSeverityLevel());

        // CRITICAL priority (40) + FIRE category (10) = 50 (HIGH)
        fireReport.setPriority(ReportPriority.CRITICAL);
        EmergencyIntelligenceResponseDTO dtoCritical = intelligenceService.getReportIntelligence(100L);
        assertEquals(50, dtoCritical.getSeverityScore());
        assertEquals("HIGH", dtoCritical.getSeverityLevel());

        // LOW priority (10) + OTHER category (0) = 10 (ROUTINE)
        fireReport.setPriority(ReportPriority.LOW);
        fireReport.setCategory(IncidentCategory.OTHER);
        EmergencyIntelligenceResponseDTO dtoLow = intelligenceService.getReportIntelligence(100L);
        assertEquals(10, dtoLow.getSeverityScore());
        assertEquals("ROUTINE", dtoLow.getSeverityLevel());
    }

    @Test
    @DisplayName("Severity Calculation -> SLA Breached (+25 pts) elevates Severity to CRITICAL")
    void testSeverityCalculation_SlaBreached() {
        fireReport.setCreatedAt(LocalDateTime.now().minusMinutes(40));
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        // HIGH priority (30) + SLA Breached (+25) + FIRE category (+10) = 65 (CRITICAL)
        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertEquals("BREACHED", dto.getSlaStatus());
        assertEquals("CRITICAL", dto.getSeverityLevel());
        assertTrue(dto.getSeverityScore() >= 65);
        assertTrue(dto.getSeverityReasons().stream().anyMatch(r -> r.contains("SLA status BREACHED")));
    }

    @Test
    @DisplayName("Severity Calculation -> MasterIncident with >3 linked reports (+15 pts)")
    void testSeverityCalculation_MasterIncidentModifier() {
        MasterIncident master = new MasterIncident("MI-2026-0001", "Structure Fire Master", IncidentCategory.FIRE, ReportPriority.HIGH, 17.38, 78.48, "Abids");
        List<EmergencyReport> linkedReports = Arrays.asList(
                new EmergencyReport(), new EmergencyReport(), new EmergencyReport(), new EmergencyReport()
        );
        master.setReports(linkedReports);
        fireReport.setMasterIncident(master);

        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertTrue(dto.getSeverityReasons().stream().anyMatch(r -> r.contains("Linked to Master Incident MI-2026-0001")));
    }

    @Test
    @DisplayName("Resource Mapping -> FIRE maps to FIRE_ENGINE primary")
    void testResourceMapping_FireCategory() {
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertNotNull(dto.getRecommendedResourceTypes());
        assertFalse(dto.getRecommendedResourceTypes().isEmpty());
        assertEquals(ResourceType.FIRE_ENGINE, dto.getRecommendedResourceTypes().get(0));
    }

    @Test
    @DisplayName("Nearby Available Resources -> Sorted by distance ascending with recommendation flags")
    void testNearbyResources_SortingAndRecommendation() {
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Arrays.asList(ambulance, fireEngine));

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertEquals(2, dto.getNearbyAvailableResources().size());
        assertTrue(dto.getNearbyAvailableResources().stream().anyMatch(r -> r.getResourceCode().equals("ENG-01") && r.getIsRecommended()));
    }

    @Test
    @DisplayName("Responder Workload -> Correctly computed and reflected in DTO")
    void testResponderWorkload() {
        fireReport.setAssignedResponder(testResponder);
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(reportRepository.countActiveByAssignedResponderId(eq(2L), anyList())).thenReturn(2L);
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertTrue(dto.getIsResponderAssigned());
        assertEquals("Captain Miller", dto.getAssignedResponderName());
        assertEquals(2L, dto.getResponderActiveWorkload());
    }

    @Test
    @DisplayName("Readiness Score -> 0 - 100 range with full component breakdown")
    void testReadinessScore_CalculationAndBreakdown() {
        fireReport.setAssignedResponder(testResponder);
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(reportRepository.countActiveByAssignedResponderId(eq(2L), anyList())).thenReturn(1L);

        fireEngine.setStatus(ResourceStatus.DISPATCHED);
        fireEngine.setAssignedReport(fireReport);
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.singletonList(fireEngine));
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.singletonList(ambulance));

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertNotNull(dto.getReadinessScore());
        assertTrue(dto.getReadinessScore() >= 0 && dto.getReadinessScore() <= 100);

        Map<String, Integer> breakdown = dto.getReadinessScoreBreakdown();
        assertNotNull(breakdown);
        assertTrue(breakdown.containsKey("personnel"));
        assertTrue(breakdown.containsKey("dispatchedResources"));
        assertTrue(breakdown.containsKey("resourceAvailability"));
        assertTrue(breakdown.containsKey("sla"));
        assertEquals(25, breakdown.get("personnel"));
        assertEquals(35, breakdown.get("dispatchedResources"));
    }

    @Test
    @DisplayName("Explainable Recommendations -> Generates human-readable recommendation strings")
    void testExplainableRecommendations() {
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.singletonList(fireEngine));

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getReportIntelligence(100L);

        assertNotNull(dto.getActionRecommendations());
        assertFalse(dto.getActionRecommendations().isEmpty());
        assertTrue(dto.getActionRecommendations().stream().anyMatch(r -> r.contains("No primary first-responder assigned")));
        assertTrue(dto.getActionRecommendations().stream().anyMatch(r -> r.contains("Primary recommended resource type")));
    }

    @Test
    @DisplayName("Report Not Found -> Throws IllegalArgumentException")
    void testReportNotFound_ThrowsException() {
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            intelligenceService.getReportIntelligence(999L);
        });

        assertTrue(ex.getMessage().contains("not found"));
    }

    @Test
    @DisplayName("Responder Authorization Invariant -> Unassigned responder receives AccessDeniedException")
    void testResponderAuthorization_UnassignedThrowsAccessDenied() {
        User unassignedResponder = new User("Other Responder", "other@test.com", "+1-555-9999", "password", Role.RESPONDER);
        unassignedResponder.setId(9L);

        fireReport.setAssignedResponder(testResponder);

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(unassignedResponder));
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));

        assertThrows(AccessDeniedException.class, () -> {
            intelligenceService.getResponderEmergencyIntelligence("other@test.com", 100L);
        });
    }

    @Test
    @DisplayName("Responder Authorization Invariant -> Assigned responder or Admin allowed")
    void testResponderAuthorization_AssignedOrAdminAllowed() {
        fireReport.setAssignedResponder(testResponder);

        when(userRepository.findByEmail("responder@test.com")).thenReturn(Optional.of(testResponder));
        when(reportRepository.findById(100L)).thenReturn(Optional.of(fireReport));
        when(resourceRepository.findByAssignedReportId(100L)).thenReturn(Collections.emptyList());
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        EmergencyIntelligenceResponseDTO dto = intelligenceService.getResponderEmergencyIntelligence("responder@test.com", 100L);
        assertNotNull(dto);

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(testAdminUser));
        EmergencyIntelligenceResponseDTO dtoAdmin = intelligenceService.getResponderEmergencyIntelligence("admin@test.com", 100L);
        assertNotNull(dtoAdmin);
    }
}
