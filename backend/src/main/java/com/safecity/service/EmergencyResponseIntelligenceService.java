package com.safecity.service;

import com.safecity.dto.EmergencyIntelligenceResponseDTO;

public interface EmergencyResponseIntelligenceService {

    /**
     * Generates comprehensive emergency response intelligence for an EmergencyReport (Admin view).
     */
    EmergencyIntelligenceResponseDTO getReportIntelligence(Long reportId);

    /**
     * Generates response intelligence for a specific responder's assigned emergency report.
     * Enforces responder assignment authorization rules.
     */
    EmergencyIntelligenceResponseDTO getResponderEmergencyIntelligence(String responderEmail, Long reportId);
}
