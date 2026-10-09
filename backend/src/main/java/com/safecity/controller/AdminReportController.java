package com.safecity.controller;

import com.safecity.dto.AdminDashboardSummaryDTO;
import com.safecity.dto.AssignResponderRequestDTO;
import com.safecity.dto.DuplicateCandidatePairDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.dto.MasterIncidentResponseDTO;
import com.safecity.dto.MergeReportsRequestDTO;
import com.safecity.dto.ResponderDTO;
import com.safecity.dto.UpdateReportPriorityRequestDTO;
import com.safecity.dto.UpdateReportStatusRequestDTO;
import com.safecity.service.DuplicateDetectionService;
import com.safecity.service.EmergencyReportService;
import com.safecity.service.MasterIncidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminReportController {

    @Autowired
    private EmergencyReportService reportService;

    @Autowired
    private DuplicateDetectionService duplicateDetectionService;

    @Autowired
    private MasterIncidentService masterIncidentService;

    @Autowired
    private com.safecity.service.EmergencyResponseIntelligenceService intelligenceService;

    @GetMapping("/reports/{id}/intelligence")
    public ResponseEntity<com.safecity.dto.EmergencyIntelligenceResponseDTO> getReportIntelligence(@PathVariable("id") Long id) {
        com.safecity.dto.EmergencyIntelligenceResponseDTO result = intelligenceService.getReportIntelligence(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/duplicates/candidates")
    public ResponseEntity<List<DuplicateCandidatePairDTO>> getPotentialDuplicates() {
        List<DuplicateCandidatePairDTO> candidates = duplicateDetectionService.findPotentialDuplicateCandidates();
        return ResponseEntity.ok(candidates);
    }

    @PostMapping("/incidents/merge")
    public ResponseEntity<MasterIncidentResponseDTO> mergeReports(@Valid @RequestBody MergeReportsRequestDTO request) {
        MasterIncidentResponseDTO result = masterIncidentService.mergeReports(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/incidents/{masterId}")
    public ResponseEntity<MasterIncidentResponseDTO> getMasterIncidentById(@PathVariable("masterId") Long masterId) {
        MasterIncidentResponseDTO result = masterIncidentService.getMasterIncidentById(masterId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/incidents/{masterId}/unmerge/{reportId}")
    public ResponseEntity<MasterIncidentResponseDTO> unmergeReport(
            @PathVariable("masterId") Long masterId,
            @PathVariable("reportId") Long reportId) {
        MasterIncidentResponseDTO result = masterIncidentService.unmergeReport(masterId, reportId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<AdminDashboardSummaryDTO> getDashboardSummary() {
        AdminDashboardSummaryDTO summary = reportService.getAdminDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<EmergencyReportResponseDTO>> getAllReports() {
        List<EmergencyReportResponseDTO> reports = reportService.getAllReportsForAdmin();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<EmergencyReportResponseDTO> getReportById(@PathVariable("id") Long id) {
        EmergencyReportResponseDTO report = reportService.getReportByIdForAdmin(id);
        return ResponseEntity.ok(report);
    }

    @PutMapping("/reports/{id}/status")
    public ResponseEntity<EmergencyReportResponseDTO> updateReportStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateReportStatusRequestDTO request) {

        EmergencyReportResponseDTO updatedReport = reportService.updateReportStatusByAdmin(id, request.getStatus());
        return ResponseEntity.ok(updatedReport);
    }

    @PutMapping("/reports/{id}/priority")
    public ResponseEntity<EmergencyReportResponseDTO> updateReportPriority(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateReportPriorityRequestDTO request) {

        EmergencyReportResponseDTO updatedReport = reportService.updateReportPriorityByAdmin(id, request.getPriority());
        return ResponseEntity.ok(updatedReport);
    }

    // Responder Management & Assignment (Phase 4B)
    @GetMapping("/responders")
    public ResponseEntity<List<ResponderDTO>> getAllResponders() {
        List<ResponderDTO> responders = reportService.getAllRespondersForAdmin();
        return ResponseEntity.ok(responders);
    }

    @GetMapping("/responders/{id}/workload")
    public ResponseEntity<ResponderDTO> getResponderWorkload(@PathVariable("id") Long id) {
        ResponderDTO responder = reportService.getResponderWorkload(id);
        return ResponseEntity.ok(responder);
    }

    @PutMapping("/reports/{id}/assign")
    public ResponseEntity<EmergencyReportResponseDTO> assignResponder(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignResponderRequestDTO request) {

        EmergencyReportResponseDTO updatedReport = reportService.assignResponderToReport(id, request.getResponderId());
        return ResponseEntity.ok(updatedReport);
    }
}
