package com.safecity.controller;

import com.safecity.dto.*;
import com.safecity.entity.User;
import com.safecity.entity.VolunteerAvailability;
import com.safecity.repository.UserRepository;
import com.safecity.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@CrossOrigin(origins = "*")
public class VolunteerController {

    private final VolunteerService volunteerService;
    private final UserRepository userRepository;

    @Autowired
    public VolunteerController(VolunteerService volunteerService, UserRepository userRepository) {
        this.volunteerService = volunteerService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + authentication.getName()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<VolunteerProfileDTO> registerVolunteer(
            Authentication authentication,
            @RequestBody RegisterVolunteerRequestDTO request) {
        User user = getAuthenticatedUser(authentication);
        VolunteerProfileDTO profile = volunteerService.registerVolunteer(user, request != null ? request : new RegisterVolunteerRequestDTO());
        return new ResponseEntity<>(profile, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<VolunteerProfileDTO> getMyProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        VolunteerProfileDTO profile = volunteerService.getMyVolunteerProfile(user);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<VolunteerProfileDTO> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateVolunteerProfileRequestDTO request) {
        User user = getAuthenticatedUser(authentication);
        VolunteerProfileDTO profile = volunteerService.updateMyVolunteerProfile(user, request);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me/availability")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<VolunteerProfileDTO> updateAvailability(
            Authentication authentication,
            @RequestBody UpdateVolunteerAvailabilityRequestDTO request) {
        User user = getAuthenticatedUser(authentication);
        VolunteerAvailability availability = (request != null && request.getAvailability() != null)
            ? request.getAvailability()
            : VolunteerAvailability.AVAILABLE;
        VolunteerProfileDTO profile = volunteerService.setAvailability(user, availability);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<Void> withdrawProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        volunteerService.withdrawVolunteerProfile(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/opportunities")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VolunteerTaskAssignmentDTO>> getAvailableOpportunities(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<VolunteerTaskAssignmentDTO> opportunities = volunteerService.getAvailableOpportunities(user);
        return ResponseEntity.ok(opportunities);
    }

    @PostMapping("/opportunities/{taskId}/express-willingness")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<VolunteerTaskAssignmentDTO> expressWillingness(
            Authentication authentication,
            @PathVariable("taskId") Long taskId) {
        User user = getAuthenticatedUser(authentication);
        VolunteerTaskAssignmentDTO assignment = volunteerService.expressWillingness(user, taskId);
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/tasks/{taskId}/complete")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<VolunteerTaskAssignmentDTO> markTaskComplete(
            Authentication authentication,
            @PathVariable("taskId") Long taskId) {
        User user = getAuthenticatedUser(authentication);
        VolunteerTaskAssignmentDTO assignment = volunteerService.markTaskComplete(user, taskId);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<List<VolunteerTaskAssignmentDTO>> getMyTaskHistory(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<VolunteerTaskAssignmentDTO> history = volunteerService.getMyTaskHistory(user);
        return ResponseEntity.ok(history);
    }
}
