package com.safecity.controller;

import com.safecity.dto.*;
import com.safecity.entity.VolunteerApprovalStatus;
import com.safecity.entity.VolunteerAvailability;
import com.safecity.entity.VolunteerTaskStatus;
import com.safecity.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/volunteers")
@CrossOrigin(origins = "*")
public class AdminVolunteerController {

    private final VolunteerService volunteerService;

    @Autowired
    public AdminVolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESPONDER')")
    public ResponseEntity<List<VolunteerProfileDTO>> getAllVolunteers(
            @RequestParam(value = "approvalStatus", required = false) VolunteerApprovalStatus approvalStatus,
            @RequestParam(value = "availability", required = false) VolunteerAvailability availability) {
        List<VolunteerProfileDTO> profiles = volunteerService.getAllVolunteerProfiles(approvalStatus, availability);
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESPONDER')")
    public ResponseEntity<VolunteerProfileDTO> getVolunteerById(@PathVariable("id") Long id) {
        VolunteerProfileDTO profile = volunteerService.getVolunteerProfileById(id);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VolunteerProfileDTO> updateApprovalStatus(
            @PathVariable("id") Long id,
            @RequestBody UpdateVolunteerApprovalRequestDTO request) {
        VolunteerApprovalStatus status = request != null ? request.getApprovalStatus() : VolunteerApprovalStatus.APPROVED;
        String reason = request != null ? request.getReason() : null;
        VolunteerProfileDTO profile = volunteerService.updateVolunteerApproval(id, status, reason);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/opportunities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VolunteerTaskAssignmentDTO> createOpportunity(
            @RequestBody CreateVolunteerTaskRequestDTO request) {
        VolunteerTaskAssignmentDTO opportunity = volunteerService.createCommunityOpportunity(request);
        return new ResponseEntity<>(opportunity, HttpStatus.CREATED);
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESPONDER')")
    public ResponseEntity<List<VolunteerTaskAssignmentDTO>> getAllTasks(
            @RequestParam(value = "status", required = false) VolunteerTaskStatus status) {
        List<VolunteerTaskAssignmentDTO> tasks = volunteerService.getAllTasks(status);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/tasks/{taskId}/review")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RESPONDER')")
    public ResponseEntity<VolunteerTaskAssignmentDTO> reviewTask(
            @PathVariable("taskId") Long taskId,
            @RequestBody ReviewVolunteerTaskRequestDTO request) {
        VolunteerTaskStatus status = request != null ? request.getStatus() : VolunteerTaskStatus.APPROVED;
        String notes = request != null ? request.getNotes() : null;
        VolunteerTaskAssignmentDTO task = volunteerService.reviewTaskRequest(taskId, status, notes);
        return ResponseEntity.ok(task);
    }
}
