package com.safecity.controller;

import com.safecity.dto.CreateResponseNoteRequestDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.dto.ResponderDashboardSummaryDTO;
import com.safecity.dto.ResponseNoteDTO;
import com.safecity.service.EmergencyReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responder")
@PreAuthorize("hasRole('RESPONDER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class ResponderReportController {

    @Autowired
    private EmergencyReportService reportService;

    @Autowired
    private com.safecity.service.EmergencyResponseIntelligenceService intelligenceService;

    @GetMapping("/emergencies/{id}/intelligence")
    public ResponseEntity<com.safecity.dto.EmergencyIntelligenceResponseDTO> getEmergencyIntelligence(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String responderEmail = authentication.getName();
        com.safecity.dto.EmergencyIntelligenceResponseDTO dto = intelligenceService.getResponderEmergencyIntelligence(responderEmail, id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ResponderDashboardSummaryDTO> getDashboardSummary(Authentication authentication) {
        String responderEmail = authentication.getName();
        ResponderDashboardSummaryDTO summary = reportService.getResponderDashboardSummary(responderEmail);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/emergencies")
    public ResponseEntity<List<EmergencyReportResponseDTO>> getAssignedEmergencies(Authentication authentication) {
        String responderEmail = authentication.getName();
        List<EmergencyReportResponseDTO> emergencies = reportService.getAssignedEmergenciesForResponder(responderEmail);
        return ResponseEntity.ok(emergencies);
    }

    @GetMapping("/emergencies/{id}")
    public ResponseEntity<EmergencyReportResponseDTO> getEmergencyById(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String responderEmail = authentication.getName();
        EmergencyReportResponseDTO emergency = reportService.getEmergencyByIdForResponder(responderEmail, id);
        return ResponseEntity.ok(emergency);
    }

    @PutMapping("/emergencies/{id}/accept")
    public ResponseEntity<EmergencyReportResponseDTO> acceptAssignment(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String responderEmail = authentication.getName();
        EmergencyReportResponseDTO updated = reportService.acceptAssignmentByResponder(responderEmail, id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/emergencies/{id}/start")
    public ResponseEntity<EmergencyReportResponseDTO> startResponse(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String responderEmail = authentication.getName();
        EmergencyReportResponseDTO updated = reportService.startResponseByResponder(responderEmail, id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/emergencies/{id}/resolve")
    public ResponseEntity<EmergencyReportResponseDTO> resolveEmergency(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String responderEmail = authentication.getName();
        EmergencyReportResponseDTO updated = reportService.resolveEmergencyByResponder(responderEmail, id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/emergencies/{id}/notes")
    public ResponseEntity<ResponseNoteDTO> addResponseNote(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateResponseNoteRequestDTO request) {

        String responderEmail = authentication.getName();
        ResponseNoteDTO note = reportService.addResponseNoteByResponder(responderEmail, id, request.getNoteText());
        return new ResponseEntity<>(note, HttpStatus.CREATED);
    }
}
