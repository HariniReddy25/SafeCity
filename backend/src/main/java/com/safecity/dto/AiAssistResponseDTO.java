package com.safecity.dto;

import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;

import java.util.List;

public class AiAssistResponseDTO {

    private String originalDescription;
    private String enhancedDescription;
    private IncidentCategory suggestedCategory;
    private String suggestedCategoryLabel;
    private ReportPriority suggestedPriority;
    private String summary;
    private List<String> extractedKeyDetails;
    private boolean fallback;
    private String message;

    public AiAssistResponseDTO() {}

    public AiAssistResponseDTO(String originalDescription, String enhancedDescription, IncidentCategory suggestedCategory,
                                String suggestedCategoryLabel, ReportPriority suggestedPriority, String summary,
                                List<String> extractedKeyDetails, boolean fallback, String message) {
        this.originalDescription = originalDescription;
        this.enhancedDescription = enhancedDescription;
        this.suggestedCategory = suggestedCategory;
        this.suggestedCategoryLabel = suggestedCategoryLabel;
        this.suggestedPriority = suggestedPriority;
        this.summary = summary;
        this.extractedKeyDetails = extractedKeyDetails;
        this.fallback = fallback;
        this.message = message;
    }

    public String getOriginalDescription() {
        return originalDescription;
    }

    public void setOriginalDescription(String originalDescription) {
        this.originalDescription = originalDescription;
    }

    public String getEnhancedDescription() {
        return enhancedDescription;
    }

    public void setEnhancedDescription(String enhancedDescription) {
        this.enhancedDescription = enhancedDescription;
    }

    public IncidentCategory getSuggestedCategory() {
        return suggestedCategory;
    }

    public void setSuggestedCategory(IncidentCategory suggestedCategory) {
        this.suggestedCategory = suggestedCategory;
    }

    public String getSuggestedCategoryLabel() {
        return suggestedCategoryLabel;
    }

    public void setSuggestedCategoryLabel(String suggestedCategoryLabel) {
        this.suggestedCategoryLabel = suggestedCategoryLabel;
    }

    public ReportPriority getSuggestedPriority() {
        return suggestedPriority;
    }

    public void setSuggestedPriority(ReportPriority suggestedPriority) {
        this.suggestedPriority = suggestedPriority;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getExtractedKeyDetails() {
        return extractedKeyDetails;
    }

    public void setExtractedKeyDetails(List<String> extractedKeyDetails) {
        this.extractedKeyDetails = extractedKeyDetails;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
