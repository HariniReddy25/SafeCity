package com.safecity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class RoleTestController {

    @GetMapping("/citizen")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testCitizenAccess(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Citizen access granted");
        response.put("authenticatedUser", authentication.getName());
        response.put("authorities", authentication.getAuthorities());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/responder")
    @PreAuthorize("hasRole('RESPONDER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testResponderAccess(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Responder access granted");
        response.put("authenticatedUser", authentication.getName());
        response.put("authorities", authentication.getAuthorities());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testAdminAccess(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin access granted");
        response.put("authenticatedUser", authentication.getName());
        response.put("authorities", authentication.getAuthorities());
        return ResponseEntity.ok(response);
    }
}
