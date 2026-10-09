package com.safecity.service;

import com.safecity.dto.*;

import java.util.List;

public interface AiService {

    AiAssistResponseDTO enhanceReportDescription(AiAssistRequestDTO request);

    AiSummaryResponseDTO generateReportSummary(Long reportId);

    AiChatResponseDTO processSafetyChat(AiChatRequestDTO request);

    AiSearchResponseDTO parseNaturalLanguageSearch(AiSearchRequestDTO request);

    List<SafetyTipDTO> getRecommendedSafetyTips(String city);
}
