package com.safecity.service.impl;

import com.safecity.dto.CreateEmergencyBroadcastRequestDTO;
import com.safecity.dto.EmergencyBroadcastResponseDTO;
import com.safecity.entity.EmergencyBroadcast;
import com.safecity.entity.Role;
import com.safecity.entity.User;
import com.safecity.repository.EmergencyBroadcastRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.EmergencyBroadcastService;
import com.safecity.service.NotificationService;
import com.safecity.util.HaversineDistanceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmergencyBroadcastServiceImpl implements EmergencyBroadcastService {

    @Autowired
    private EmergencyBroadcastRepository broadcastRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.safecity.repository.EmergencyReportRepository reportRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public EmergencyBroadcastResponseDTO createBroadcast(CreateEmergencyBroadcastRequestDTO request, String adminEmail) {
        if (request == null) {
            throw new IllegalArgumentException("Broadcast request payload cannot be null.");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Broadcast title is required.");
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Broadcast message content is required.");
        }
        if (request.getSeverity() == null) {
            throw new IllegalArgumentException("Broadcast severity level is required.");
        }
        if (request.getCenterLatitude() == null || request.getCenterLatitude() < -90.0 || request.getCenterLatitude() > 90.0) {
            throw new IllegalArgumentException("Valid center latitude between -90.0 and 90.0 is required.");
        }
        if (request.getCenterLongitude() == null || request.getCenterLongitude() < -180.0 || request.getCenterLongitude() > 180.0) {
            throw new IllegalArgumentException("Valid center longitude between -180.0 and 180.0 is required.");
        }
        if (request.getRadiusKm() == null || request.getRadiusKm() <= 0.0) {
            throw new IllegalArgumentException("Broadcast radius must be greater than zero.");
        }

        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found with email: " + adminEmail));

        EmergencyBroadcast broadcast = new EmergencyBroadcast(
                request.getTitle().trim(),
                request.getMessage().trim(),
                request.getSeverity(),
                request.getCenterLatitude(),
                request.getCenterLongitude(),
                request.getRadiusKm(),
                request.getCategory(),
                adminUser
        );
        broadcast.setActive(true);

        EmergencyBroadcast savedBroadcast = broadcastRepository.save(broadcast);

        // Geo-Fenced Notification Integration
        try {
            List<User> citizens = userRepository.findByRoleAndEnabledTrue(Role.CITIZEN);
            for (User citizen : citizens) {
                List<com.safecity.entity.EmergencyReport> citizenReports = reportRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId());
                if (citizenReports != null && !citizenReports.isEmpty()) {
                    com.safecity.entity.EmergencyReport latestReport = citizenReports.get(0);
                    Double citLat = latestReport.getLatitude();
                    Double citLon = latestReport.getLongitude();

                    if (citLat != null && citLon != null &&
                        citLat >= -90.0 && citLat <= 90.0 &&
                        citLon >= -180.0 && citLon <= 180.0) {

                        Double dist = HaversineDistanceUtil.calculateDistanceKm(
                                citLat, citLon,
                                savedBroadcast.getCenterLatitude(), savedBroadcast.getCenterLongitude()
                        );

                        if (dist != null && dist <= savedBroadcast.getRadiusKm()) {
                            // Citizen is geographically inside radius -> Send targeted notification
                            notificationService.createNotification(
                                    citizen,
                                    "CIVIL DEFENSE ALERT: " + savedBroadcast.getTitle(),
                                    savedBroadcast.getMessage(),
                                    "CIVIL_DEFENSE_BROADCAST",
                                    savedBroadcast.getId().toString()
                            );
                        }
                        // Outside radius -> Do NOT send notification
                    }
                    // Missing/invalid coordinates -> Do NOT send notification based on geographic matching
                }
                // No reports / missing coordinates -> Do NOT send notification based on geographic matching
            }
        } catch (Exception nErr) {
            // Non-blocking notification dispatch safety
        }

        return EmergencyBroadcastResponseDTO.fromEntity(savedBroadcast);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyBroadcastResponseDTO> getActiveBroadcasts() {
        List<EmergencyBroadcast> activeList = broadcastRepository.findByActiveTrueOrderByCreatedAtDesc();
        return activeList.stream()
                .map(EmergencyBroadcastResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyBroadcastResponseDTO> getAllBroadcastsForAdmin() {
        List<EmergencyBroadcast> allList = broadcastRepository.findAllByOrderByCreatedAtDesc();
        return allList.stream()
                .map(EmergencyBroadcastResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmergencyBroadcastResponseDTO> getNearbyActiveBroadcasts(Double latitude, Double longitude) {
        if (latitude == null || longitude == null ||
            latitude < -90.0 || latitude > 90.0 ||
            longitude < -180.0 || longitude > 180.0) {
            return Collections.emptyList();
        }

        List<EmergencyBroadcast> activeBroadcasts = broadcastRepository.findByActiveTrueOrderByCreatedAtDesc();
        List<EmergencyBroadcastResponseDTO> nearbyResults = new ArrayList<>();

        for (EmergencyBroadcast b : activeBroadcasts) {
            Double dist = HaversineDistanceUtil.calculateDistanceKm(
                    latitude, longitude,
                    b.getCenterLatitude(), b.getCenterLongitude()
            );

            if (dist != null && dist <= b.getRadiusKm()) {
                nearbyResults.add(EmergencyBroadcastResponseDTO.fromEntityWithDistance(b, dist));
            }
        }

        // Sort results by distance ascending (nearest broadcast first)
        nearbyResults.sort(Comparator.comparing(
                EmergencyBroadcastResponseDTO::getDistanceFromUserKm,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        return nearbyResults;
    }

    @Override
    @Transactional
    public EmergencyBroadcastResponseDTO cancelBroadcast(Long id, String adminEmail) {
        EmergencyBroadcast broadcast = broadcastRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emergency broadcast not found with ID: " + id));

        // Mark inactive (cancel broadcast) without deleting historical record
        broadcast.setActive(false);
        EmergencyBroadcast updated = broadcastRepository.save(broadcast);
        return EmergencyBroadcastResponseDTO.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EmergencyBroadcastResponseDTO getBroadcastById(Long id) {
        EmergencyBroadcast broadcast = broadcastRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emergency broadcast not found with ID: " + id));
        return EmergencyBroadcastResponseDTO.fromEntity(broadcast);
    }
}
