package com.safecity.controller;

import com.safecity.dto.OperationalAnalyticsDTO;
import com.safecity.service.OperationalAnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsControllerTest {

    @Mock
    private OperationalAnalyticsService analyticsService;

    @InjectMocks
    private AdminAnalyticsController adminAnalyticsController;

    private OperationalAnalyticsDTO mockAnalyticsDto;

    @BeforeEach
    void setUp() {
        mockAnalyticsDto = new OperationalAnalyticsDTO();
        mockAnalyticsDto.setTotalIncidents(10L);
        mockAnalyticsDto.setSlaComplianceRate(90.0);
        mockAnalyticsDto.setResourceUtilizationRate(40.0);
        mockAnalyticsDto.setDeduplicationRatio(20.0);
        mockAnalyticsDto.setEscalationRate(10.0);
    }

    @Test
    @DisplayName("Admin Controller -> GET /api/admin/analytics/overview returns 200 OK with analytics data")
    void testGetOperationalAnalytics_Success() {
        when(analyticsService.getOperationalAnalytics()).thenReturn(mockAnalyticsDto);

        ResponseEntity<OperationalAnalyticsDTO> response = adminAnalyticsController.getOperationalAnalytics();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(10L, response.getBody().getTotalIncidents());
        assertEquals(90.0, response.getBody().getSlaComplianceRate());
        assertEquals(40.0, response.getBody().getResourceUtilizationRate());
        verify(analyticsService).getOperationalAnalytics();
    }
}
