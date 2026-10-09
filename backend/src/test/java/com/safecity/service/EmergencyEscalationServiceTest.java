package com.safecity.service;

import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.service.impl.EmergencyEscalationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmergencyEscalationServiceTest {

    @Mock
    private EmergencyReportRepository reportRepository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EmergencyEscalationServiceImpl escalationService;

    private User testCitizen;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Citizen User", "citizen@test.com", "+1-555-0000", "password", Role.CITIZEN);
        testCitizen.setId(1L);
    }

    private EmergencyReport createReport(Long id, String reportId, ReportPriority priority, ReportStatus status, int elapsedMinutesAgo) {
        EmergencyReport report = new EmergencyReport(
                reportId,
                testCitizen,
                IncidentCategory.FIRE,
                "Test emergency description",
                priority,
                17.3850,
                78.4867,
                "Abids Circle",
                LocalDateTime.now().minusMinutes(elapsedMinutesAgo),
                null
        );
        report.setId(id);
        report.setStatus(status);
        report.setCreatedAt(LocalDateTime.now().minusMinutes(elapsedMinutesAgo));
        return report;
    }

    @Test
    @DisplayName("SLA Breach LOW Priority -> Escalates LOW to MEDIUM")
    void testEscalationLowToMedium() {
        // LOW priority target = 120 mins. Elapsed = 125 mins.
        EmergencyReport report = createReport(101L, "SC-2026-0001", ReportPriority.LOW, ReportStatus.SUBMITTED, 125);

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.singletonList(report));
        when(reportRepository.save(any(EmergencyReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertEquals(1, result.size());
        assertEquals(ReportPriority.MEDIUM, report.getPriority());
        assertNotNull(report.getEscalatedAt());
        verify(statusHistoryRepository).save(any(StatusHistory.class));
        verify(notificationService).notifyAdminsAndResponders(anyString(), anyString(), eq("ALERT"), eq("SC-2026-0001"));
    }

    @Test
    @DisplayName("SLA Breach MEDIUM Priority -> Escalates MEDIUM to HIGH")
    void testEscalationMediumToHigh() {
        // MEDIUM priority target = 60 mins. Elapsed = 65 mins.
        EmergencyReport report = createReport(102L, "SC-2026-0002", ReportPriority.MEDIUM, ReportStatus.SUBMITTED, 65);

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.singletonList(report));
        when(reportRepository.save(any(EmergencyReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertEquals(1, result.size());
        assertEquals(ReportPriority.HIGH, report.getPriority());
        assertNotNull(report.getEscalatedAt());
    }

    @Test
    @DisplayName("SLA Breach HIGH Priority -> Escalates HIGH to CRITICAL")
    void testEscalationHighToCritical() {
        // HIGH priority target = 30 mins. Elapsed = 35 mins.
        EmergencyReport report = createReport(103L, "SC-2026-0003", ReportPriority.HIGH, ReportStatus.ASSIGNED, 35);

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.singletonList(report));
        when(reportRepository.save(any(EmergencyReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertEquals(1, result.size());
        assertEquals(ReportPriority.CRITICAL, report.getPriority());
        assertNotNull(report.getEscalatedAt());
    }

    @Test
    @DisplayName("SLA Breach CRITICAL Priority -> Remains CRITICAL and logs notification")
    void testCriticalDoesNotEscalateFurther() {
        // CRITICAL priority target = 10 mins. Elapsed = 15 mins.
        EmergencyReport report = createReport(104L, "SC-2026-0004", ReportPriority.CRITICAL, ReportStatus.IN_PROGRESS, 15);

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.singletonList(report));
        when(reportRepository.save(any(EmergencyReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertEquals(1, result.size());
        assertEquals(ReportPriority.CRITICAL, report.getPriority());
        assertNotNull(report.getEscalatedAt());
        verify(notificationService).notifyAdminsAndResponders(anyString(), anyString(), eq("ALERT"), eq("SC-2026-0004"));
    }

    @Test
    @DisplayName("Idempotency Check: Already escalated report is skipped and not escalated twice")
    void testSameReportNotEscalatedTwice() {
        EmergencyReport report = createReport(105L, "SC-2026-0005", ReportPriority.MEDIUM, ReportStatus.SUBMITTED, 125);
        report.setEscalatedAt(LocalDateTime.now().minusMinutes(10)); // Already escalated 10 mins ago

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.singletonList(report));

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertTrue(result.isEmpty());
        assertEquals(ReportPriority.MEDIUM, report.getPriority());
        verify(reportRepository, never()).save(any());
        verify(notificationService, never()).notifyAdminsAndResponders(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Idempotency Check: Duplicate notifications are prevented on subsequent scheduler cycles")
    void testNoDuplicateEscalationNotifications() {
        EmergencyReport report = createReport(106L, "SC-2026-0006", ReportPriority.LOW, ReportStatus.SUBMITTED, 130);

        when(reportRepository.findActiveUnescalatedReports(any()))
                .thenReturn(Collections.singletonList(report))
                .thenReturn(Collections.emptyList()); // Second call database query returns empty because escalatedAt IS NOT NULL

        when(reportRepository.save(any(EmergencyReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Cycle 1: Escalation occurs
        List<EmergencyReportResponseDTO> result1 = escalationService.checkAndEscalateReports();
        assertEquals(1, result1.size());
        verify(notificationService, times(1)).notifyAdminsAndResponders(any(), any(), any(), any());

        // Cycle 2: Scheduler runs again (report now has escalatedAt != null)
        List<EmergencyReportResponseDTO> result2 = escalationService.checkAndEscalateReports();
        assertTrue(result2.isEmpty());
        // Verify notification count remains exactly 1
        verify(notificationService, times(1)).notifyAdminsAndResponders(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Status Filter Check: RESOLVED and CLOSED reports are ignored")
    void testResolvedAndClosedReportsIgnored() {
        EmergencyReport resolvedReport = createReport(107L, "SC-2026-0007", ReportPriority.LOW, ReportStatus.RESOLVED, 200);
        EmergencyReport closedReport = createReport(108L, "SC-2026-0008", ReportPriority.MEDIUM, ReportStatus.CLOSED, 200);

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.emptyList());

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertTrue(result.isEmpty());
        verify(reportRepository, never()).save(any());
        verify(notificationService, never()).notifyAdminsAndResponders(any(), any(), any(), any());
    }

    @Test
    @DisplayName("SLA Status Check: Normal and Warning SLA reports are NOT escalated")
    void testNormalAndWarningSlaReportsNotEscalated() {
        // LOW priority target = 120 mins. Elapsed = 50 mins (NORMAL SLA state).
        EmergencyReport report = createReport(109L, "SC-2026-0009", ReportPriority.LOW, ReportStatus.SUBMITTED, 50);

        when(reportRepository.findActiveUnescalatedReports(any())).thenReturn(Collections.singletonList(report));

        List<EmergencyReportResponseDTO> result = escalationService.checkAndEscalateReports();

        assertTrue(result.isEmpty());
        assertEquals(ReportPriority.LOW, report.getPriority());
        assertNull(report.getEscalatedAt());
        verify(reportRepository, never()).save(any());
        verify(notificationService, never()).notifyAdminsAndResponders(any(), any(), any(), any());
    }
}
