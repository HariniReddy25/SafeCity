package com.safecity.service;

import com.safecity.dto.MasterIncidentResponseDTO;
import com.safecity.dto.MergeReportsRequestDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.MasterIncidentRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.service.impl.MasterIncidentServiceImpl;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MasterIncidentServiceTest {

    @Mock
    private MasterIncidentRepository masterIncidentRepository;

    @Mock
    private EmergencyReportRepository reportRepository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MasterIncidentServiceImpl masterIncidentService;

    private User testCitizen;
    private EmergencyReport report1;
    private EmergencyReport report2;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Citizen User", "citizen@test.com", "+1-555-0000", "password", Role.CITIZEN);
        testCitizen.setId(1L);

        report1 = new EmergencyReport("SC-2026-0001", testCitizen, IncidentCategory.FIRE,
                "Structure fire on 3rd floor", ReportPriority.CRITICAL, 17.3850, 78.4867,
                "Abids Main Road", LocalDateTime.now(), null);
        report1.setId(101L);

        report2 = new EmergencyReport("SC-2026-0002", testCitizen, IncidentCategory.FIRE,
                "Heavy smoke reported at Abids", ReportPriority.HIGH, 17.3852, 78.4869,
                "Abids Circle", LocalDateTime.now().plusMinutes(5), null);
        report2.setId(102L);
    }

    @Test
    @DisplayName("Merge Valid Reports -> Creates Master Incident and links reports")
    void testMergeValidReports_CreatesMasterIncident() {
        MergeReportsRequestDTO request = new MergeReportsRequestDTO(101L, Collections.singletonList(102L));

        when(reportRepository.findById(101L)).thenReturn(Optional.of(report1));
        when(reportRepository.findById(102L)).thenReturn(Optional.of(report2));
        when(masterIncidentRepository.count()).thenReturn(0L);

        MasterIncident savedMaster = new MasterIncident("MI-2026-000001", "Master Incident - Fire",
                IncidentCategory.FIRE, ReportPriority.CRITICAL, 17.3850, 78.4867, "Abids Main Road");
        savedMaster.setId(1L);
        savedMaster.getReports().add(report1);
        savedMaster.getReports().add(report2);

        when(masterIncidentRepository.save(any(MasterIncident.class))).thenReturn(savedMaster);
        when(masterIncidentRepository.findById(1L)).thenReturn(Optional.of(savedMaster));

        MasterIncidentResponseDTO response = masterIncidentService.mergeReports(request);

        assertNotNull(response);
        assertEquals("MI-2026-000001", response.getMasterCode());
        assertEquals(2, response.getLinkedReportsCount());
        verify(reportRepository, times(2)).save(any(EmergencyReport.class));
    }

    @Test
    @DisplayName("Merge Validation: Same report ID in master and duplicate list -> Throws Exception")
    void testMergeValidation_SameReportId_ThrowsException() {
        MergeReportsRequestDTO request = new MergeReportsRequestDTO(101L, Collections.singletonList(101L));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            masterIncidentService.mergeReports(request);
        });

        assertTrue(exception.getMessage().contains("Master report ID cannot be included"));
    }

    @Test
    @DisplayName("Merge Validation: Empty duplicate list -> Throws Exception")
    void testMergeValidation_EmptyDuplicateList_ThrowsException() {
        MergeReportsRequestDTO request = new MergeReportsRequestDTO(101L, Collections.emptyList());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            masterIncidentService.mergeReports(request);
        });

        assertTrue(exception.getMessage().contains("must not be empty"));
    }

    @Test
    @DisplayName("Unmerge Report -> Removes master incident link from target report")
    void testUnmergeReport_RemovesLink() {
        MasterIncident masterIncident = new MasterIncident("MI-2026-000001", "Master Incident",
                IncidentCategory.FIRE, ReportPriority.HIGH, 17.3850, 78.4867, "Abids");
        masterIncident.setId(1L);

        report2.setMasterIncident(masterIncident);
        masterIncident.getReports().add(report1);
        masterIncident.getReports().add(report2);

        when(masterIncidentRepository.findById(1L)).thenReturn(Optional.of(masterIncident));
        when(reportRepository.findById(102L)).thenReturn(Optional.of(report2));

        MasterIncidentResponseDTO response = masterIncidentService.unmergeReport(1L, 102L);

        assertNotNull(response);
        assertNull(report2.getMasterIncident());
        verify(reportRepository).save(report2);
    }
}
