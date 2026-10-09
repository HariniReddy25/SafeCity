package com.safecity.service;

import com.safecity.dto.DuplicateCandidatePairDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.service.impl.DuplicateDetectionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DuplicateDetectionServiceTest {

    @Mock
    private EmergencyReportRepository reportRepository;

    @InjectMocks
    private DuplicateDetectionServiceImpl detectionService;

    private User testCitizen;
    private LocalDateTime baseTime;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Test Citizen", "citizen@test.com", "+1-555-0000", "pass", Role.CITIZEN);
        testCitizen.setId(1L);
        baseTime = LocalDateTime.of(2026, 9, 26, 12, 0, 0);
    }

    @Test
    @DisplayName("CASE 1: Same category + within 500m + within 30 minutes -> POTENTIAL DUPLICATE")
    void testCase1_PotentialDuplicate() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE,
                "Fire at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r1.setId(101L);

        // ~150 meters away from r1, 10 minutes later
        EmergencyReport r2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.FIRE,
                "Smoke at Abids", ReportPriority.HIGH, 17.3860, 78.4870, "Abids North", baseTime.plusMinutes(10), null);
        r2.setId(102L);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Arrays.asList(r1, r2));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertEquals(1, candidates.size(), "Should identify 1 candidate pair");
        DuplicateCandidatePairDTO pair = candidates.get(0);
        assertEquals(101L, pair.getReportA().getId());
        assertEquals(102L, pair.getReportB().getId());
        assertTrue(pair.getDistanceMeters() <= 500.0, "Distance should be within 500m");
        assertEquals(10, pair.getTimeDifferenceMinutes(), "Time difference should be 10 mins");
    }

    @Test
    @DisplayName("CASE 2: Same category + more than 500m apart -> NOT DUPLICATE")
    void testCase2_FarDistance_NotDuplicate() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE,
                "Fire at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r1.setId(101L);

        // ~2.5 km away in Himayatnagar
        EmergencyReport r2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.FIRE,
                "Fire at Himayatnagar", ReportPriority.HIGH, 17.3980, 78.4750, "Himayatnagar", baseTime.plusMinutes(5), null);
        r2.setId(102L);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Arrays.asList(r1, r2));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertTrue(candidates.isEmpty(), "Should NOT flag reports > 500m apart as duplicates");
    }

    @Test
    @DisplayName("CASE 3: Same category + more than 30 minutes apart -> NOT DUPLICATE")
    void testCase3_TimeDifferenceTooLarge_NotDuplicate() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE,
                "Fire at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r1.setId(101L);

        // Same location, 45 minutes later
        EmergencyReport r2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.FIRE,
                "Smoke at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime.plusMinutes(45), null);
        r2.setId(102L);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Arrays.asList(r1, r2));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertTrue(candidates.isEmpty(), "Should NOT flag reports > 30 mins apart as duplicates");
    }

    @Test
    @DisplayName("CASE 4: Different categories -> NOT DUPLICATE")
    void testCase4_DifferentCategories_NotDuplicate() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE,
                "Fire at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r1.setId(101L);

        // Same location, same time, but ROAD_ACCIDENT instead of FIRE
        EmergencyReport r2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.ROAD_ACCIDENT,
                "Car Crash at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r2.setId(102L);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Arrays.asList(r1, r2));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertTrue(candidates.isEmpty(), "Should NOT flag different categories as duplicates");
    }

    @Test
    @DisplayName("CASE 5: Missing coordinates -> NOT DUPLICATE")
    void testCase5_MissingCoordinates_NotDuplicate() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE,
                "Fire at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r1.setId(101L);

        EmergencyReport r2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.FIRE,
                "Fire report without coords", ReportPriority.HIGH, null, null, "Abids", baseTime, null);
        r2.setId(102L);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Collections.singletonList(r1));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertTrue(candidates.isEmpty(), "Missing coordinates reports should be excluded");
    }

    @Test
    @DisplayName("CASE 6: Same report -> NEVER DUPLICATE ITSELF")
    void testCase6_SameReport_NeverDuplicatesItself() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.FIRE,
                "Fire at Abids", ReportPriority.HIGH, 17.3850, 78.4867, "Abids", baseTime, null);
        r1.setId(101L);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Collections.singletonList(r1));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertTrue(candidates.isEmpty(), "Single report should never be flagged as duplicate of itself");
    }

    @Test
    @DisplayName("CASE 7: Existing reports with master_incident_id = NULL -> continue working normally")
    void testCase7_NullMasterIncident_WorksNormally() {
        EmergencyReport r1 = new EmergencyReport("SC-001", testCitizen, IncidentCategory.CRIME,
                "Theft at Mall", ReportPriority.MEDIUM, 17.4435, 78.3772, "Hitech City", baseTime, null);
        r1.setId(201L);
        r1.setMasterIncident(null);

        EmergencyReport r2 = new EmergencyReport("SC-002", testCitizen, IncidentCategory.CRIME,
                "Stolen bag at Mall", ReportPriority.MEDIUM, 17.4436, 78.3773, "Hitech City Mall", baseTime.plusMinutes(5), null);
        r2.setId(202L);
        r2.setMasterIncident(null);

        when(reportRepository.findReportsWithValidCoordinates()).thenReturn(Arrays.asList(r1, r2));

        List<DuplicateCandidatePairDTO> candidates = detectionService.findPotentialDuplicateCandidates();

        assertEquals(1, candidates.size(), "Unlinked reports (master_incident_id = null) should be evaluated normally");
    }
}
