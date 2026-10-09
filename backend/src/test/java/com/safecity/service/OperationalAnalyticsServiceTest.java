package com.safecity.service;

import com.safecity.dto.OperationalAnalyticsDTO;
import com.safecity.entity.*;
import com.safecity.repository.*;
import com.safecity.service.impl.OperationalAnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OperationalAnalyticsServiceTest {

    @Mock
    private EmergencyReportRepository emergencyReportRepository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private MasterIncidentRepository masterIncidentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OperationalAnalyticsServiceImpl analyticsService;

    private User testCitizen;
    private User testResponder1;
    private User testResponder2;
    private EmergencyReport report1;
    private EmergencyReport report2;
    private EmergencyReport report3;
    private StatusHistory history1;
    private StatusHistory history2;
    private StatusHistory history3;
    private Resource resource1;
    private Resource resource2;
    private MasterIncident masterIncident;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Citizen Jane", "jane@test.com", "+15551111", "pass", Role.CITIZEN);
        testCitizen.setId(1L);

        testResponder1 = new User("Responder Bob", "bob@test.com", "+15552222", "pass", Role.RESPONDER);
        testResponder1.setId(2L);
        testResponder1.setEnabled(true);

        testResponder2 = new User("Responder Alice", "alice@test.com", "+15553333", "pass", Role.RESPONDER);
        testResponder2.setId(3L);
        testResponder2.setEnabled(false);

        LocalDateTime now = LocalDateTime.now();

        // Report 1: FIRE, HIGH priority, assigned to Bob, RESOLVED
        report1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE, "Fire building",
                ReportPriority.HIGH, 12.9716, 77.5946, "M.G. Road", now.minusHours(3), null);
        report1.setId(10L);
        report1.setStatus(ReportStatus.RESOLVED);
        report1.setAssignedResponder(testResponder1);

        // Report 2: MEDICAL, CRITICAL priority, escalated, assigned to Bob, IN_PROGRESS
        report2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.MEDICAL_EMERGENCY, "Heart attack",
                ReportPriority.CRITICAL, 12.9800, 77.6000, "Indiranagar", now.minusHours(2), null);
        report2.setId(20L);
        report2.setStatus(ReportStatus.IN_PROGRESS);
        report2.setAssignedResponder(testResponder1);
        report2.setEscalatedAt(now.minusMinutes(45));

        // Report 3: ROAD_ACCIDENT, MEDIUM priority, linked to master incident, SUBMITTED
        masterIncident = new MasterIncident("MI-001", "Abids Collision", IncidentCategory.ROAD_ACCIDENT, ReportPriority.MEDIUM, 12.9500, 77.5800, "Abids");
        masterIncident.setId(100L);

        report3 = new EmergencyReport("SC-003", testCitizen, IncidentCategory.ROAD_ACCIDENT, "Car crash",
                ReportPriority.MEDIUM, 12.9500, 77.5800, "Abids", now.minusMinutes(30), null);
        report3.setId(30L);
        report3.setStatus(ReportStatus.SUBMITTED);
        report3.setMasterIncident(masterIncident);

        // Status History Entries
        history1 = new StatusHistory(report1, ReportStatus.SUBMITTED, ReportStatus.VERIFIED, testCitizen, "Verified fire");
        history1.setCreatedAt(now.minusHours(2).minusMinutes(50));

        history2 = new StatusHistory(report1, ReportStatus.VERIFIED, ReportStatus.ASSIGNED, testCitizen, "Assigned to Bob");
        history2.setCreatedAt(now.minusHours(2).minusMinutes(40));

        history3 = new StatusHistory(report1, ReportStatus.ASSIGNED, ReportStatus.RESOLVED, testResponder1, "Fire extinguished");
        history3.setCreatedAt(now.minusHours(1));

        // Resources
        resource1 = new Resource("AMB-01", "Ambulance 1", ResourceType.AMBULANCE, ResourceStatus.DISPATCHED, 12.9800, 77.6000, "Indiranagar Station");
        resource1.setId(201L);

        resource2 = new Resource("ENG-01", "Fire Engine 1", ResourceType.FIRE_ENGINE, ResourceStatus.AVAILABLE, 12.9716, 77.5946, "M.G. Road Station");
        resource2.setId(202L);
    }

    @Test
    @DisplayName("Empty Database Safety -> Returns 0.0 & 100% compliance without throwing exceptions")
    void testEmptyDatabaseSafety() {
        when(emergencyReportRepository.findAll()).thenReturn(Collections.emptyList());
        when(statusHistoryRepository.findAll()).thenReturn(Collections.emptyList());
        when(resourceRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.findByRole(Role.RESPONDER)).thenReturn(Collections.emptyList());
        when(masterIncidentRepository.count()).thenReturn(0L);

        OperationalAnalyticsDTO analytics = analyticsService.getOperationalAnalytics();

        assertNotNull(analytics);
        assertEquals(0L, analytics.getTotalIncidents());
        assertEquals(100.0, analytics.getSlaComplianceRate());
        assertEquals(0L, analytics.getTotalSlaBreachedIncidents());
        assertEquals(0.0, analytics.getAvgFirstResponseTimeMinutes());
        assertEquals(0.0, analytics.getAvgAssignmentTimeMinutes());
        assertEquals(0.0, analytics.getAvgResolutionTimeMinutes());
        assertEquals(0.0, analytics.getResourceUtilizationRate());
        assertEquals(0.0, analytics.getDeduplicationRatio());
        assertEquals(0.0, analytics.getEscalationRate());
        assertEquals(7, analytics.getDailyTrends().size());
    }

    @Test
    @DisplayName("Full Analytics Calculation -> Verify all metrics computed correctly")
    void testFullAnalyticsCalculation() {
        when(emergencyReportRepository.findAll()).thenReturn(Arrays.asList(report1, report2, report3));
        when(statusHistoryRepository.findAll()).thenReturn(Arrays.asList(history1, history2, history3));
        when(resourceRepository.findAll()).thenReturn(Arrays.asList(resource1, resource2));
        when(userRepository.findByRole(Role.RESPONDER)).thenReturn(Arrays.asList(testResponder1, testResponder2));
        when(masterIncidentRepository.count()).thenReturn(1L);

        OperationalAnalyticsDTO analytics = analyticsService.getOperationalAnalytics();

        assertNotNull(analytics);

        // 1. Incident Distribution
        assertEquals(3L, analytics.getTotalIncidents());
        assertEquals(1L, analytics.getCategoryCounts().get("FIRE"));
        assertEquals(1L, analytics.getCategoryCounts().get("MEDICAL_EMERGENCY"));
        assertEquals(1L, analytics.getCategoryCounts().get("ROAD_ACCIDENT"));
        assertEquals(33.3, analytics.getCategoryPercentages().get("FIRE"));
        assertEquals(1L, analytics.getPriorityCounts().get("CRITICAL"));

        // 2. SLA & Response Performance
        assertEquals(1L, analytics.getTotalSlaBreachedIncidents());
        assertEquals(66.7, analytics.getSlaComplianceRate());
        assertEquals(1L, analytics.getSlaBreachesByPriority().get("CRITICAL"));
        assertTrue(analytics.getAvgFirstResponseTimeMinutes() >= 0.0);
        assertTrue(analytics.getAvgAssignmentTimeMinutes() >= 0.0);
        assertTrue(analytics.getAvgResolutionTimeMinutes() >= 0.0);

        // 3. Resource Utilization
        assertEquals(2L, analytics.getTotalResources());
        assertEquals(1L, analytics.getAvailableResources());
        assertEquals(1L, analytics.getDispatchedResources());
        assertEquals(50.0, analytics.getResourceUtilizationRate());

        // 4. Responder Statistics
        assertEquals(2L, analytics.getTotalResponders());
        assertEquals(1L, analytics.getActiveResponders());
        assertEquals(1L, analytics.getInactiveResponders());
        assertEquals(1L, analytics.getTotalActiveAssignments()); // report2 is IN_PROGRESS & assigned to Bob
        assertEquals(0.5, analytics.getAvgActiveReportsPerResponder());
        assertEquals(2, analytics.getResponderStats().size());

        // 5. Duplicate Analytics
        assertEquals(3L, analytics.getTotalReports());
        assertEquals(1L, analytics.getTotalMasterIncidents());
        assertEquals(1L, analytics.getLinkedReports());
        assertEquals(2L, analytics.getStandaloneReports());
        assertEquals(33.3, analytics.getDeduplicationRatio());

        // 6. Escalation Analytics
        assertEquals(1L, analytics.getTotalEscalatedIncidents());
        assertEquals(33.3, analytics.getEscalationRate());
        assertEquals(1L, analytics.getEscalationsByPriority().get("CRITICAL"));

        // 7. Time Trends
        assertNotNull(analytics.getDailyTrends());
        assertEquals(7, analytics.getDailyTrends().size());
    }
}
