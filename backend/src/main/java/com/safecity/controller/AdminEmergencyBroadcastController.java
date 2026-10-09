package com.safecity.controller;

import com.safecity.dto.CreateEmergencyBroadcastRequestDTO;
import com.safecity.dto.EmergencyBroadcastResponseDTO;
import com.safecity.service.EmergencyBroadcastService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/broadcasts")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminEmergencyBroadcastController {

    @Autowired
    private EmergencyBroadcastService broadcastService;

    @PostMapping
    public ResponseEntity<EmergencyBroadcastResponseDTO> createBroadcast(
            @Valid @RequestBody CreateEmergencyBroadcastRequestDTO request,
            Authentication authentication) {
        String adminEmail = authentication.getName();
        EmergencyBroadcastResponseDTO result = broadcastService.createBroadcast(request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<EmergencyBroadcastResponseDTO>> getAllBroadcasts() {
        List<EmergencyBroadcastResponseDTO> broadcasts = broadcastService.getAllBroadcastsForAdmin();
        return ResponseEntity.ok(broadcasts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyBroadcastResponseDTO> getBroadcastById(@PathVariable("id") Long id) {
        EmergencyBroadcastResponseDTO result = broadcastService.getBroadcastById(id);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<EmergencyBroadcastResponseDTO> cancelBroadcast(
            @PathVariable("id") Long id,
            Authentication authentication) {
        String adminEmail = authentication.getName();
        EmergencyBroadcastResponseDTO result = broadcastService.cancelBroadcast(id, adminEmail);
        return ResponseEntity.ok(result);
    }
}
