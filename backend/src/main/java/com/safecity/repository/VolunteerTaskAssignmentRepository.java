package com.safecity.repository;

import com.safecity.entity.VolunteerProfile;
import com.safecity.entity.VolunteerTaskAssignment;
import com.safecity.entity.VolunteerTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerTaskAssignmentRepository extends JpaRepository<VolunteerTaskAssignment, Long> {

    List<VolunteerTaskAssignment> findByVolunteerProfileId(Long volunteerProfileId);

    List<VolunteerTaskAssignment> findByVolunteerProfile(VolunteerProfile volunteerProfile);

    List<VolunteerTaskAssignment> findByStatus(VolunteerTaskStatus status);

    List<VolunteerTaskAssignment> findByVolunteerProfileIdAndStatus(Long volunteerProfileId, VolunteerTaskStatus status);

    List<VolunteerTaskAssignment> findByShelterId(Long shelterId);

    List<VolunteerTaskAssignment> findByBroadcastId(Long broadcastId);
}
