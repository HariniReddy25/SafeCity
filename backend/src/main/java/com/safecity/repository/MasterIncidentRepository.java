package com.safecity.repository;

import com.safecity.entity.MasterIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MasterIncidentRepository extends JpaRepository<MasterIncident, Long> {

    Optional<MasterIncident> findByMasterCode(String masterCode);
}
