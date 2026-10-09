package com.safecity.service;

import com.safecity.dto.CreateResourceRequestDTO;
import com.safecity.dto.ResourceResponseDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.MasterIncidentRepository;
import com.safecity.repository.ResourceRepository;
import com.safecity.repository.StatusHistoryRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.impl.ResourceServiceImpl;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private EmergencyReportRepository reportRepository;

    @Mock
    private MasterIncidentRepository masterIncidentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private User testCitizen;
    private User testResponder;
    private User testCitizenRoleUser;
    private EmergencyReport activeReport;
    private EmergencyReport resolvedReport;
    private Resource availableResource;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Citizen User", "citizen@test.com", "+1-555-0000", "password", Role.CITIZEN);
        testCitizen.setId(1L);

        testResponder = new User("Responder Unit #1", "responder1@test.com", "+1-555-1111", "password", Role.RESPONDER);
        testResponder.setId(2L);

        testCitizenRoleUser = new User("Non Responder User", "nonresp@test.com", "+1-555-2222", "password", Role.CITIZEN);
        testCitizenRoleUser.setId(3L);

        activeReport = new EmergencyReport(
                "SC-2026-0001", testCitizen, IncidentCategory.FIRE, "Structure fire",
                ReportPriority.HIGH, 17.3850, 78.4867, "Abids", LocalDateTime.now(), null
        );
        activeReport.setId(101L);
        activeReport.setStatus(ReportStatus.VERIFIED);

        resolvedReport = new EmergencyReport(
                "SC-2026-0002", testCitizen, IncidentCategory.MEDICAL_EMERGENCY, "Cardiac event",
                ReportPriority.HIGH, 17.3850, 78.4867, "Abids", LocalDateTime.now(), null
        );
        resolvedReport.setId(102L);
        resolvedReport.setStatus(ReportStatus.RESOLVED);

        availableResource = new Resource(
                "AMB-01", "Cardiac Ambulance #1", ResourceType.AMBULANCE, ResourceStatus.AVAILABLE,
                17.3850, 78.4867, "Abids Depot"
        );
        availableResource.setId(501L);
    }

    @Test
    @DisplayName("Create Resource -> Saves and returns DTO")
    void testCreateResource_Success() {
        CreateResourceRequestDTO request = new CreateResourceRequestDTO(
                "AMB-02", "Trauma Ambulance #2", ResourceType.AMBULANCE, 17.38, 78.48, "Depot #2", null
        );

        when(resourceRepository.findByResourceCode("AMB-02")).thenReturn(Optional.empty());
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> {
            Resource r = i.getArgument(0);
            r.setId(502L);
            return r;
        });

        ResourceResponseDTO response = resourceService.createResource(request);

        assertNotNull(response);
        assertEquals("AMB-02", response.getResourceCode());
        assertEquals(ResourceStatus.AVAILABLE, response.getStatus());
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    @DisplayName("List Resources & Available Resources")
    void testListResources() {
        when(resourceRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(availableResource));
        when(resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.AVAILABLE)).thenReturn(Collections.singletonList(availableResource));

        List<ResourceResponseDTO> all = resourceService.getAllResources(null, null);
        List<ResourceResponseDTO> avail = resourceService.getAvailableResources();

        assertEquals(1, all.size());
        assertEquals(1, avail.size());
        assertEquals("AMB-01", all.get(0).getResourceCode());
    }

    @Test
    @DisplayName("Dispatch Available Resource -> Status becomes DISPATCHED and assigns report")
    void testDispatchResource_Success() {
        when(resourceRepository.findById(501L)).thenReturn(Optional.of(availableResource));
        when(reportRepository.findById(101L)).thenReturn(Optional.of(activeReport));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));

        ResourceResponseDTO dto = resourceService.dispatchResourceToReport(101L, 501L, null);

        assertNotNull(dto);
        assertEquals(ResourceStatus.DISPATCHED, dto.getStatus());
        assertEquals(101L, dto.getAssignedReportId());
        verify(statusHistoryRepository).save(any(StatusHistory.class));
        verify(notificationService).notifyAdminsAndResponders(anyString(), anyString(), eq("RESOURCE_DISPATCH"), eq("SC-2026-0001"));
    }

    @Test
    @DisplayName("Dispatch Unavailable Resource -> Throws IllegalStateException")
    void testDispatchUnavailableResource_Fails() {
        availableResource.setStatus(ResourceStatus.MAINTENANCE);
        when(resourceRepository.findById(501L)).thenReturn(Optional.of(availableResource));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            resourceService.dispatchResourceToReport(101L, 501L, null);
        });

        assertTrue(ex.getMessage().contains("not available for dispatch"));
    }

    @Test
    @DisplayName("Dispatch to RESOLVED/CLOSED Report -> Throws IllegalStateException")
    void testDispatchToResolvedReport_Fails() {
        when(resourceRepository.findById(501L)).thenReturn(Optional.of(availableResource));
        when(reportRepository.findById(102L)).thenReturn(Optional.of(resolvedReport));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            resourceService.dispatchResourceToReport(102L, 501L, null);
        });

        assertTrue(ex.getMessage().contains("RESOLVED or CLOSED"));
    }

    @Test
    @DisplayName("Assignment Invariant: Cannot assign to both Report and MasterIncident simultaneously")
    void testAssignmentInvariant_ViolationThrowsException() {
        MasterIncident masterIncident = new MasterIncident("MI-2026-000001", "Master Fire Incident",
                IncidentCategory.FIRE, ReportPriority.HIGH, 17.38, 78.48, "Abids");
        masterIncident.setId(10L);

        availableResource.setAssignedReport(activeReport);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            availableResource.setAssignedMasterIncident(masterIncident);
        });

        assertTrue(ex.getMessage().contains("Assignment Invariant Violation"));
    }

    @Test
    @DisplayName("Release Resource -> Status becomes AVAILABLE and clears assignment")
    void testReleaseResource_Success() {
        availableResource.setStatus(ResourceStatus.DISPATCHED);
        availableResource.setAssignedReport(activeReport);

        when(resourceRepository.findById(501L)).thenReturn(Optional.of(availableResource));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));

        ResourceResponseDTO dto = resourceService.releaseResourceFromReport(101L, 501L);

        assertNotNull(dto);
        assertEquals(ResourceStatus.AVAILABLE, dto.getStatus());
        assertNull(dto.getAssignedReportId());
        verify(statusHistoryRepository).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Release Resource Assigned Elsewhere -> Throws IllegalArgumentException")
    void testReleaseResourceAssignedElsewhere_Fails() {
        availableResource.setStatus(ResourceStatus.DISPATCHED);
        availableResource.setAssignedReport(activeReport); // assigned to 101L

        when(resourceRepository.findById(501L)).thenReturn(Optional.of(availableResource));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            resourceService.releaseResourceFromReport(999L, 501L); // trying to release from 999L
        });

        assertTrue(ex.getMessage().contains("not assigned to emergency report ID"));
    }

    @Test
    @DisplayName("Invalid Operator Role -> Throws IllegalArgumentException")
    void testInvalidOperatorRole_Fails() {
        CreateResourceRequestDTO request = new CreateResourceRequestDTO(
                "AMB-03", "Ambulance #3", ResourceType.AMBULANCE, 17.38, 78.48, "Depot", 3L
        );

        when(resourceRepository.findByResourceCode("AMB-03")).thenReturn(Optional.empty());
        when(userRepository.findById(3L)).thenReturn(Optional.of(testCitizenRoleUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            resourceService.createResource(request);
        });

        assertTrue(ex.getMessage().contains("User is not a RESPONDER"));
    }

    @Test
    @DisplayName("Valid Responder Operator -> Dispatches successfully with operator")
    void testValidResponderOperator_Success() {
        when(resourceRepository.findById(501L)).thenReturn(Optional.of(availableResource));
        when(reportRepository.findById(101L)).thenReturn(Optional.of(activeReport));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testResponder));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));

        ResourceResponseDTO dto = resourceService.dispatchResourceToReport(101L, 501L, 2L);

        assertNotNull(dto);
        assertEquals(2L, dto.getAssignedOperatorId());
        assertEquals("Responder Unit #1", dto.getAssignedOperatorName());
        verify(notificationService).createNotification(eq(testResponder), anyString(), anyString(), eq("RESOURCE_DISPATCH"), eq("SC-2026-0001"));
    }

    @Test
    @DisplayName("Auto Release on Emergency Resolution -> Releases all dispatched resources for report")
    void testAutoReleaseResourcesForReport() {
        availableResource.setStatus(ResourceStatus.DISPATCHED);
        availableResource.setAssignedReport(activeReport);

        when(resourceRepository.findByAssignedReportId(101L)).thenReturn(Collections.singletonList(availableResource));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));

        resourceService.autoReleaseResourcesForReport(101L);

        assertEquals(ResourceStatus.AVAILABLE, availableResource.getStatus());
        assertNull(availableResource.getAssignedReport());
        verify(resourceRepository).save(availableResource);
    }
}
