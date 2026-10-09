package com.safecity.service;

import com.safecity.dto.DuplicateCandidatePairDTO;

import java.util.List;

public interface DuplicateDetectionService {

    List<DuplicateCandidatePairDTO> findPotentialDuplicateCandidates();

    double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2);
}
