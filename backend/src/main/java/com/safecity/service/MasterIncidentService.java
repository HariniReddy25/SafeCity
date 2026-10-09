package com.safecity.service;

import com.safecity.dto.MasterIncidentResponseDTO;
import com.safecity.dto.MergeReportsRequestDTO;

public interface MasterIncidentService {

    MasterIncidentResponseDTO mergeReports(MergeReportsRequestDTO request);

    MasterIncidentResponseDTO getMasterIncidentById(Long masterId);

    MasterIncidentResponseDTO unmergeReport(Long masterId, Long reportId);
}
