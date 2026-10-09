package com.safecity.util;

import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;

import java.time.Duration;
import java.time.LocalDateTime;

public class SlaCalculatorUtil {

    public static int getSlaTargetMinutes(ReportPriority priority) {
        if (priority == null) {
            return 60; // Default to MEDIUM threshold if null
        }
        switch (priority) {
            case CRITICAL:
                return 10;
            case HIGH:
                return 30;
            case MEDIUM:
                return 60;
            case LOW:
                return 120;
            default:
                return 60;
        }
    }

    public static void applySlaFields(EmergencyReportResponseDTO dto) {
        if (dto == null) {
            return;
        }

        ReportPriority priority = dto.getPriority();
        ReportStatus status = dto.getStatus();
        LocalDateTime createdAt = dto.getCreatedAt();

        int targetMinutes = getSlaTargetMinutes(priority);
        dto.setSlaTargetMinutes(targetMinutes);

        // Check if report is resolved or closed (inactive)
        boolean isActive = status != ReportStatus.RESOLVED && status != ReportStatus.CLOSED;

        if (!isActive) {
            dto.setSlaStatus("STOPPED");
            dto.setIsEscalated(false);

            if (createdAt != null) {
                LocalDateTime endTime = dto.getUpdatedAt() != null ? dto.getUpdatedAt() : LocalDateTime.now();
                long elapsed = Math.max(0L, Duration.between(createdAt, endTime).toMinutes());
                dto.setElapsedMinutes(elapsed);
                dto.setSlaMinutesRemaining(Math.max(0L, targetMinutes - elapsed));
            } else {
                dto.setElapsedMinutes(0L);
                dto.setSlaMinutesRemaining((long) targetMinutes);
            }
            return;
        }

        // Active emergency report logic
        if (createdAt == null) {
            dto.setElapsedMinutes(0L);
            dto.setSlaMinutesRemaining((long) targetMinutes);
            dto.setSlaStatus("NORMAL");
            dto.setIsEscalated(false);
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        long elapsed = Math.max(0L, Duration.between(createdAt, now).toMinutes());
        long remaining = targetMinutes - elapsed;

        dto.setElapsedMinutes(elapsed);
        dto.setSlaMinutesRemaining(remaining);

        // SLA status ratios:
        // NORMAL: elapsed < 75% of target
        // WARNING: elapsed >= 75% and < 100% of target
        // BREACHED: elapsed >= 100% of target (isEscalated = true)
        double ratio = (double) elapsed / targetMinutes;

        if (ratio >= 1.0) {
            dto.setSlaStatus("BREACHED");
            dto.setIsEscalated(true);
        } else if (ratio >= 0.75) {
            dto.setSlaStatus("WARNING");
            dto.setIsEscalated(false);
        } else {
            dto.setSlaStatus("NORMAL");
            dto.setIsEscalated(false);
        }
    }
}
