package com.safecity.controller;

import com.safecity.dto.EmergencyBroadcastResponseDTO;
import com.safecity.service.EmergencyBroadcastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/broadcasts")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*")
public class PublicEmergencyBroadcastController {

    @Autowired
    private EmergencyBroadcastService broadcastService;

    @GetMapping("/active")
    public ResponseEntity<List<EmergencyBroadcastResponseDTO>> getActiveBroadcasts() {
        List<EmergencyBroadcastResponseDTO> activeList = broadcastService.getActiveBroadcasts();
        return ResponseEntity.ok(activeList);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<EmergencyBroadcastResponseDTO>> getNearbyBroadcasts(
            @RequestParam(name = "lat", required = false) Double lat,
            @RequestParam(name = "lon", required = false) Double lon) {
        List<EmergencyBroadcastResponseDTO> nearbyList = broadcastService.getNearbyActiveBroadcasts(lat, lon);
        return ResponseEntity.ok(nearbyList);
    }
}
