package com.safecity.service;

import com.safecity.dto.*;
import com.safecity.entity.ShelterStatus;

import java.util.List;

public interface ShelterService {

    ShelterDTO createShelter(CreateShelterRequestDTO request);

    List<ShelterDTO> getAllSheltersForAdmin();

    ShelterDTO getShelterById(Long id);

    ShelterDTO updateShelter(Long id, UpdateShelterRequestDTO request);

    ShelterDTO updateShelterStatus(Long id, ShelterStatus status);

    ShelterDTO updateShelterOccupancy(Long id, Integer currentOccupancy);

    List<ShelterDTO> getAvailableSheltersForPublic();

    List<NearbyShelterDTO> getNearbySheltersForPublic(Double lat, Double lon);
}
