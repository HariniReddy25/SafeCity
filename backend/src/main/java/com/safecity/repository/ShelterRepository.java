package com.safecity.repository;

import com.safecity.entity.Shelter;
import com.safecity.entity.ShelterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {

    Optional<Shelter> findByShelterCode(String shelterCode);

    List<Shelter> findAllByOrderByCreatedAtDesc();

    List<Shelter> findByStatusInOrderByCreatedAtDesc(List<ShelterStatus> statuses);

    long countByStatus(ShelterStatus status);

    @Query("SELECT s FROM Shelter s WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL AND s.latitude BETWEEN -90.0 AND 90.0 AND s.longitude BETWEEN -180.0 AND 180.0 ORDER BY s.createdAt DESC")
    List<Shelter> findSheltersWithValidCoordinates();
}
