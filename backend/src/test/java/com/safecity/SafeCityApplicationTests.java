package com.safecity;

import com.safecity.controller.HealthController;
import com.safecity.dto.HealthResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
class SafeCityApplicationTests {

    @Autowired
    private HealthController healthController;

    @Test
    void contextLoads() {
        assertNotNull(healthController, "HealthController should be initialized in Spring context");
    }

    @Test
    void testHealthCheckEndpoint() {
        ResponseEntity<HealthResponseDTO> response = healthController.checkHealth();
        assertEquals(HttpStatus.OK, response.getStatusCode(), "Status code should be 200 OK");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertEquals("OK", response.getBody().getStatus(), "Status field should be OK");
        assertEquals("SafeCity backend is running", response.getBody().getMessage(), "Message should match expected text");
    }
}
