package com.safecity.service.impl;

import com.safecity.dto.AdminDashboardSummaryDTO;
import com.safecity.dto.EmergencyMapMarkerDTO;
import com.safecity.dto.EmergencyReportRequestDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.dto.ReportSummaryDTO;
import com.safecity.dto.ResponderDTO;
import com.safecity.dto.ResponderDashboardSummaryDTO;
import com.safecity.dto.ResponseNoteDTO;
import com.safecity.dto.StatusHistoryDTO;
import com.safecity.entity.EmergencyReport;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;
import com.safecity.entity.ResponseNote;
import com.safecity.entity.Role;
import com.safecity.entity.StatusHistory;
import com.safecity.entity.User;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.ResponseNoteRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.EmergencyReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmergencyReportServiceImpl implements EmergencyReportService {

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResponseNoteRepository responseNoteRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private com.safecity.service.NotificationService notificationService;

    @Autowired
    private com.safecity.service.ResourceService resourceService;

    private final Path fileStorageLocation;

    public EmergencyReportServiceImpl(@Value("${app.upload.dir:uploads/evidence}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for uploaded evidence files.", ex);
        }
    }

    private void recordStatusChange(EmergencyReport report, ReportStatus prevStatus, ReportStatus newStatus, User changedBy, String reason) {
        StatusHistory history = new StatusHistory(report, prevStatus, newStatus, changedBy, reason);
        statusHistoryRepository.save(history);
    }

    private List<StatusHistoryDTO> loadStatusHistoryDTOs(Long reportId) {
        List<StatusHistory> histories = statusHistoryRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        return histories.stream().map(StatusHistoryDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    public EmergencyReportResponseDTO createReport(String citizenEmail, EmergencyReportRequestDTO request, MultipartFile evidenceFile) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Citizen user not found with email: " + citizenEmail));

        String reportId = generateUniqueReportId();

        String evidencePath = null;
        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            evidencePath = storeEvidenceFile(evidenceFile);
        }

        LocalDateTime incidentTime = request.getIncidentDateTime() != null ? request.getIncidentDateTime() : LocalDateTime.now();

        EmergencyReport report = new EmergencyReport(
                reportId,
                citizen,
                request.getCategory(),
                request.getDescription().trim(),
                request.getPriority(),
                request.getLatitude(),
                request.getLongitude(),
                request.getAddress() != null ? request.getAddress().trim() : null,
                incidentTime,
                evidencePath
        );

        EmergencyReport savedReport = reportRepository.save(report);

        // Audit Trail: Initial Creation SUBMITTED
        recordStatusChange(savedReport, null, ReportStatus.SUBMITTED, citizen, "Emergency incident reported by citizen.");

        // Notifications
        notificationService.createNotification(
                citizen,
                "Report Submitted",
                "Your emergency report " + reportId + " has been submitted successfully.",
                "INFO",
                reportId
        );

        notificationService.notifyRole(
                Role.ADMIN,
                "New Emergency Report",
                "New emergency report " + reportId + " submitted by " + citizen.getFullName() + ".",
                "INFO",
                reportId
        );

        if (savedReport.getPriority() == ReportPriority.HIGH || savedReport.getPriority() == ReportPriority.CRITICAL) {
            notificationService.notifyAdminsAndResponders(
                    "🚨 HIGH PRIORITY EMERGENCY ALERT",
                    "High priority report (" + reportId + ") submitted: " + (savedReport.getCategory() != null ? savedReport.getCategory().getDisplayName() : "Emergency") + " at " + (savedReport.getAddress() != null ? savedReport.getAddress() : "Coordinates logged"),
                    "ALERT",
                    reportId
            );
        }

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(savedReport);
        dto.setStatusHistory(loadStatusHistoryDTOs(savedReport.getId()));
        return dto;
    }

    @Override
    public EmergencyReportResponseDTO createSosReport(String citizenEmail, com.safecity.dto.SosRequestDTO request) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Citizen user not found with email: " + citizenEmail));

        String reportId = generateUniqueReportId();
        String note = request.getNote() != null && !request.getNote().isBlank() ? request.getNote().trim() : "Direct distress signal triggered.";
        String description = "🚨 EMERGENCY SOS DISTRESS SIGNAL ACTIVATED. " + note;
        Double lat = request.getLatitude();
        Double lng = request.getLongitude();
        String address = request.getAddress() != null && !request.getAddress().isBlank()
                ? request.getAddress().trim()
                : (lat != null && lng != null ? "GPS Coordinates: " + lat + ", " + lng : null);

        if (lat == null && lng == null && (address == null || address.isBlank())) {
            throw new IllegalArgumentException("Valid location is required for SOS alert. Please provide GPS coordinates or enter a landmark/address.");
        }

        EmergencyReport report = new EmergencyReport(
                reportId,
                citizen,
                com.safecity.entity.IncidentCategory.CRIME,
                description,
                ReportPriority.CRITICAL,
                lat,
                lng,
                address,
                LocalDateTime.now(),
                null
        );

        EmergencyReport savedReport = reportRepository.save(report);
        recordStatusChange(savedReport, null, ReportStatus.SUBMITTED, citizen, "Emergency SOS distress signal triggered by citizen.");

        // Notifications
        notificationService.createNotification(
                citizen,
                "🚨 SOS Distress Signal Dispatched",
                "Your emergency SOS distress signal (Ref: " + reportId + ") has been sent to public safety dispatch.",
                "SOS",
                reportId
        );

        notificationService.notifyAdminsAndResponders(
                "🚨 CRITICAL SOS ALERT",
                "Emergency SOS activated by " + citizen.getFullName() + " at " + address + ". Priority: CRITICAL.",
                "SOS",
                reportId
        );

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(savedReport);
        dto.setStatusHistory(loadStatusHistoryDTOs(savedReport.getId()));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyReportResponseDTO> getMyReports(String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<EmergencyReport> reports = reportRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId());
        return reports.stream()
                .map(EmergencyReportResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryDTO getMyReportSummary(String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        long total = reportRepository.countByCitizenId(citizen.getId());
        long active = reportRepository.countActiveByCitizenId(citizen.getId(), Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED));
        long resolved = reportRepository.countByCitizenIdAndStatus(citizen.getId(), ReportStatus.RESOLVED);

        return new ReportSummaryDTO(total, active, resolved);
    }

    @Override
    @Transactional(readOnly = true)
    public EmergencyReportResponseDTO getReportByIdForCitizen(String citizenEmail, Long reportId) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));

        if (!report.getCitizen().getId().equals(citizen.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to view this report.");
        }

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(report);
        List<ResponseNote> notes = responseNoteRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        dto.setNotes(notes.stream().map(ResponseNoteDTO::fromEntity).collect(Collectors.toList()));
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    @Override
    public Resource loadEvidenceAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Evidence file not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Evidence file not found: " + fileName, ex);
        }
    }

    // Admin Operations (Phase 4A)
    @Override
    @Transactional(readOnly = true)
    public AdminDashboardSummaryDTO getAdminDashboardSummary() {
        long total = reportRepository.count();
        long submitted = reportRepository.countByStatus(ReportStatus.SUBMITTED);
        long underReview = reportRepository.countByStatus(ReportStatus.UNDER_REVIEW);
        long verified = reportRepository.countByStatus(ReportStatus.VERIFIED);
        long assigned = reportRepository.countByStatus(ReportStatus.ASSIGNED);
        long active = reportRepository.countActiveReports(Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED));
        long resolved = reportRepository.countByStatus(ReportStatus.RESOLVED);

        return new AdminDashboardSummaryDTO(total, submitted, underReview, verified, assigned, active, resolved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyReportResponseDTO> getAllReportsForAdmin() {
        List<EmergencyReport> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        return reports.stream()
                .map(EmergencyReportResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmergencyReportResponseDTO getReportByIdForAdmin(Long reportId) {
        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));
        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(report);
        List<ResponseNote> notes = responseNoteRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        dto.setNotes(notes.stream().map(ResponseNoteDTO::fromEntity).collect(Collectors.toList()));
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    @Override
    public EmergencyReportResponseDTO updateReportStatusByAdmin(Long reportId, ReportStatus newStatus) {
        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));

        ReportStatus prevStatus = report.getStatus();
        report.setStatus(newStatus);
        EmergencyReport updatedReport = reportRepository.save(report);

        if (newStatus == ReportStatus.RESOLVED || newStatus == ReportStatus.CLOSED) {
            resourceService.autoReleaseResourcesForReport(updatedReport.getId());
        }

        // Audit Trail: Admin Status Transition
        recordStatusChange(updatedReport, prevStatus, newStatus, null, "Incident status updated by system administrator.");

        // Notification to Citizen
        notificationService.createNotification(
                updatedReport.getCitizen(),
                "Report Status Updated",
                "Your emergency report " + updatedReport.getReportId() + " status is now " + newStatus.name() + ".",
                "STATUS_CHANGE",
                updatedReport.getReportId()
        );

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(updatedReport);
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    @Override
    public EmergencyReportResponseDTO updateReportPriorityByAdmin(Long reportId, ReportPriority newPriority) {
        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));

        report.setPriority(newPriority);
        EmergencyReport updatedReport = reportRepository.save(report);
        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(updatedReport);
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    // Responder Management & Assignment (Phase 4B)
    @Override
    @Transactional(readOnly = true)
    public List<ResponderDTO> getAllRespondersForAdmin() {
        List<User> responders = userRepository.findByRole(Role.RESPONDER);
        return responders.stream().map(responder -> {
            long active = reportRepository.countActiveByAssignedResponderId(responder.getId(), Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED));
            long total = reportRepository.countByAssignedResponderId(responder.getId());
            long completed = reportRepository.countByAssignedResponderIdAndStatus(responder.getId(), ReportStatus.RESOLVED);
            return ResponderDTO.fromUser(responder, active, total, completed);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResponderDTO getResponderWorkload(Long responderId) {
        User responder = userRepository.findById(responderId)
                .orElseThrow(() -> new IllegalArgumentException("Responder not found with ID: " + responderId));

        if (responder.getRole() != Role.RESPONDER) {
            throw new IllegalArgumentException("User is not a RESPONDER.");
        }

        long active = reportRepository.countActiveByAssignedResponderId(responder.getId(), Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED));
        long total = reportRepository.countByAssignedResponderId(responder.getId());
        long completed = reportRepository.countByAssignedResponderIdAndStatus(responder.getId(), ReportStatus.RESOLVED);

        return ResponderDTO.fromUser(responder, active, total, completed);
    }

    @Override
    public EmergencyReportResponseDTO assignResponderToReport(Long reportId, Long responderId) {
        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getStatus() != ReportStatus.VERIFIED) {
            if (report.getStatus() == ReportStatus.ASSIGNED) {
                throw new IllegalArgumentException("Report is already assigned to a responder.");
            }
            throw new IllegalArgumentException("Only VERIFIED emergency reports can be assigned to first responders.");
        }

        User responder = userRepository.findById(responderId)
                .orElseThrow(() -> new IllegalArgumentException("Responder not found with ID: " + responderId));

        if (responder.getRole() != Role.RESPONDER) {
            throw new IllegalArgumentException("Invalid assignment: Target user is not a first RESPONDER.");
        }

        if (!responder.isEnabled()) {
            throw new IllegalArgumentException("Selected responder account is disabled and cannot receive assignments.");
        }

        ReportStatus prevStatus = report.getStatus();
        report.setAssignedResponder(responder);
        report.setStatus(ReportStatus.ASSIGNED);

        EmergencyReport savedReport = reportRepository.save(report);

        // Audit Trail: Admin Responder Assignment
        recordStatusChange(savedReport, prevStatus, ReportStatus.ASSIGNED, responder, "Assigned to first responder unit: " + responder.getFullName());

        // Notifications
        notificationService.createNotification(
                responder,
                "New Emergency Assignment",
                "You have been assigned to emergency report " + savedReport.getReportId() + ".",
                "ASSIGNMENT",
                savedReport.getReportId()
        );

        notificationService.createNotification(
                savedReport.getCitizen(),
                "First Responder Assigned",
                "First responder unit (" + responder.getFullName() + ") has been assigned to your report " + savedReport.getReportId() + ".",
                "INFO",
                savedReport.getReportId()
        );

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(savedReport);
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    // Responder Portal & Emergency Response Operations (Phase 4C)
    @Override
    @Transactional(readOnly = true)
    public ResponderDashboardSummaryDTO getResponderDashboardSummary(String responderEmail) {
        User responder = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Responder user not found"));

        long totalAssigned = reportRepository.countByAssignedResponderId(responder.getId());
        long active = reportRepository.countActiveByAssignedResponderId(responder.getId(), Arrays.asList(ReportStatus.RESOLVED, ReportStatus.CLOSED));
        long completed = reportRepository.countByAssignedResponderIdAndStatus(responder.getId(), ReportStatus.RESOLVED);
        long highCritical = reportRepository.countByAssignedResponderIdAndPriorityIn(responder.getId(), Arrays.asList(ReportPriority.HIGH, ReportPriority.CRITICAL));

        return new ResponderDashboardSummaryDTO(totalAssigned, active, completed, highCritical);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyReportResponseDTO> getAssignedEmergenciesForResponder(String responderEmail) {
        User responder = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Responder user not found"));

        List<EmergencyReport> reports = reportRepository.findByAssignedResponderIdOrderByCreatedAtDesc(responder.getId());
        return reports.stream()
                .map(EmergencyReportResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmergencyReportResponseDTO getEmergencyByIdForResponder(String responderEmail, Long reportId) {
        User responder = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Responder user not found"));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getAssignedResponder() == null || !report.getAssignedResponder().getId().equals(responder.getId())) {
            throw new AccessDeniedException("Access denied: You are not assigned to this emergency report.");
        }

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(report);
        List<ResponseNote> notes = responseNoteRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        dto.setNotes(notes.stream().map(ResponseNoteDTO::fromEntity).collect(Collectors.toList()));
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    @Override
    public EmergencyReportResponseDTO acceptAssignmentByResponder(String responderEmail, Long reportId) {
        User responder = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Responder user not found"));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getAssignedResponder() == null || !report.getAssignedResponder().getId().equals(responder.getId())) {
            throw new AccessDeniedException("Access denied: You are not assigned to this emergency report.");
        }

        ReportStatus prevStatus = report.getStatus();
        report.setStatus(ReportStatus.IN_PROGRESS);
        EmergencyReport updatedReport = reportRepository.save(report);

        // Add auto response note
        ResponseNote note = new ResponseNote(updatedReport, responder, "Assignment accepted by responder. Status transitioned to IN_PROGRESS.");
        responseNoteRepository.save(note);

        // Audit Trail: Responder Acceptance & Response Start
        recordStatusChange(updatedReport, prevStatus, ReportStatus.IN_PROGRESS, responder, "Assignment accepted and emergency response started by responder.");

        // Notification to Citizen
        notificationService.createNotification(
                updatedReport.getCitizen(),
                "Response Started",
                "Responder " + responder.getFullName() + " has accepted assignment and is responding to your report (" + updatedReport.getReportId() + ").",
                "STATUS_CHANGE",
                updatedReport.getReportId()
        );

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(updatedReport);
        List<ResponseNote> notes = responseNoteRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        dto.setNotes(notes.stream().map(ResponseNoteDTO::fromEntity).collect(Collectors.toList()));
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    @Override
    public EmergencyReportResponseDTO startResponseByResponder(String responderEmail, Long reportId) {
        return acceptAssignmentByResponder(responderEmail, reportId);
    }

    @Override
    public EmergencyReportResponseDTO resolveEmergencyByResponder(String responderEmail, Long reportId) {
        User responder = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Responder user not found"));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getAssignedResponder() == null || !report.getAssignedResponder().getId().equals(responder.getId())) {
            throw new AccessDeniedException("Access denied: You are not assigned to this emergency report.");
        }

        ReportStatus prevStatus = report.getStatus();
        report.setStatus(ReportStatus.RESOLVED);
        EmergencyReport updatedReport = reportRepository.save(report);

        // Auto release dispatched physical resources
        resourceService.autoReleaseResourcesForReport(updatedReport.getId());

        // Add auto response note
        ResponseNote note = new ResponseNote(updatedReport, responder, "Emergency successfully resolved by first responder.");
        responseNoteRepository.save(note);

        // Audit Trail: Responder Resolution
        recordStatusChange(updatedReport, prevStatus, ReportStatus.RESOLVED, responder, "Emergency incident marked as resolved by first responder unit.");

        // Notification to Citizen
        notificationService.createNotification(
                updatedReport.getCitizen(),
                "Emergency Resolved",
                "Your emergency report " + updatedReport.getReportId() + " has been marked as RESOLVED.",
                "STATUS_CHANGE",
                updatedReport.getReportId()
        );

        EmergencyReportResponseDTO dto = EmergencyReportResponseDTO.fromEntity(updatedReport);
        List<ResponseNote> notes = responseNoteRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        dto.setNotes(notes.stream().map(ResponseNoteDTO::fromEntity).collect(Collectors.toList()));
        dto.setStatusHistory(loadStatusHistoryDTOs(reportId));
        return dto;
    }

    @Override
    public ResponseNoteDTO addResponseNoteByResponder(String responderEmail, Long reportId, String noteText) {
        User responder = userRepository.findByEmail(responderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Responder user not found"));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (report.getAssignedResponder() == null || !report.getAssignedResponder().getId().equals(responder.getId())) {
            throw new AccessDeniedException("Access denied: You are not assigned to this emergency report.");
        }

        ResponseNote note = new ResponseNote(report, responder, noteText.trim());
        ResponseNote savedNote = responseNoteRepository.save(note);
        return ResponseNoteDTO.fromEntity(savedNote);
    }

    // Status History & Audit Log Operations (Phase 4D)
    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getStatusHistoryForReport(String userEmail, Long reportId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency report not found with ID: " + reportId));

        if (user.getRole() == Role.CITIZEN) {
            if (!report.getCitizen().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You can only view status history for your own reports.");
            }
        } else if (user.getRole() == Role.RESPONDER) {
            if (report.getAssignedResponder() == null || !report.getAssignedResponder().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You can only view status history for emergency reports assigned to you.");
            }
        }

        return loadStatusHistoryDTOs(reportId);
    }

    // Geospatial Map Operations (Phase 5B)
    @Override
    @Transactional(readOnly = true)
    public List<EmergencyMapMarkerDTO> getEmergencyMapMarkers() {
        List<EmergencyReport> reports = reportRepository.findReportsWithValidCoordinates();
        return reports.stream()
                .map(EmergencyMapMarkerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private synchronized String generateUniqueReportId() {
        int currentYear = Year.now().getValue();
        long count = reportRepository.count() + 101;
        String candidateId;

        do {
            candidateId = String.format("SC-%d-%06d", currentYear, count);
            count++;
        } while (reportRepository.findByReportId(candidateId).isPresent());

        return candidateId;
    }

    private String storeEvidenceFile(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "evidence.jpg");
        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        List<String> allowedExtensions = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPG, PNG, and WEBP images are supported.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB.");
        }

        String fileName = UUID.randomUUID().toString() + extension.toLowerCase();

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
