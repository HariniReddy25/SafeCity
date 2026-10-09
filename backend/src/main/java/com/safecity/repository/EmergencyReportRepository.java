package com.safecity.repository;

import com.safecity.entity.EmergencyReport;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyReportRepository extends JpaRepository<EmergencyReport, Long> {

    List<EmergencyReport> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    Optional<EmergencyReport> findByCitizenIdAndId(Long citizenId, Long id);

    Optional<EmergencyReport> findByReportId(String reportId);

    long countByCitizenId(Long citizenId);

    long countByCitizenIdAndStatusIn(Long citizenId, List<ReportStatus> statuses);

    long countByCitizenIdAndStatus(Long citizenId, ReportStatus status);

    @Query("SELECT COUNT(r) FROM EmergencyReport r WHERE r.citizen.id = :citizenId AND r.status NOT IN (:closedStatuses)")
    long countActiveByCitizenId(@Param("citizenId") Long citizenId, @Param("closedStatuses") List<ReportStatus> closedStatuses);

    // Admin Repository Queries
    List<EmergencyReport> findAllByOrderByCreatedAtDesc();

    long countByStatus(ReportStatus status);

    @Query("SELECT COUNT(r) FROM EmergencyReport r WHERE r.status NOT IN (:closedStatuses)")
    long countActiveReports(@Param("closedStatuses") List<ReportStatus> closedStatuses);

    @Query("SELECT r FROM EmergencyReport r WHERE r.status NOT IN (:closedStatuses) AND r.escalatedAt IS NULL")
    List<EmergencyReport> findActiveUnescalatedReports(@Param("closedStatuses") List<ReportStatus> closedStatuses);

    // Responder Workload Queries (Phase 4B & 4C)
    long countByAssignedResponderId(Long responderId);

    @Query("SELECT COUNT(r) FROM EmergencyReport r WHERE r.assignedResponder.id = :responderId AND r.status NOT IN (:closedStatuses)")
    long countActiveByAssignedResponderId(@Param("responderId") Long responderId, @Param("closedStatuses") List<ReportStatus> closedStatuses);

    long countByAssignedResponderIdAndStatus(Long responderId, ReportStatus status);

    long countByAssignedResponderIdAndPriorityIn(Long responderId, List<ReportPriority> priorities);

    List<EmergencyReport> findByAssignedResponderIdOrderByCreatedAtDesc(Long responderId);

    Optional<EmergencyReport> findByAssignedResponderIdAndId(Long responderId, Long id);

    // Geospatial Map Query with Bounds Validation (Phase 5B)
    @Query("SELECT r FROM EmergencyReport r WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL AND r.latitude BETWEEN -90.0 AND 90.0 AND r.longitude BETWEEN -180.0 AND 180.0 ORDER BY r.createdAt DESC")
    List<EmergencyReport> findReportsWithValidCoordinates();
}
