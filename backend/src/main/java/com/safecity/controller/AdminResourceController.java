package com.safecity.controller;

import com.safecity.dto.CreateResourceRequestDTO;
import com.safecity.dto.ResourceDispatchRequestDTO;
import com.safecity.dto.ResourceResponseDTO;
import com.safecity.entity.ResourceStatus;
import com.safecity.entity.ResourceType;
import com.safecity.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminResourceController {

    @Autowired
    private ResourceService resourceService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/resources")
    public ResponseEntity<ResourceResponseDTO> createResource(@Valid @RequestBody CreateResourceRequestDTO request) {
        ResourceResponseDTO response = resourceService.createResource(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/resources")
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources(
            @RequestParam(name = "status", required = false) ResourceStatus status,
            @RequestParam(name = "type", required = false) ResourceType type) {

        List<ResourceResponseDTO> resources = resourceService.getAllResources(status, type);
        return ResponseEntity.ok(resources);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/resources/available")
    public ResponseEntity<List<ResourceResponseDTO>> getAvailableResources() {
        List<ResourceResponseDTO> resources = resourceService.getAvailableResources();
        return ResponseEntity.ok(resources);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('RESPONDER')")
    @GetMapping("/reports/{reportId}/resources")
    public ResponseEntity<List<ResourceResponseDTO>> getResourcesForReport(@PathVariable("reportId") Long reportId) {
        List<ResourceResponseDTO> resources = resourceService.getResourcesForReport(reportId);
        return ResponseEntity.ok(resources);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/reports/{reportId}/resources/{resourceId}/dispatch")
    public ResponseEntity<ResourceResponseDTO> dispatchResource(
            @PathVariable("reportId") Long reportId,
            @PathVariable("resourceId") Long resourceId,
            @RequestBody(required = false) ResourceDispatchRequestDTO request) {

        Long operatorId = request != null ? request.getOperatorId() : null;
        ResourceResponseDTO dispatched = resourceService.dispatchResourceToReport(reportId, resourceId, operatorId);
        return ResponseEntity.ok(dispatched);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/reports/{reportId}/resources/{resourceId}/release")
    public ResponseEntity<ResourceResponseDTO> releaseResource(
            @PathVariable("reportId") Long reportId,
            @PathVariable("resourceId") Long resourceId) {

        ResourceResponseDTO released = resourceService.releaseResourceFromReport(reportId, resourceId);
        return ResponseEntity.ok(released);
    }
}
