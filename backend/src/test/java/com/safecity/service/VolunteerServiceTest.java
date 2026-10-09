package com.safecity.service;

import com.safecity.dto.*;
import com.safecity.entity.*;
import com.safecity.repository.*;
import com.safecity.service.impl.VolunteerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VolunteerServiceTest {

    @Mock
    private VolunteerProfileRepository volunteerProfileRepository;

    @Mock
    private VolunteerTaskAssignmentRepository taskAssignmentRepository;

    @Mock
    private ShelterRepository shelterRepository;

    @Mock
    private EmergencyBroadcastRepository broadcastRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private VolunteerServiceImpl volunteerService;

    private User testCitizen;
    private User testAdmin;
    private VolunteerProfile testProfile;
    private VolunteerTaskAssignment testTask;

    @BeforeEach
    void setUp() {
        testCitizen = new User("Jane Citizen", "citizen@safecity.com", "encodedPass", "1234567890", Role.CITIZEN);
        testCitizen.setId(1L);

        testAdmin = new User("Admin User", "admin@safecity.com", "encodedPass", "0987654321", Role.ADMIN);
        testAdmin.setId(2L);

        testProfile = new VolunteerProfile(testCitizen, VolunteerApprovalStatus.APPROVED, VolunteerAvailability.AVAILABLE,
                "First Aid, Translation", "Willing to assist at community shelters", 17.3850, 78.4867);
        testProfile.setId(10L);

        testTask = new VolunteerTaskAssignment(null, "Food Distribution Support", "Help distribute water and meals",
                "Food/Water Distribution Support", null, null, VolunteerTaskStatus.OPPORTUNITY, "Admin Note", "Abids Shelter");
        testTask.setId(100L);
    }

    @Test
    @DisplayName("Register Volunteer -> Success & Sends Notification")
    void testRegisterVolunteer_Success() {
        RegisterVolunteerRequestDTO req = new RegisterVolunteerRequestDTO();
        req.setSkills("First Aid, Community Support");
        req.setBioNotes("Eager to support local response efforts");
        req.setLatitude(17.3850);
        req.setLongitude(78.4867);

        when(volunteerProfileRepository.existsByUserId(1L)).thenReturn(false);
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(i -> {
            VolunteerProfile vp = i.getArgument(0);
            vp.setId(15L);
            return vp;
        });

        VolunteerProfileDTO dto = volunteerService.registerVolunteer(testCitizen, req);

        assertNotNull(dto);
        assertEquals(VolunteerApprovalStatus.PENDING, dto.getApprovalStatus());
        assertEquals(VolunteerAvailability.AVAILABLE, dto.getAvailability());
        assertEquals("First Aid, Community Support", dto.getSkills());

        verify(notificationService).createNotification(eq(testCitizen), anyString(), anyString(), eq("VOLUNTEER_STATUS"), any());
        verify(notificationService).notifyRole(eq(Role.ADMIN), anyString(), anyString(), eq("VOLUNTEER_REVIEW"), any());
    }

    @Test
    @DisplayName("Register Volunteer -> Duplicate Application Throws IllegalArgumentException")
    void testRegisterVolunteer_DuplicateThrows() {
        RegisterVolunteerRequestDTO req = new RegisterVolunteerRequestDTO();
        req.setSkills("First Aid");

        when(volunteerProfileRepository.existsByUserId(1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> volunteerService.registerVolunteer(testCitizen, req));
    }

    @Test
    @DisplayName("Register Volunteer -> Hazardous Skill Throws IllegalArgumentException")
    void testRegisterVolunteer_HazardousSkillThrows() {
        RegisterVolunteerRequestDTO req = new RegisterVolunteerRequestDTO();
        req.setSkills("Firefighting, Armed Response");

        when(volunteerProfileRepository.existsByUserId(1L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> volunteerService.registerVolunteer(testCitizen, req));
    }

    @Test
    @DisplayName("Update Availability -> Success")
    void testUpdateAvailability_Success() {
        when(volunteerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerProfileDTO updated = volunteerService.setAvailability(testCitizen, VolunteerAvailability.UNAVAILABLE);

        assertNotNull(updated);
        assertEquals(VolunteerAvailability.UNAVAILABLE, updated.getAvailability());
    }

    @Test
    @DisplayName("Admin Approve Volunteer -> Status Updated & User Notified")
    void testUpdateVolunteerApproval_ApproveSuccess() {
        VolunteerProfile pendingProfile = new VolunteerProfile(testCitizen, VolunteerApprovalStatus.PENDING, VolunteerAvailability.AVAILABLE, "Translation", "Notes", null, null);
        pendingProfile.setId(20L);

        when(volunteerProfileRepository.findById(20L)).thenReturn(Optional.of(pendingProfile));
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerProfileDTO updated = volunteerService.updateVolunteerApproval(20L, VolunteerApprovalStatus.APPROVED, "Verified documents");

        assertNotNull(updated);
        assertEquals(VolunteerApprovalStatus.APPROVED, updated.getApprovalStatus());
        verify(notificationService).createNotification(eq(testCitizen), anyString(), anyString(), eq("VOLUNTEER_STATUS"), any());
    }

    @Test
    @DisplayName("Express Willingness -> Success for Approved Available Volunteer")
    void testExpressWillingness_Success() {
        when(volunteerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(taskAssignmentRepository.findById(100L)).thenReturn(Optional.of(testTask));
        when(taskAssignmentRepository.save(any(VolunteerTaskAssignment.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerTaskAssignmentDTO dto = volunteerService.expressWillingness(testCitizen, 100L);

        assertNotNull(dto);
        assertEquals(VolunteerTaskStatus.REQUESTED, dto.getStatus());
        assertEquals(10L, dto.getVolunteerProfileId());
        verify(notificationService).notifyRole(eq(Role.ADMIN), anyString(), anyString(), eq("VOLUNTEER_TASK_REQUEST"), any());
    }

    @Test
    @DisplayName("Express Willingness -> Duplicate Request Throws Exception")
    void testExpressWillingness_DuplicateRequestThrows() {
        testTask.setVolunteerProfile(testProfile);
        testTask.setStatus(VolunteerTaskStatus.REQUESTED);

        when(volunteerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(taskAssignmentRepository.findById(100L)).thenReturn(Optional.of(testTask));

        assertThrows(IllegalArgumentException.class, () -> volunteerService.expressWillingness(testCitizen, 100L));
    }

    @Test
    @DisplayName("Express Willingness -> Unapproved Volunteer Throws Exception")
    void testExpressWillingness_UnapprovedVolunteerThrows() {
        testProfile.setApprovalStatus(VolunteerApprovalStatus.PENDING);

        when(volunteerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));

        assertThrows(IllegalArgumentException.class, () -> volunteerService.expressWillingness(testCitizen, 100L));
    }

    @Test
    @DisplayName("Review Task -> Admin Approves Participation Request")
    void testReviewTaskRequest_AdminApprove() {
        testTask.setVolunteerProfile(testProfile);
        testTask.setStatus(VolunteerTaskStatus.REQUESTED);

        when(taskAssignmentRepository.findById(100L)).thenReturn(Optional.of(testTask));
        when(taskAssignmentRepository.save(any(VolunteerTaskAssignment.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerTaskAssignmentDTO dto = volunteerService.reviewTaskRequest(100L, VolunteerTaskStatus.APPROVED, "Approved by operational admin");

        assertNotNull(dto);
        assertEquals(VolunteerTaskStatus.APPROVED, dto.getStatus());
        verify(notificationService).createNotification(eq(testCitizen), anyString(), anyString(), eq("VOLUNTEER_TASK_UPDATE"), any());
    }

    @Test
    @DisplayName("Mark Task Complete -> Approved Volunteer Completes Task")
    void testMarkTaskComplete_Success() {
        testTask.setVolunteerProfile(testProfile);
        testTask.setStatus(VolunteerTaskStatus.APPROVED);

        when(volunteerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(taskAssignmentRepository.findById(100L)).thenReturn(Optional.of(testTask));
        when(taskAssignmentRepository.save(any(VolunteerTaskAssignment.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerTaskAssignmentDTO dto = volunteerService.markTaskComplete(testCitizen, 100L);

        assertNotNull(dto);
        assertEquals(VolunteerTaskStatus.COMPLETED, dto.getStatus());
        verify(notificationService).createNotification(eq(testCitizen), anyString(), anyString(), eq("VOLUNTEER_TASK_UPDATE"), any());
    }

    @Test
    @DisplayName("Location Privacy -> Non-Admin view rounds coordinates")
    void testLocationPrivacy_RoundsCoordinates() {
        VolunteerProfile profileWithPreciseLocation = new VolunteerProfile(
                testCitizen, VolunteerApprovalStatus.APPROVED, VolunteerAvailability.AVAILABLE,
                "Translation", "Bio", 17.3854912, 78.4867123
        );

        VolunteerProfileDTO dtoPrivate = VolunteerProfileDTO.fromEntity(profileWithPreciseLocation, false);
        assertEquals(17.39, dtoPrivate.getLatitude());
        assertEquals(78.49, dtoPrivate.getLongitude());

        VolunteerProfileDTO dtoFull = VolunteerProfileDTO.fromEntity(profileWithPreciseLocation, true);
        assertEquals(17.3854912, dtoFull.getLatitude());
        assertEquals(78.4867123, dtoFull.getLongitude());
    }
}
