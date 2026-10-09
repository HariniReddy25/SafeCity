package com.safecity.controller;

import com.safecity.dto.EmergencyMapMarkerDTO;
import com.safecity.dto.EmergencyReportRequestDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.dto.ReportSummaryDTO;
import com.safecity.dto.StatusHistoryDTO;
import com.safecity.service.EmergencyReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class EmergencyReportController {

    @Autowired
    private EmergencyReportService reportService;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<EmergencyReportResponseDTO> createReport(
            Authentication authentication,
            @Valid @RequestPart("report") EmergencyReportRequestDTO request,
            @RequestPart(value = "evidence", required = false) MultipartFile evidenceFile) {

        String citizenEmail = authentication.getName();
        EmergencyReportResponseDTO response = reportService.createReport(citizenEmail, request, evidenceFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/sos")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<EmergencyReportResponseDTO> createSosReport(
            Authentication authentication,
            @RequestBody(required = false) com.safecity.dto.SosRequestDTO request) {

        String citizenEmail = authentication.getName();
        com.safecity.dto.SosRequestDTO sosReq = request != null ? request : new com.safecity.dto.SosRequestDTO();
        EmergencyReportResponseDTO response = reportService.createSosReport(citizenEmail, sosReq);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<List<EmergencyReportResponseDTO>> getMyReports(Authentication authentication) {
        String citizenEmail = authentication.getName();
        List<EmergencyReportResponseDTO> reports = reportService.getMyReports(citizenEmail);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/my/summary")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<ReportSummaryDTO> getMyReportSummary(Authentication authentication) {
        String citizenEmail = authentication.getName();
        ReportSummaryDTO summary = reportService.getMyReportSummary(citizenEmail);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/map")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EmergencyMapMarkerDTO>> getEmergencyMapMarkers() {
        List<EmergencyMapMarkerDTO> markers = reportService.getEmergencyMapMarkers();
        return ResponseEntity.ok(markers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<EmergencyReportResponseDTO> getReportById(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String citizenEmail = authentication.getName();
        EmergencyReportResponseDTO response = reportService.getReportByIdForCitizen(citizenEmail, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/status-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StatusHistoryDTO>> getStatusHistory(
            Authentication authentication,
            @PathVariable("id") Long id) {

        String userEmail = authentication.getName();
        List<StatusHistoryDTO> history = reportService.getStatusHistoryForReport(userEmail, id);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/evidence/{fileName:.+}")
    public ResponseEntity<Resource> getEvidenceFile(@PathVariable String fileName) {
        Resource resource = reportService.loadEvidenceAsResource(fileName);

        MediaType contentType = null;
        try {
            if (resource.exists()) {
                String probedType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
                if (probedType != null && !probedType.isBlank()) {
                    contentType = MediaType.parseMediaType(probedType);
                }
            }
        } catch (Exception ignored) {
        }

        if (contentType == null) {
            contentType = determineMediaTypeFromFileName(fileName);
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private MediaType determineMediaTypeFromFileName(String fileName) {
        if (fileName == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (lowerName.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (lowerName.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
