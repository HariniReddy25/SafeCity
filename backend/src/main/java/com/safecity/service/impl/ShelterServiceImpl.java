package com.safecity.service.impl;

import com.safecity.dto.*;
import com.safecity.entity.Shelter;
import com.safecity.entity.ShelterStatus;
import com.safecity.exception.ResourceNotFoundException;
import com.safecity.repository.ShelterRepository;
import com.safecity.service.ShelterService;
import com.safecity.util.HaversineDistanceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShelterServiceImpl implements ShelterService {

    @Autowired
    private ShelterRepository shelterRepository;

    @Override
    @Transactional
    public ShelterDTO createShelter(CreateShelterRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Shelter creation request cannot be null.");
        }

        String code = request.getShelterCode() != null ? request.getShelterCode().trim().toUpperCase() : "";
        if (code.isEmpty()) {
            throw new IllegalArgumentException("Shelter code is required.");
        }

        if (shelterRepository.findByShelterCode(code).isPresent()) {
            throw new IllegalArgumentException("Shelter with code '" + code + "' already exists.");
        }

        validateCapacityAndOccupancy(request.getCapacity(), request.getCurrentOccupancy());
        validateCoordinates(request.getLatitude(), request.getLongitude());

        ShelterStatus status = request.getStatus() != null ? request.getStatus() : ShelterStatus.AVAILABLE;
        int cap = request.getCapacity();
        int occ = request.getCurrentOccupancy() != null ? request.getCurrentOccupancy() : 0;

        // Auto-update status if full
        if (occ >= cap && status == ShelterStatus.AVAILABLE) {
            status = ShelterStatus.FULL;
        }

        Shelter shelter = new Shelter(
                code,
                request.getName().trim(),
                request.getDescription(),
                request.getAddress().trim(),
                request.getLatitude(),
                request.getLongitude(),
                cap,
                occ,
                status,
                request.getContactPhone(),
                request.getFacilities()
        );

        Shelter savedShelter = shelterRepository.save(shelter);
        return ShelterDTO.fromEntity(savedShelter);
    }

    @Override
    public List<ShelterDTO> getAllSheltersForAdmin() {
        return shelterRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ShelterDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public ShelterDTO getShelterById(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));
        return ShelterDTO.fromEntity(shelter);
    }

    @Override
    @Transactional
    public ShelterDTO updateShelter(Long id, UpdateShelterRequestDTO request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));

        int newCap = request.getCapacity() != null ? request.getCapacity() : shelter.getCapacity();
        int newOcc = request.getCurrentOccupancy() != null ? request.getCurrentOccupancy() : shelter.getCurrentOccupancy();

        validateCapacityAndOccupancy(newCap, newOcc);
        validateCoordinates(request.getLatitude(), request.getLongitude());

        shelter.setName(request.getName().trim());
        shelter.setDescription(request.getDescription());
        shelter.setAddress(request.getAddress().trim());
        shelter.setLatitude(request.getLatitude());
        shelter.setLongitude(request.getLongitude());
        shelter.setCapacity(newCap);
        shelter.setCurrentOccupancy(newOcc);

        if (request.getStatus() != null) {
            shelter.setStatus(request.getStatus());
        }
        if (request.getContactPhone() != null) {
            shelter.setContactPhone(request.getContactPhone());
        }
        if (request.getFacilities() != null) {
            shelter.setFacilities(request.getFacilities());
        }

        // Auto status adjustment
        if (shelter.getCurrentOccupancy() >= shelter.getCapacity() && shelter.getStatus() == ShelterStatus.AVAILABLE) {
            shelter.setStatus(ShelterStatus.FULL);
        } else if (shelter.getCurrentOccupancy() < shelter.getCapacity() && shelter.getStatus() == ShelterStatus.FULL) {
            shelter.setStatus(ShelterStatus.AVAILABLE);
        }

        Shelter saved = shelterRepository.save(shelter);
        return ShelterDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public ShelterDTO updateShelterStatus(Long id, ShelterStatus status) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));

        if (status == null) {
            throw new IllegalArgumentException("Shelter status cannot be null.");
        }

        shelter.setStatus(status);
        Shelter saved = shelterRepository.save(shelter);
        return ShelterDTO.fromEntity(saved);
    }

    @Override
    @Transactional
    public ShelterDTO updateShelterOccupancy(Long id, Integer currentOccupancy) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelter not found with id: " + id));

        validateCapacityAndOccupancy(shelter.getCapacity(), currentOccupancy);

        shelter.setCurrentOccupancy(currentOccupancy);

        if (currentOccupancy >= shelter.getCapacity() && shelter.getStatus() == ShelterStatus.AVAILABLE) {
            shelter.setStatus(ShelterStatus.FULL);
        } else if (currentOccupancy < shelter.getCapacity() && shelter.getStatus() == ShelterStatus.FULL) {
            shelter.setStatus(ShelterStatus.AVAILABLE);
        }

        Shelter saved = shelterRepository.save(shelter);
        return ShelterDTO.fromEntity(saved);
    }

    @Override
    public List<ShelterDTO> getAvailableSheltersForPublic() {
        List<ShelterStatus> activeStatuses = Arrays.asList(ShelterStatus.AVAILABLE, ShelterStatus.FULL, ShelterStatus.EMERGENCY_ONLY);
        return shelterRepository.findByStatusInOrderByCreatedAtDesc(activeStatuses)
                .stream()
                .map(ShelterDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<NearbyShelterDTO> getNearbySheltersForPublic(Double lat, Double lon) {
        List<ShelterDTO> availableShelters = getAvailableSheltersForPublic();

        return availableShelters.stream().map(dto -> {
            Double dist = HaversineDistanceUtil.calculateDistanceKm(lat, lon, dto.getLatitude(), dto.getLongitude());
            return NearbyShelterDTO.fromShelterDTO(dto, dist);
        }).sorted(Comparator.comparing(NearbyShelterDTO::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder())))
          .collect(Collectors.toList());
    }

    private void validateCapacityAndOccupancy(Integer capacity, Integer occupancy) {
        if (capacity == null || capacity < 0) {
            throw new IllegalArgumentException("Shelter capacity cannot be negative.");
        }
        if (occupancy != null) {
            if (occupancy < 0) {
                throw new IllegalArgumentException("Shelter occupancy cannot be negative.");
            }
            if (occupancy > capacity) {
                throw new IllegalArgumentException("Shelter occupancy (" + occupancy + ") cannot exceed capacity (" + capacity + ").");
            }
        }
    }

    private void validateCoordinates(Double lat, Double lon) {
        if (lat != null && (lat < -90.0 || lat > 90.0)) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90.");
        }
        if (lon != null && (lon < -180.0 || lon > 180.0)) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180.");
        }
    }
}
