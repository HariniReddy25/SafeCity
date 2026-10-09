package com.safecity.service;

import com.safecity.dto.CreateEmergencyBroadcastRequestDTO;
import com.safecity.dto.EmergencyBroadcastResponseDTO;
import com.safecity.entity.*;
import com.safecity.repository.EmergencyBroadcastRepository;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.impl.EmergencyBroadcastServiceImpl;
import com.safecity.util.HaversineDistanceUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmergencyBroadcastServiceTest {

    @Mock
    private EmergencyBroadcastRepository broadcastRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmergencyReportRepository reportRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EmergencyBroadcastServiceImpl broadcastService;

    private User adminUser;
    private User citizenInside;
    private User citizenOutside;
    private User citizenMissingCoords;
    private CreateEmergencyBroadcastRequestDTO validRequest;
    private EmergencyBroadcast sampleBroadcast;

    @BeforeEach
    void setUp() {
        adminUser = new User("Chief Admin", "admin@safecity.com", "+1-555-0199", "password", Role.ADMIN);
        adminUser.setId(10L);

        citizenInside = new User("Citizen Inside", "inside@safecity.com", "+1-555-0101", "password", Role.CITIZEN);
        citizenInside.setId(101L);

        citizenOutside = new User("Citizen Outside", "outside@safecity.com", "+1-555-0102", "password", Role.CITIZEN);
        citizenOutside.setId(102L);

        citizenMissingCoords = new User("Citizen Missing", "missing@safecity.com", "+1-555-0103", "password", Role.CITIZEN);
        citizenMissingCoords.setId(103L);

        validRequest = new CreateEmergencyBroadcastRequestDTO(
                "CIVIL DEFENSE WARNING: Industrial Fire Hazard",
                "High chemical hazard detected. Residents within 5 km should remain indoors and seal windows.",
                EmergencyBroadcastSeverity.CRITICAL,
                17.3850,
                78.4867,
                5.0,
                IncidentCategory.FIRE
        );

        sampleBroadcast = new EmergencyBroadcast(
                validRequest.getTitle(),
                validRequest.getMessage(),
                validRequest.getSeverity(),
                validRequest.getCenterLatitude(),
                validRequest.getCenterLongitude(),
                validRequest.getRadiusKm(),
                validRequest.getCategory(),
                adminUser
        );
        sampleBroadcast.setId(50L);
        sampleBroadcast.setActive(true);
    }

    @Test
    @DisplayName("1. Broadcast Creation & Geo-Fenced Notification -> Only citizen inside radius receives notification")
    void testGeoFencedNotification_TargetedDelivery() {
        when(userRepository.findByEmail("admin@safecity.com")).thenReturn(Optional.of(adminUser));
        when(broadcastRepository.save(any(EmergencyBroadcast.class))).thenReturn(sampleBroadcast);
        when(userRepository.findByRoleAndEnabledTrue(Role.CITIZEN)).thenReturn(Arrays.asList(
                citizenInside, citizenOutside, citizenMissingCoords
        ));

        // Citizen Inside: Report at (17.3900, 78.4900) -> 0.7 km from (17.3850, 78.4867) <= 5.0 km
        EmergencyReport reportInside = new EmergencyReport("SC-1", citizenInside, IncidentCategory.FIRE, "Fire near me", ReportPriority.HIGH, 17.3900, 78.4900, "Address", LocalDateTime.now(), null);

        // Citizen Outside: Report at (17.6500, 78.8000) -> ~35 km from (17.3850, 78.4867) > 5.0 km
        EmergencyReport reportOutside = new EmergencyReport("SC-2", citizenOutside, IncidentCategory.FIRE, "Other report", ReportPriority.LOW, 17.6500, 78.8000, "Far address", LocalDateTime.now(), null);

        when(reportRepository.findByCitizenIdOrderByCreatedAtDesc(101L)).thenReturn(Collections.singletonList(reportInside));
        when(reportRepository.findByCitizenIdOrderByCreatedAtDesc(102L)).thenReturn(Collections.singletonList(reportOutside));
        when(reportRepository.findByCitizenIdOrderByCreatedAtDesc(103L)).thenReturn(Collections.emptyList()); // Missing coordinates

        EmergencyBroadcastResponseDTO response = broadcastService.createBroadcast(validRequest, "admin@safecity.com");

        assertNotNull(response);
        assertEquals(50L, response.getId());

        // Verify notification sent ONLY to citizenInside
        verify(notificationService, times(1)).createNotification(
                eq(citizenInside),
                contains("CIVIL DEFENSE ALERT"),
                anyString(),
                eq("CIVIL_DEFENSE_BROADCAST"),
                eq("50")
        );

        // Verify notification NOT sent to citizenOutside or citizenMissingCoords
        verify(notificationService, never()).createNotification(eq(citizenOutside), anyString(), anyString(), anyString(), anyString());
        verify(notificationService, never()).createNotification(eq(citizenMissingCoords), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("2. No Duplicate Notification On Fetch -> Fetching active or nearby broadcasts does NOT trigger notifications")
    void testNoDuplicateNotificationOnFetch() {
        when(broadcastRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(sampleBroadcast));

        // Fetch active
        broadcastService.getActiveBroadcasts();

        // Fetch nearby
        broadcastService.getNearbyActiveBroadcasts(17.3850, 78.4867);

        // Verify notificationService is NEVER called during read/fetch operations
        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("3. Validation -> Throws Exception on null or blank title/message")
    void testCreateBroadcast_ValidationBlankFields() {
        validRequest.setTitle("");
        assertThrows(IllegalArgumentException.class, () -> broadcastService.createBroadcast(validRequest, "admin@safecity.com"));

        validRequest.setTitle("Valid Title");
        validRequest.setMessage("   ");
        assertThrows(IllegalArgumentException.class, () -> broadcastService.createBroadcast(validRequest, "admin@safecity.com"));
    }

    @Test
    @DisplayName("4. Validation -> Throws Exception on negative or zero radius")
    void testCreateBroadcast_ValidationInvalidRadius() {
        validRequest.setRadiusKm(0.0);
        assertThrows(IllegalArgumentException.class, () -> broadcastService.createBroadcast(validRequest, "admin@safecity.com"));

        validRequest.setRadiusKm(-3.5);
        assertThrows(IllegalArgumentException.class, () -> broadcastService.createBroadcast(validRequest, "admin@safecity.com"));
    }

    @Test
    @DisplayName("5. Validation -> Throws Exception on out-of-bound coordinates")
    void testCreateBroadcast_ValidationInvalidCoordinates() {
        validRequest.setCenterLatitude(95.0); // > 90
        assertThrows(IllegalArgumentException.class, () -> broadcastService.createBroadcast(validRequest, "admin@safecity.com"));

        validRequest.setCenterLatitude(17.3850);
        validRequest.setCenterLongitude(-190.0); // < -180
        assertThrows(IllegalArgumentException.class, () -> broadcastService.createBroadcast(validRequest, "admin@safecity.com"));
    }

    @Test
    @DisplayName("6. Active Broadcast Retrieval -> Returns only active broadcasts")
    void testGetActiveBroadcasts() {
        when(broadcastRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(sampleBroadcast));

        List<EmergencyBroadcastResponseDTO> activeList = broadcastService.getActiveBroadcasts();

        assertNotNull(activeList);
        assertEquals(1, activeList.size());
        assertTrue(activeList.get(0).isActive());
    }

    @Test
    @DisplayName("7. Nearby Broadcast Within Radius -> Included in results with computed distance")
    void testGetNearbyBroadcasts_WithinRadius() {
        when(broadcastRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(sampleBroadcast));

        // Coordinate 2 km away from (17.3850, 78.4867)
        Double userLat = 17.3950;
        Double userLon = 78.4900;

        List<EmergencyBroadcastResponseDTO> nearbyList = broadcastService.getNearbyActiveBroadcasts(userLat, userLon);

        assertEquals(1, nearbyList.size());
        assertNotNull(nearbyList.get(0).getDistanceFromUserKm());
        assertTrue(nearbyList.get(0).getDistanceFromUserKm() <= 5.0);
    }

    @Test
    @DisplayName("8. Nearby Broadcast Outside Radius -> Excluded from nearby results")
    void testGetNearbyBroadcasts_OutsideRadius() {
        when(broadcastRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(sampleBroadcast));

        // Coordinate ~20 km away from (17.3850, 78.4867)
        Double userLat = 17.5500;
        Double userLon = 78.6000;

        List<EmergencyBroadcastResponseDTO> nearbyList = broadcastService.getNearbyActiveBroadcasts(userLat, userLon);

        assertTrue(nearbyList.isEmpty());
    }

    @Test
    @DisplayName("9. Radius & Haversine Distance Behavior -> Correctly filters at exact boundary")
    void testGetNearbyBroadcasts_HaversineBoundaryCheck() {
        // Broadcast center: (17.3850, 78.4867), radius = 5.0 km
        Double userLatInside = 17.3850;
        Double userLonInside = 78.4867; // distance = 0 km

        when(broadcastRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(sampleBroadcast));

        List<EmergencyBroadcastResponseDTO> nearbyList = broadcastService.getNearbyActiveBroadcasts(userLatInside, userLonInside);

        assertEquals(1, nearbyList.size());
        assertEquals(0.0, nearbyList.get(0).getDistanceFromUserKm());
    }

    @Test
    @DisplayName("10. Cancel Broadcast -> Sets active=false, preserves record, excludes from active/nearby")
    void testCancelBroadcast_PreservesRecordAndExcludes() {
        when(broadcastRepository.findById(50L)).thenReturn(Optional.of(sampleBroadcast));
        when(broadcastRepository.save(any(EmergencyBroadcast.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EmergencyBroadcastResponseDTO cancelled = broadcastService.cancelBroadcast(50L, "admin@safecity.com");

        assertNotNull(cancelled);
        assertFalse(cancelled.isActive());
        assertNotNull(cancelled.getId()); // Record preserved in database

        // Verify cancelled broadcast is excluded from active list
        when(broadcastRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());
        List<EmergencyBroadcastResponseDTO> activeList = broadcastService.getActiveBroadcasts();
        assertTrue(activeList.isEmpty());
    }

    @Test
    @DisplayName("11. Missing/Invalid User Coordinates -> Safely returns empty nearby list without crashing")
    void testGetNearbyBroadcasts_MissingOrNullCoordinates() {
        List<EmergencyBroadcastResponseDTO> list1 = broadcastService.getNearbyActiveBroadcasts(null, 78.4867);
        List<EmergencyBroadcastResponseDTO> list2 = broadcastService.getNearbyActiveBroadcasts(17.3850, null);
        List<EmergencyBroadcastResponseDTO> list3 = broadcastService.getNearbyActiveBroadcasts(999.0, 78.4867);

        assertTrue(list1.isEmpty());
        assertTrue(list2.isEmpty());
        assertTrue(list3.isEmpty());
    }

    @Test
    @DisplayName("12. No False Geographic Match -> Missing coordinates do not falsely match radius")
    void testNoFalseGeographicMatch() {
        List<EmergencyBroadcastResponseDTO> nearby = broadcastService.getNearbyActiveBroadcasts(null, null);
        assertTrue(nearby.isEmpty(), "Null coordinates must not falsely evaluate as inside the broadcast radius.");
    }
}
