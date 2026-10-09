package com.safecity.controller;

import com.safecity.dto.OperationalAnalyticsDTO;
import com.safecity.service.OperationalAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminAnalyticsController {

    @Autowired
    private OperationalAnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<OperationalAnalyticsDTO> getOperationalAnalytics() {
        OperationalAnalyticsDTO analytics = analyticsService.getOperationalAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
