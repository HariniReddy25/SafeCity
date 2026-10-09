package com.safecity.controller;

import com.safecity.dto.*;
import com.safecity.service.AiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/report-assist")
    public ResponseEntity<AiAssistResponseDTO> enhanceReportDescription(@Valid @RequestBody AiAssistRequestDTO request) {
        AiAssistResponseDTO response = aiService.enhanceReportDescription(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/report-summary/{id}")
    @PreAuthorize("hasAnyRole('RESPONDER', 'ADMIN')")
    public ResponseEntity<AiSummaryResponseDTO> generateReportSummary(@PathVariable Long id) {
        AiSummaryResponseDTO response = aiService.generateReportSummary(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponseDTO> processSafetyChat(@Valid @RequestBody AiChatRequestDTO request) {
        AiChatResponseDTO response = aiService.processSafetyChat(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/parse-search-query")
    @PreAuthorize("hasAnyRole('RESPONDER', 'ADMIN')")
    public ResponseEntity<AiSearchResponseDTO> parseNaturalLanguageSearch(@Valid @RequestBody AiSearchRequestDTO request) {
        AiSearchResponseDTO response = aiService.parseNaturalLanguageSearch(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/safety-tips")
    public ResponseEntity<List<SafetyTipDTO>> getRecommendedSafetyTips(@RequestParam(required = false, defaultValue = "Hyderabad") String city) {
        List<SafetyTipDTO> tips = aiService.getRecommendedSafetyTips(city);
        return ResponseEntity.ok(tips);
    }
}
