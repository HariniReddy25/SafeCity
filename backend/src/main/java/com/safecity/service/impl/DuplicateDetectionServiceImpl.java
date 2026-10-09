package com.safecity.service.impl;

import com.safecity.dto.DuplicateCandidatePairDTO;
import com.safecity.dto.EmergencyReportResponseDTO;
import com.safecity.entity.EmergencyReport;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.service.DuplicateDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DuplicateDetectionServiceImpl implements DuplicateDetectionService {

    private static final double MAX_DISTANCE_METERS = 500.0;
    private static final long MAX_TIME_DIFF_MINUTES = 30;

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Override
    public List<DuplicateCandidatePairDTO> findPotentialDuplicateCandidates() {
        List<EmergencyReport> reports = reportRepository.findReportsWithValidCoordinates();
        List<DuplicateCandidatePairDTO> candidates = new ArrayList<>();

        for (int i = 0; i < reports.size(); i++) {
            EmergencyReport r1 = reports.get(i);

            for (int j = i + 1; j < reports.size(); j++) {
                EmergencyReport r2 = reports.get(j);

                // 1. Exclude self comparison
                if (r1.getId() != null && r1.getId().equals(r2.getId())) {
                    continue;
                }

                // 2. Category match check
                if (r1.getCategory() != r2.getCategory()) {
                    continue;
                }

                // 3. Coordinates validity check
                if (r1.getLatitude() == null || r1.getLongitude() == null ||
                    r2.getLatitude() == null || r2.getLongitude() == null) {
                    continue;
                }

                // 4. Exclude if both already linked to the SAME MasterIncident
                if (r1.getMasterIncident() != null && r2.getMasterIncident() != null &&
                    r1.getMasterIncident().getId() != null &&
                    r1.getMasterIncident().getId().equals(r2.getMasterIncident().getId())) {
                    continue;
                }

                // 5. Calculate spatial distance using Haversine formula
                double distance = calculateDistanceMeters(
                        r1.getLatitude(), r1.getLongitude(),
                        r2.getLatitude(), r2.getLongitude()
                );

                if (distance > MAX_DISTANCE_METERS) {
                    continue;
                }

                // 6. Calculate temporal difference
                long timeDiffMinutes = 0;
                if (r1.getIncidentDateTime() != null && r2.getIncidentDateTime() != null) {
                    timeDiffMinutes = Math.abs(Duration.between(r1.getIncidentDateTime(), r2.getIncidentDateTime()).toMinutes());
                }

                if (timeDiffMinutes > MAX_TIME_DIFF_MINUTES) {
                    continue;
                }

                // Match found! Create candidate pair DTO
                String reason = String.format("Category match (%s), distance %.1fm (<=500m), time diff %d mins (<=30 mins)",
                        r1.getCategory() != null ? r1.getCategory().getDisplayName() : "Unknown",
                        distance,
                        timeDiffMinutes);

                DuplicateCandidatePairDTO candidate = new DuplicateCandidatePairDTO(
                        EmergencyReportResponseDTO.fromEntity(r1),
                        EmergencyReportResponseDTO.fromEntity(r2),
                        distance,
                        timeDiffMinutes,
                        reason
                );

                candidates.add(candidate);
            }
        }

        return candidates;
    }

    @Override
    public double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_METERS = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
