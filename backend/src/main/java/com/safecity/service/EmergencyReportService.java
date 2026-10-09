package com.safecity.service;

import com.safecity.dto.AdminDashboardSummaryDTO;
import com.safecity.dto.EmergencyMapMarkerDTO;
import com.safecity.dto.EmergencyReportRequestDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.dto.ReportSummaryDTO;
import com.safecity.dto.ResponderDTO;
import com.safecity.dto.ResponderDashboardSummaryDTO;
import com.safecity.dto.ResponseNoteDTO;
import com.safecity.dto.StatusHistoryDTO;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EmergencyReportService {

    EmergencyReportResponseDTO createReport(String citizenEmail, EmergencyReportRequestDTO request, MultipartFile evidenceFile);

    EmergencyReportResponseDTO createSosReport(String citizenEmail, com.safecity.dto.SosRequestDTO request);

    List<EmergencyReportResponseDTO> getMyReports(String citizenEmail);

    ReportSummaryDTO getMyReportSummary(String citizenEmail);

    EmergencyReportResponseDTO getReportByIdForCitizen(String citizenEmail, Long reportId);

    Resource loadEvidenceAsResource(String fileName);

    // Admin Operations (Phase 4A)
    AdminDashboardSummaryDTO getAdminDashboardSummary();

    List<EmergencyReportResponseDTO> getAllReportsForAdmin();

    EmergencyReportResponseDTO getReportByIdForAdmin(Long reportId);

    EmergencyReportResponseDTO updateReportStatusByAdmin(Long reportId, ReportStatus newStatus);

    EmergencyReportResponseDTO updateReportPriorityByAdmin(Long reportId, ReportPriority newPriority);

    // Responder Management & Assignment (Phase 4B)
    List<ResponderDTO> getAllRespondersForAdmin();

    ResponderDTO getResponderWorkload(Long responderId);

    EmergencyReportResponseDTO assignResponderToReport(Long reportId, Long responderId);

    // Responder Portal & Emergency Response Operations (Phase 4C)
    ResponderDashboardSummaryDTO getResponderDashboardSummary(String responderEmail);

    List<EmergencyReportResponseDTO> getAssignedEmergenciesForResponder(String responderEmail);

    EmergencyReportResponseDTO getEmergencyByIdForResponder(String responderEmail, Long reportId);

    EmergencyReportResponseDTO acceptAssignmentByResponder(String responderEmail, Long reportId);

    EmergencyReportResponseDTO startResponseByResponder(String responderEmail, Long reportId);

    EmergencyReportResponseDTO resolveEmergencyByResponder(String responderEmail, Long reportId);

    ResponseNoteDTO addResponseNoteByResponder(String responderEmail, Long reportId, String noteText);

    // Status History & Audit Log Operations (Phase 4D)
    List<StatusHistoryDTO> getStatusHistoryForReport(String userEmail, Long reportId);

    // Geospatial Map Operations (Phase 5B)
    List<EmergencyMapMarkerDTO> getEmergencyMapMarkers();
}
