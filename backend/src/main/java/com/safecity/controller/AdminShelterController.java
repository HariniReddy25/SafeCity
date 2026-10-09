package com.safecity.controller;

import com.safecity.dto.*;
import com.safecity.service.ShelterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shelters")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminShelterController {

    @Autowired
    private ShelterService shelterService;

    @PostMapping
    public ResponseEntity<ShelterDTO> createShelter(@Valid @RequestBody CreateShelterRequestDTO request) {
        ShelterDTO created = shelterService.createShelter(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ShelterDTO>> getAllShelters() {
        List<ShelterDTO> shelters = shelterService.getAllSheltersForAdmin();
        return ResponseEntity.ok(shelters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShelterDTO> getShelterById(@PathVariable("id") Long id) {
        ShelterDTO shelter = shelterService.getShelterById(id);
        return ResponseEntity.ok(shelter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShelterDTO> updateShelter(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateShelterRequestDTO request) {
        ShelterDTO updated = shelterService.updateShelter(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ShelterDTO> updateShelterStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateShelterStatusRequestDTO request) {
        ShelterDTO updated = shelterService.updateShelterStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/occupancy")
    public ResponseEntity<ShelterDTO> updateShelterOccupancy(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateShelterOccupancyRequestDTO request) {
        ShelterDTO updated = shelterService.updateShelterOccupancy(id, request.getCurrentOccupancy());
        return ResponseEntity.ok(updated);
    }
}
