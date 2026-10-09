package com.safecity.service.impl;

import com.safecity.dto.MasterIncidentResponseDTO;
import com.safecity.dto.MergeReportsRequestDTO;
import com.safecity.entity.EmergencyReport;
import com.safecity.entity.MasterIncident;
import com.safecity.entity.StatusHistory;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.MasterIncidentRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.service.MasterIncidentService;
import com.safecity.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MasterIncidentServiceImpl implements MasterIncidentService {

    @Autowired
    private MasterIncidentRepository masterIncidentRepository;

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public MasterIncidentResponseDTO mergeReports(MergeReportsRequestDTO request) {
        if (request.getMasterReportId() == null) {
            throw new IllegalArgumentException("Master report ID must not be null.");
        }

        if (request.getDuplicateReportIds() == null || request.getDuplicateReportIds().isEmpty()) {
            throw new IllegalArgumentException("Duplicate report IDs list must not be empty.");
        }

        if (request.getDuplicateReportIds().contains(request.getMasterReportId())) {
            throw new IllegalArgumentException("Master report ID cannot be included in the duplicate report IDs list.");
        }

        EmergencyReport masterReport = reportRepository.findById(request.getMasterReportId())
                .orElseThrow(() -> new IllegalArgumentException("Master report not found with ID: " + request.getMasterReportId()));

        List<EmergencyReport> duplicateReports = new ArrayList<>();
        for (Long dupId : request.getDuplicateReportIds()) {
            EmergencyReport dupReport = reportRepository.findById(dupId)
                    .orElseThrow(() -> new IllegalArgumentException("Duplicate report not found with ID: " + dupId));
            duplicateReports.add(dupReport);
        }

        // Determine or create MasterIncident
        MasterIncident masterIncident = masterReport.getMasterIncident();

        if (masterIncident == null) {
            String masterCode = generateUniqueMasterCode();
            String title = "Master Incident - " + (masterReport.getCategory() != null ? masterReport.getCategory().getDisplayName() : "Emergency")
                    + " at " + (masterReport.getAddress() != null ? masterReport.getAddress() : "Coordinates logged");

            masterIncident = new MasterIncident(
                    masterCode,
                    title,
                    masterReport.getCategory(),
                    masterReport.getPriority(),
                    masterReport.getLatitude(),
                    masterReport.getLongitude(),
                    masterReport.getAddress()
            );
            masterIncident.setStatus(masterReport.getStatus());
            masterIncident.setAssignedResponder(masterReport.getAssignedResponder());

            masterIncident = masterIncidentRepository.save(masterIncident);

            masterReport.setMasterIncident(masterIncident);
            reportRepository.save(masterReport);
            recordStatusChange(masterReport, "Linked to Master Incident " + masterIncident.getMasterCode());
        }

        // Link duplicate reports to masterIncident
        for (EmergencyReport dupReport : duplicateReports) {
            dupReport.setMasterIncident(masterIncident);
            reportRepository.save(dupReport);
            recordStatusChange(dupReport, "Linked to Master Incident " + masterIncident.getMasterCode());

            if (dupReport.getCitizen() != null) {
                notificationService.createNotification(
                        dupReport.getCitizen(),
                        "Report Grouped with Master Incident",
                        "Your report " + dupReport.getReportId() + " has been grouped under Master Incident " + masterIncident.getMasterCode() + ".",
                        "MERGED",
                        dupReport.getReportId()
                );
            }
        }

        MasterIncident updatedIncident = masterIncidentRepository.findById(masterIncident.getId()).orElse(masterIncident);
        return MasterIncidentResponseDTO.fromEntity(updatedIncident);
    }

    @Override
    @Transactional(readOnly = true)
    public MasterIncidentResponseDTO getMasterIncidentById(Long masterId) {
        MasterIncident masterIncident = masterIncidentRepository.findById(masterId)
                .orElseThrow(() -> new IllegalArgumentException("Master Incident not found with ID: " + masterId));

        return MasterIncidentResponseDTO.fromEntity(masterIncident);
    }

    @Override
    public MasterIncidentResponseDTO unmergeReport(Long masterId, Long reportId) {
        MasterIncident masterIncident = masterIncidentRepository.findById(masterId)
                .orElseThrow(() -> new IllegalArgumentException("Master Incident not found with ID: " + masterId));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getMasterIncident() != null && report.getMasterIncident().getId().equals(masterId)) {
            report.setMasterIncident(null);
            reportRepository.save(report);

            recordStatusChange(report, "Unlinked from Master Incident " + masterIncident.getMasterCode());

            if (report.getCitizen() != null) {
                notificationService.createNotification(
                        report.getCitizen(),
                        "Report Unlinked from Master Incident",
                        "Your report " + report.getReportId() + " was unlinked from Master Incident " + masterIncident.getMasterCode() + ".",
                        "UNMERGED",
                        report.getReportId()
                );
            }
        }

        MasterIncident updatedIncident = masterIncidentRepository.findById(masterId).orElse(masterIncident);
        return MasterIncidentResponseDTO.fromEntity(updatedIncident);
    }

    private void recordStatusChange(EmergencyReport report, String reason) {
        StatusHistory history = new StatusHistory(report, report.getStatus(), report.getStatus(), null, reason);
        statusHistoryRepository.save(history);
    }

    private synchronized String generateUniqueMasterCode() {
        int currentYear = Year.now().getValue();
        long count = masterIncidentRepository.count() + 1;
        String candidateCode;

        do {
            candidateCode = String.format("MI-%d-%06d", currentYear, count);
            count++;
        } while (masterIncidentRepository.findByMasterCode(candidateCode).isPresent());

        return candidateCode;
    }
}
