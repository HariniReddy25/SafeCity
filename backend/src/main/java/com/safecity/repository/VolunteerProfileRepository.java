package com.safecity.repository;

import com.safecity.entity.User;
import com.safecity.entity.VolunteerApprovalStatus;
import com.safecity.entity.VolunteerAvailability;
import com.safecity.entity.VolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {

    Optional<VolunteerProfile> findByUserId(Long userId);

    Optional<VolunteerProfile> findByUser(User user);

    boolean existsByUserId(Long userId);

    List<VolunteerProfile> findByApprovalStatus(VolunteerApprovalStatus approvalStatus);

    List<VolunteerProfile> findByAvailability(VolunteerAvailability availability);

    List<VolunteerProfile> findByApprovalStatusAndAvailability(VolunteerApprovalStatus approvalStatus, VolunteerAvailability availability);
}
