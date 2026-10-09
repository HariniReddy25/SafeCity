package com.safecity.controller;

import com.safecity.dto.HealthResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public ResponseEntity<HealthResponseDTO> checkHealth() {
        String dbStatus = "DISCONNECTED";

        if (jdbcTemplate != null) {
            try {
                Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                if (result != null && result == 1) {
                    dbStatus = "CONNECTED";
                }
            } catch (Exception e) {
                dbStatus = "ERROR: " + e.getMessage();
            }
        }

        HealthResponseDTO response = new HealthResponseDTO(
                "OK",
                "SafeCity backend is running",
                dbStatus,
                LocalDateTime.now(),
                "1.0.0-PHASE1"
        );

        return ResponseEntity.ok(response);
    }
}
