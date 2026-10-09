package com.safecity.service;

import com.safecity.dto.EmergencyReportResponseDTO;

import java.util.List;

public interface EmergencyEscalationService {

    List<EmergencyReportResponseDTO> checkAndEscalateReports();
}
