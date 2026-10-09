package com.safecity.service;

import com.safecity.dto.CreateEmergencyBroadcastRequestDTO;
import com.safecity.dto.EmergencyBroadcastResponseDTO;

import java.util.List;

public interface EmergencyBroadcastService {

    EmergencyBroadcastResponseDTO createBroadcast(CreateEmergencyBroadcastRequestDTO request, String adminEmail);

    List<EmergencyBroadcastResponseDTO> getActiveBroadcasts();

    List<EmergencyBroadcastResponseDTO> getAllBroadcastsForAdmin();

    List<EmergencyBroadcastResponseDTO> getNearbyActiveBroadcasts(Double latitude, Double longitude);

    EmergencyBroadcastResponseDTO cancelBroadcast(Long id, String adminEmail);

    EmergencyBroadcastResponseDTO getBroadcastById(Long id);
}
