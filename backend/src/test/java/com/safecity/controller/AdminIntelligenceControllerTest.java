package com.safecity.controller;

import com.safecity.dto.EmergencyIntelligenceResponseDTO;
import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.service.EmergencyResponseIntelligenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminIntelligenceControllerTest {

    @Mock
    private EmergencyResponseIntelligenceService intelligenceService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AdminReportController adminReportController;

    @InjectMocks
    private ResponderReportController responderReportController;

    private EmergencyIntelligenceResponseDTO mockIntelligenceDto;

    @BeforeEach
    void setUp() {
        mockIntelligenceDto = new EmergencyIntelligenceResponseDTO();
        mockIntelligenceDto.setReportId(100L);
        mockIntelligenceDto.setReportCode("SC-2026-0001");
        mockIntelligenceDto.setCategory(IncidentCategory.FIRE);
        mockIntelligenceDto.setPriority(ReportPriority.HIGH);
        mockIntelligenceDto.setSeverityLevel("HIGH");
        mockIntelligenceDto.setSeverityScore(50);
        mockIntelligenceDto.setReadinessScore(80);
    }

    @Test
    @DisplayName("Admin Controller -> GET /api/admin/reports/{id}/intelligence returns 200 OK")
    void testAdminGetReportIntelligence_Success() {
        when(intelligenceService.getReportIntelligence(100L)).thenReturn(mockIntelligenceDto);

        ResponseEntity<EmergencyIntelligenceResponseDTO> response = adminReportController.getReportIntelligence(100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SC-2026-0001", response.getBody().getReportCode());
        assertEquals("HIGH", response.getBody().getSeverityLevel());
        verify(intelligenceService).getReportIntelligence(100L);
    }

    @Test
    @DisplayName("Responder Controller -> Authorized GET /api/responder/emergencies/{id}/intelligence returns 200 OK")
    void testResponderGetEmergencyIntelligence_Success() {
        when(authentication.getName()).thenReturn("responder@safecity.com");
        when(intelligenceService.getResponderEmergencyIntelligence("responder@safecity.com", 100L))
                .thenReturn(mockIntelligenceDto);

        ResponseEntity<EmergencyIntelligenceResponseDTO> response = responderReportController.getEmergencyIntelligence(authentication, 100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("SC-2026-0001", response.getBody().getReportCode());
        verify(intelligenceService).getResponderEmergencyIntelligence("responder@safecity.com", 100L);
    }

    @Test
    @DisplayName("Responder Controller -> Unassigned Responder GET intelligence throws AccessDeniedException")
    void testResponderGetEmergencyIntelligence_UnassignedThrowsAccessDenied() {
        when(authentication.getName()).thenReturn("unassigned@safecity.com");
        when(intelligenceService.getResponderEmergencyIntelligence("unassigned@safecity.com", 100L))
                .thenThrow(new AccessDeniedException("Access denied: You are not assigned to this emergency report."));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            responderReportController.getEmergencyIntelligence(authentication, 100L);
        });

        assertTrue(ex.getMessage().contains("Access denied"));
    }
}
