package com.safecity.service;

import com.safecity.dto.*;
import com.safecity.entity.User;
import com.safecity.entity.VolunteerApprovalStatus;
import com.safecity.entity.VolunteerAvailability;
import com.safecity.entity.VolunteerTaskStatus;

import java.util.List;

public interface VolunteerService {

    VolunteerProfileDTO registerVolunteer(User user, RegisterVolunteerRequestDTO dto);

    VolunteerProfileDTO getMyVolunteerProfile(User user);

    VolunteerProfileDTO updateMyVolunteerProfile(User user, UpdateVolunteerProfileRequestDTO dto);

    VolunteerProfileDTO setAvailability(User user, VolunteerAvailability availability);

    void withdrawVolunteerProfile(User user);

    List<VolunteerTaskAssignmentDTO> getAvailableOpportunities(User user);

    VolunteerTaskAssignmentDTO expressWillingness(User user, Long taskId);

    VolunteerTaskAssignmentDTO markTaskComplete(User user, Long taskId);

    List<VolunteerTaskAssignmentDTO> getMyTaskHistory(User user);

    List<VolunteerProfileDTO> getAllVolunteerProfiles(VolunteerApprovalStatus approvalStatus, VolunteerAvailability availability);

    VolunteerProfileDTO getVolunteerProfileById(Long profileId);

    VolunteerProfileDTO updateVolunteerApproval(Long profileId, VolunteerApprovalStatus status, String reason);

    VolunteerTaskAssignmentDTO createCommunityOpportunity(CreateVolunteerTaskRequestDTO dto);

    List<VolunteerTaskAssignmentDTO> getAllTasks(VolunteerTaskStatus status);

    VolunteerTaskAssignmentDTO reviewTaskRequest(Long taskId, VolunteerTaskStatus newStatus, String notes);
}
