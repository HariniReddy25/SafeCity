package com.safecity.service.impl;

import com.safecity.dto.*;
import com.safecity.entity.*;
import com.safecity.repository.*;
import com.safecity.service.NotificationService;
import com.safecity.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VolunteerTaskAssignmentRepository taskAssignmentRepository;
    private final ShelterRepository shelterRepository;
    private final EmergencyBroadcastRepository broadcastRepository;
    private final NotificationService notificationService;

    private static final List<String> DANGEROUS_KEYWORDS = Arrays.asList(
        "firefighting", "weapons", "armed", "hazardous materials", "hazmat", "active crime", "tactical", "explosives"
    );

    @Autowired
    public VolunteerServiceImpl(VolunteerProfileRepository volunteerProfileRepository,
                                VolunteerTaskAssignmentRepository taskAssignmentRepository,
                                ShelterRepository shelterRepository,
                                EmergencyBroadcastRepository broadcastRepository,
                                NotificationService notificationService) {
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.shelterRepository = shelterRepository;
        this.broadcastRepository = broadcastRepository;
        this.notificationService = notificationService;
    }

    @Override
    public VolunteerProfileDTO registerVolunteer(User user, RegisterVolunteerRequestDTO dto) {
        if (user == null) {
            throw new IllegalArgumentException("User must be specified");
        }
        if (volunteerProfileRepository.existsByUserId(user.getId())) {
            throw new IllegalArgumentException("Volunteer profile already exists for user: " + user.getEmail());
        }

        validateSkillsSafety(dto.getSkills());

        VolunteerProfile profile = new VolunteerProfile();
        profile.setUser(user);
        profile.setApprovalStatus(VolunteerApprovalStatus.PENDING);
        profile.setAvailability(VolunteerAvailability.AVAILABLE);
        profile.setSkills(dto.getSkills() != null ? dto.getSkills() : "Community Support");
        profile.setBioNotes(dto.getBioNotes());
        profile.setLatitude(dto.getLatitude());
        profile.setLongitude(dto.getLongitude());

        VolunteerProfile saved = volunteerProfileRepository.save(profile);

        // Notify citizen
        notificationService.createNotification(
            user,
            "Volunteer Application Received",
            "Your community volunteer application has been submitted and is pending admin review.",
            "VOLUNTEER_STATUS",
            null
        );

        // Notify admins
        notificationService.notifyRole(
            Role.ADMIN,
            "New Volunteer Registration",
            "Volunteer application submitted by " + user.getFullName() + ". Review required.",
            "VOLUNTEER_REVIEW",
            null
        );

        return VolunteerProfileDTO.fromEntity(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerProfileDTO getMyVolunteerProfile(User user) {
        if (user == null) return null;
        return volunteerProfileRepository.findByUserId(user.getId())
            .map(p -> VolunteerProfileDTO.fromEntity(p, true))
            .orElse(null);
    }

    @Override
    public VolunteerProfileDTO updateMyVolunteerProfile(User user, UpdateVolunteerProfileRequestDTO dto) {
        if (user == null) {
            throw new IllegalArgumentException("User must be specified");
        }
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("No volunteer profile found for user"));

        if (dto.getSkills() != null) {
            validateSkillsSafety(dto.getSkills());
            profile.setSkills(dto.getSkills());
        }
        if (dto.getBioNotes() != null) {
            profile.setBioNotes(dto.getBioNotes());
        }
        if (dto.getAvailability() != null) {
            profile.setAvailability(dto.getAvailability());
        }
        if (dto.getLatitude() != null) {
            profile.setLatitude(dto.getLatitude());
        }
        if (dto.getLongitude() != null) {
            profile.setLongitude(dto.getLongitude());
        }

        VolunteerProfile updated = volunteerProfileRepository.save(profile);
        return VolunteerProfileDTO.fromEntity(updated, true);
    }

    @Override
    public VolunteerProfileDTO setAvailability(User user, VolunteerAvailability availability) {
        if (user == null) {
            throw new IllegalArgumentException("User must be specified");
        }
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("No volunteer profile found for user"));

        profile.setAvailability(availability);
        VolunteerProfile updated = volunteerProfileRepository.save(profile);
        return VolunteerProfileDTO.fromEntity(updated, true);
    }

    @Override
    public void withdrawVolunteerProfile(User user) {
        if (user == null) return;
        Optional<VolunteerProfile> profileOpt = volunteerProfileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            VolunteerProfile profile = profileOpt.get();
            // Delete associated task assignments or disassociate
            List<VolunteerTaskAssignment> assignments = taskAssignmentRepository.findByVolunteerProfileId(profile.getId());
            taskAssignmentRepository.deleteAll(assignments);
            volunteerProfileRepository.delete(profile);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskAssignmentDTO> getAvailableOpportunities(User user) {
        // Return tasks with status OPPORTUNITY or tasks assigned to this user
        List<VolunteerTaskAssignment> opportunities = taskAssignmentRepository.findByStatus(VolunteerTaskStatus.OPPORTUNITY);
        
        if (user != null) {
            Optional<VolunteerProfile> profileOpt = volunteerProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                List<VolunteerTaskAssignment> userTasks = taskAssignmentRepository.findByVolunteerProfileId(profileOpt.get().getId());
                // Merge without duplicates
                for (VolunteerTaskAssignment ut : userTasks) {
                    if (!opportunities.contains(ut)) {
                        opportunities.add(ut);
                    }
                }
            }
        }

        return opportunities.stream()
            .map(VolunteerTaskAssignmentDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public VolunteerTaskAssignmentDTO expressWillingness(User user, Long taskId) {
        if (user == null) {
            throw new IllegalArgumentException("User must be specified");
        }
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("You must register as a volunteer first"));

        if (profile.getApprovalStatus() != VolunteerApprovalStatus.APPROVED) {
            throw new IllegalArgumentException("Only APPROVED volunteers can express willingness to assist");
        }
        if (profile.getAvailability() != VolunteerAvailability.AVAILABLE) {
            throw new IllegalArgumentException("Volunteer status must be AVAILABLE to request tasks");
        }

        VolunteerTaskAssignment task = taskAssignmentRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task opportunity not found with id: " + taskId));

        // Duplicate request prevention: Check if already requested/approved for this profile
        if (task.getVolunteerProfile() != null && task.getVolunteerProfile().getId().equals(profile.getId())) {
            if (task.getStatus() == VolunteerTaskStatus.REQUESTED || task.getStatus() == VolunteerTaskStatus.APPROVED) {
                throw new IllegalArgumentException("You have already expressed willingness for this task");
            }
        }

        // If the task is an unassigned OPPORTUNITY, clone or set volunteer
        if (task.getVolunteerProfile() == null) {
            task.setVolunteerProfile(profile);
            task.setStatus(VolunteerTaskStatus.REQUESTED);
        } else if (!task.getVolunteerProfile().getId().equals(profile.getId())) {
            // Create a new task assignment request for this volunteer based on opportunity template
            VolunteerTaskAssignment newReq = new VolunteerTaskAssignment(
                profile,
                task.getTitle(),
                task.getDescription(),
                task.getSkillRequired(),
                task.getShelter(),
                task.getBroadcast(),
                VolunteerTaskStatus.REQUESTED,
                "Willingness expressed by " + user.getFullName(),
                task.getLocationName()
            );
            task = taskAssignmentRepository.save(newReq);
            return VolunteerTaskAssignmentDTO.fromEntity(task);
        } else {
            task.setStatus(VolunteerTaskStatus.REQUESTED);
        }

        VolunteerTaskAssignment saved = taskAssignmentRepository.save(task);

        // Notify Admins for human approval
        notificationService.notifyRole(
            Role.ADMIN,
            "Volunteer Willingness Expressed",
            "Volunteer " + user.getFullName() + " expressed willingness for task: " + saved.getTitle() + ". Human approval required.",
            "VOLUNTEER_TASK_REQUEST",
            null
        );

        return VolunteerTaskAssignmentDTO.fromEntity(saved);
    }

    @Override
    public VolunteerTaskAssignmentDTO markTaskComplete(User user, Long taskId) {
        if (user == null) {
            throw new IllegalArgumentException("User must be specified");
        }
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found"));

        VolunteerTaskAssignment task = taskAssignmentRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task assignment not found"));

        if (task.getVolunteerProfile() == null || !task.getVolunteerProfile().getId().equals(profile.getId())) {
            throw new IllegalArgumentException("You are not assigned to this task");
        }

        if (task.getStatus() != VolunteerTaskStatus.APPROVED) {
            throw new IllegalArgumentException("Only APPROVED tasks can be marked as COMPLETED");
        }

        task.setStatus(VolunteerTaskStatus.COMPLETED);
        VolunteerTaskAssignment updated = taskAssignmentRepository.save(task);

        // Notify volunteer and admin
        notificationService.createNotification(
            user,
            "Task Activity Completed",
            "Thank you! Your participation in '" + task.getTitle() + "' has been recorded as complete.",
            "VOLUNTEER_TASK_UPDATE",
            null
        );

        return VolunteerTaskAssignmentDTO.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskAssignmentDTO> getMyTaskHistory(User user) {
        if (user == null) return List.of();
        Optional<VolunteerProfile> profileOpt = volunteerProfileRepository.findByUserId(user.getId());
        if (profileOpt.isEmpty()) return List.of();

        return taskAssignmentRepository.findByVolunteerProfileId(profileOpt.get().getId()).stream()
            .map(VolunteerTaskAssignmentDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerProfileDTO> getAllVolunteerProfiles(VolunteerApprovalStatus approvalStatus, VolunteerAvailability availability) {
        List<VolunteerProfile> profiles;
        if (approvalStatus != null && availability != null) {
            profiles = volunteerProfileRepository.findByApprovalStatusAndAvailability(approvalStatus, availability);
        } else if (approvalStatus != null) {
            profiles = volunteerProfileRepository.findByApprovalStatus(approvalStatus);
        } else if (availability != null) {
            profiles = volunteerProfileRepository.findByAvailability(availability);
        } else {
            profiles = volunteerProfileRepository.findAll();
        }

        return profiles.stream()
            .map(p -> VolunteerProfileDTO.fromEntity(p, true))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerProfileDTO getVolunteerProfileById(Long profileId) {
        VolunteerProfile profile = volunteerProfileRepository.findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found with id: " + profileId));
        return VolunteerProfileDTO.fromEntity(profile, true);
    }

    @Override
    public VolunteerProfileDTO updateVolunteerApproval(Long profileId, VolunteerApprovalStatus status, String reason) {
        VolunteerProfile profile = volunteerProfileRepository.findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found with id: " + profileId));

        profile.setApprovalStatus(status);
        VolunteerProfile saved = volunteerProfileRepository.save(profile);

        // Notify user
        if (profile.getUser() != null) {
            String title = "Volunteer Approval Update";
            String msg = "Your volunteer approval status has been updated to: " + status;
            if (status == VolunteerApprovalStatus.APPROVED) {
                msg = "Your volunteer application has been APPROVED! You may now assist in community support activities.";
            } else if (status == VolunteerApprovalStatus.REJECTED) {
                msg = "Your volunteer application was REJECTED." + (reason != null ? " Reason: " + reason : "");
            } else if (status == VolunteerApprovalStatus.SUSPENDED) {
                msg = "Your volunteer profile status has been SUSPENDED by admin.";
            }
            notificationService.createNotification(profile.getUser(), title, msg, "VOLUNTEER_STATUS", null);
        }

        return VolunteerProfileDTO.fromEntity(saved, true);
    }

    @Override
    public VolunteerTaskAssignmentDTO createCommunityOpportunity(CreateVolunteerTaskRequestDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Opportunity title is required");
        }

        validateSkillsSafety(dto.getSkillRequired());

        Shelter shelter = null;
        if (dto.getShelterId() != null) {
            shelter = shelterRepository.findById(dto.getShelterId()).orElse(null);
        }

        EmergencyBroadcast broadcast = null;
        if (dto.getBroadcastId() != null) {
            broadcast = broadcastRepository.findById(dto.getBroadcastId()).orElse(null);
        }

        VolunteerTaskAssignment task = new VolunteerTaskAssignment(
            null,
            dto.getTitle(),
            dto.getDescription(),
            dto.getSkillRequired() != null ? dto.getSkillRequired() : "Community Support",
            shelter,
            broadcast,
            VolunteerTaskStatus.OPPORTUNITY,
            "Created by Admin",
            dto.getLocationName() != null ? dto.getLocationName() : (shelter != null ? shelter.getName() : "Community Hub")
        );

        VolunteerTaskAssignment saved = taskAssignmentRepository.save(task);

        // Notify approved & available volunteers of new community opportunity
        List<VolunteerProfile> approvedVolunteers = volunteerProfileRepository
            .findByApprovalStatusAndAvailability(VolunteerApprovalStatus.APPROVED, VolunteerAvailability.AVAILABLE);

        for (VolunteerProfile vp : approvedVolunteers) {
            if (vp.getUser() != null) {
                notificationService.createNotification(
                    vp.getUser(),
                    "New Community Support Opportunity",
                    "New opportunity available: " + saved.getTitle() + " (" + saved.getSkillRequired() + ")",
                    "VOLUNTEER_OPPORTUNITY",
                    null
                );
            }
        }

        return VolunteerTaskAssignmentDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskAssignmentDTO> getAllTasks(VolunteerTaskStatus status) {
        List<VolunteerTaskAssignment> tasks;
        if (status != null) {
            tasks = taskAssignmentRepository.findByStatus(status);
        } else {
            tasks = taskAssignmentRepository.findAll();
        }

        return tasks.stream()
            .map(VolunteerTaskAssignmentDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public VolunteerTaskAssignmentDTO reviewTaskRequest(Long taskId, VolunteerTaskStatus newStatus, String notes) {
        VolunteerTaskAssignment task = taskAssignmentRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task assignment not found with id: " + taskId));

        if (newStatus != VolunteerTaskStatus.APPROVED && newStatus != VolunteerTaskStatus.DECLINED && newStatus != VolunteerTaskStatus.CANCELLED) {
            throw new IllegalArgumentException("Invalid review status. Must be APPROVED, DECLINED, or CANCELLED");
        }

        task.setStatus(newStatus);
        if (notes != null) {
            task.setNotes(notes);
        }

        VolunteerTaskAssignment saved = taskAssignmentRepository.save(task);

        // Notify volunteer of approval/decline decision
        if (saved.getVolunteerProfile() != null && saved.getVolunteerProfile().getUser() != null) {
            User volunteerUser = saved.getVolunteerProfile().getUser();
            String title = "Volunteer Assistance Request Update";
            String msg = "Your participation request for '" + saved.getTitle() + "' was updated to: " + newStatus;
            if (newStatus == VolunteerTaskStatus.APPROVED) {
                msg = "Your assistance request for '" + saved.getTitle() + "' has been APPROVED by admin. Thank you for your support!";
            } else if (newStatus == VolunteerTaskStatus.DECLINED) {
                msg = "Your assistance request for '" + saved.getTitle() + "' was DECLINED." + (notes != null ? " Reason: " + notes : "");
            }
            notificationService.createNotification(volunteerUser, title, msg, "VOLUNTEER_TASK_UPDATE", null);
        }

        return VolunteerTaskAssignmentDTO.fromEntity(saved);
    }

    private void validateSkillsSafety(String skills) {
        if (skills == null) return;
        String lower = skills.toLowerCase();
        for (String keyword : DANGEROUS_KEYWORDS) {
            if (lower.contains(keyword)) {
                throw new IllegalArgumentException("Hazardous skill or dangerous operation not allowed for community volunteers: " + keyword);
            }
        }
    }
}
