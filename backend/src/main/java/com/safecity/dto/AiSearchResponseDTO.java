package com.safecity.dto;

import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;

public class AiSearchResponseDTO {

    private String originalQuery;
    private IncidentCategory parsedCategory;
    private ReportPriority parsedPriority;
    private ReportStatus parsedStatus;
    private String parsedCity;
    private String queryExplanation;
    private boolean fallback;

    public AiSearchResponseDTO() {}

    public AiSearchResponseDTO(String originalQuery, IncidentCategory parsedCategory, ReportPriority parsedPriority,
                               ReportStatus parsedStatus, String parsedCity, String queryExplanation, boolean fallback) {
        this.originalQuery = originalQuery;
        this.parsedCategory = parsedCategory;
        this.parsedPriority = parsedPriority;
        this.parsedStatus = parsedStatus;
        this.parsedCity = parsedCity;
        this.queryExplanation = queryExplanation;
        this.fallback = fallback;
    }

    public String getOriginalQuery() {
        return originalQuery;
    }

    public void setOriginalQuery(String originalQuery) {
        this.originalQuery = originalQuery;
    }

    public IncidentCategory getParsedCategory() {
        return parsedCategory;
    }

    public void setParsedCategory(IncidentCategory parsedCategory) {
        this.parsedCategory = parsedCategory;
    }

    public ReportPriority getParsedPriority() {
        return parsedPriority;
    }

    public void setParsedPriority(ReportPriority parsedPriority) {
        this.parsedPriority = parsedPriority;
    }

    public ReportStatus getParsedStatus() {
        return parsedStatus;
    }

    public void setParsedStatus(ReportStatus parsedStatus) {
        this.parsedStatus = parsedStatus;
    }

    public String getParsedCity() {
        return parsedCity;
    }

    public void setParsedCity(String parsedCity) {
        this.parsedCity = parsedCity;
    }

    public String getQueryExplanation() {
        return queryExplanation;
    }

    public void setQueryExplanation(String queryExplanation) {
        this.queryExplanation = queryExplanation;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
