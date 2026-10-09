package com.safecity.repository;

import com.safecity.entity.Resource;
import com.safecity.entity.ResourceStatus;
import com.safecity.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Optional<Resource> findByResourceCode(String resourceCode);

    List<Resource> findAllByOrderByCreatedAtDesc();

    List<Resource> findByStatusOrderByCreatedAtDesc(ResourceStatus status);

    List<Resource> findByTypeOrderByCreatedAtDesc(ResourceType type);

    List<Resource> findByStatusAndTypeOrderByCreatedAtDesc(ResourceStatus status, ResourceType type);

    List<Resource> findByAssignedReportId(Long reportId);

    List<Resource> findByAssignedMasterIncidentId(Long masterId);
}
