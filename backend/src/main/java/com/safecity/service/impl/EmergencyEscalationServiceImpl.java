package com.safecity.service.impl;

import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.entity.EmergencyReport;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;
import com.safecity.entity.StatusHistory;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.service.EmergencyEscalationService;
import com.safecity.service.NotificationService;
import com.safecity.util.SlaCalculatorUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class EmergencyEscalationServiceImpl implements EmergencyEscalationService {

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public List<EmergencyReportResponseDTO> checkAndEscalateReports() {
        List<EmergencyReport> candidateReports = reportRepository.findActiveUnescalatedReports(
                Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED)
        );

        List<EmergencyReportResponseDTO> escalatedDTOs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (EmergencyReport report : candidateReports) {
            // Idempotency check: Skip if already escalated or inactive
            if (report.getEscalatedAt() != null || report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.CLOSED) {
                continue;
            }

            LocalDateTime createdAt = report.getCreatedAt();
            if (createdAt == null) {
                continue;
            }

            int targetMinutes = SlaCalculatorUtil.getSlaTargetMinutes(report.getPriority());
            long elapsedMinutes = Math.max(0L, Duration.between(createdAt, now).toMinutes());

            // SLA Breach trigger (elapsed >= targetMinutes)
            if (elapsedMinutes >= targetMinutes) {
                ReportPriority prevPriority = report.getPriority();
                ReportPriority newPriority = getEscalatedPriority(prevPriority);

                // Set persistent idempotency timestamp
                report.setEscalatedAt(now);
                report.setPriority(newPriority);

                EmergencyReport savedReport = reportRepository.save(report);

                // Audit Trail: Automatic SLA Escalation StatusHistory
                String reasonNote = (prevPriority == ReportPriority.CRITICAL)
                        ? "Automatic SLA breach notification for CRITICAL incident (" + savedReport.getReportId() + ")."
                        : "Automatic SLA escalation due to response SLA breach (" + prevPriority + " -> " + newPriority + ").";

                StatusHistory history = new StatusHistory(savedReport, savedReport.getStatus(), savedReport.getStatus(), null, reasonNote);
                statusHistoryRepository.save(history);

                // Send Alert Notification to Admins & Responders
                notificationService.notifyAdminsAndResponders(
                        "🚨 AUTOMATIC SLA ESCALATION ALERT",
                        "Emergency report " + savedReport.getReportId() + " (" + (savedReport.getCategory() != null ? savedReport.getCategory().getDisplayName() : "Emergency") + ") breached response SLA. Priority: " + newPriority.name() + ".",
                        "ALERT",
                        savedReport.getReportId()
                );

                escalatedDTOs.add(EmergencyReportResponseDTO.fromEntity(savedReport));
            }
        }

        return escalatedDTOs;
    }

    private ReportPriority getEscalatedPriority(ReportPriority currentPriority) {
        if (currentPriority == null) {
            return ReportPriority.MEDIUM;
        }
        switch (currentPriority) {
            case LOW:
                return ReportPriority.MEDIUM;
            case MEDIUM:
                return ReportPriority.HIGH;
            case HIGH:
                return ReportPriority.CRITICAL;
            case CRITICAL:
            default:
                return ReportPriority.CRITICAL;
        }
    }
}
