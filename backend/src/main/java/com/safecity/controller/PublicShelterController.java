package com.safecity.controller;

import com.safecity.dto.NearbyShelterDTO;
import com.safecity.dto.ShelterDTO;
import com.safecity.service.ShelterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shelters")
@CrossOrigin(origins = "*")
public class PublicShelterController {

    @Autowired
    private ShelterService shelterService;

    @GetMapping("/available")
    public ResponseEntity<List<ShelterDTO>> getAvailableShelters() {
        List<ShelterDTO> shelters = shelterService.getAvailableSheltersForPublic();
        return ResponseEntity.ok(shelters);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyShelterDTO>> getNearbyShelters(
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lon", required = false) Double lon) {
        List<NearbyShelterDTO> nearbyShelters = shelterService.getNearbySheltersForPublic(lat, lon);
        return ResponseEntity.ok(nearbyShelters);
    }
}
