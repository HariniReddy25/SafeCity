package com.safecity.repository;

import com.safecity.entity.EmergencyBroadcast;
import com.safecity.entity.EmergencyBroadcastSeverity;
import com.safecity.entity.IncidentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyBroadcastRepository extends JpaRepository<EmergencyBroadcast, Long> {

    List<EmergencyBroadcast> findByActiveTrueOrderByCreatedAtDesc();

    List<EmergencyBroadcast> findByActiveTrueAndCategoryOrderByCreatedAtDesc(IncidentCategory category);

    List<EmergencyBroadcast> findByActiveTrueAndSeverityOrderByCreatedAtDesc(EmergencyBroadcastSeverity severity);

    List<EmergencyBroadcast> findAllByOrderByCreatedAtDesc();
}
