package com.safecity.dto;

import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ResourceType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EmergencyIntelligenceResponseDTO {

    private Long reportId;
    private String reportCode;
    private IncidentCategory category;
    private ReportPriority priority;

    // Severity
    private String severityLevel;
    private Integer severityScore;
    private List<String> severityReasons = new ArrayList<>();

    // SLA
    private String slaStatus;
    private Long elapsedMinutes;
    private Long slaMinutesRemaining;
    private Boolean isEscalated;

    // Personnel
    private Boolean isResponderAssigned;
    private String assignedResponderName;
    private Long responderActiveWorkload;

    // Resources
    private List<ResourceType> recommendedResourceTypes = new ArrayList<>();
    private List<ResourceResponseDTO> currentlyDispatchedResources = new ArrayList<>();
    private List<NearbyResourceDTO> nearbyAvailableResources = new ArrayList<>();
    private Boolean primaryResourceDispatched;

    // Readiness
    private Integer readinessScore;
    private Map<String, Integer> readinessScoreBreakdown = new HashMap<>();

    // Recommendations
    private List<String> actionRecommendations = new ArrayList<>();

    private LocalDateTime generatedAt;

    public EmergencyIntelligenceResponseDTO() {
        this.generatedAt = LocalDateTime.now();
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public String getReportCode() {
        return reportCode;
    }

    public void setReportCode(String reportCode) {
        this.reportCode = reportCode;
    }

    public IncidentCategory getCategory() {
        return category;
    }

    public void setCategory(IncidentCategory category) {
        this.category = category;
    }

    public ReportPriority getPriority() {
        return priority;
    }

    public void setPriority(ReportPriority priority) {
        this.priority = priority;
    }

    public String getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(String severityLevel) {
        this.severityLevel = severityLevel;
    }

    public Integer getSeverityScore() {
        return severityScore;
    }

    public void setSeverityScore(Integer severityScore) {
        this.severityScore = severityScore;
    }

    public List<String> getSeverityReasons() {
        return severityReasons;
    }

    public void setSeverityReasons(List<String> severityReasons) {
        this.severityReasons = severityReasons;
    }

    public String getSlaStatus() {
        return slaStatus;
    }

    public void setSlaStatus(String slaStatus) {
        this.slaStatus = slaStatus;
    }

    public Long getElapsedMinutes() {
        return elapsedMinutes;
    }

    public void setElapsedMinutes(Long elapsedMinutes) {
        this.elapsedMinutes = elapsedMinutes;
    }

    public Long getSlaMinutesRemaining() {
        return slaMinutesRemaining;
    }

    public void setSlaMinutesRemaining(Long slaMinutesRemaining) {
        this.slaMinutesRemaining = slaMinutesRemaining;
    }

    public Boolean getIsEscalated() {
        return isEscalated;
    }

    public void setIsEscalated(Boolean isEscalated) {
        this.isEscalated = isEscalated;
    }

    public Boolean getIsResponderAssigned() {
        return isResponderAssigned;
    }

    public void setIsResponderAssigned(Boolean isResponderAssigned) {
        this.isResponderAssigned = isResponderAssigned;
    }

    public String getAssignedResponderName() {
        return assignedResponderName;
    }

    public void setAssignedResponderName(String assignedResponderName) {
        this.assignedResponderName = assignedResponderName;
    }

    public Long getResponderActiveWorkload() {
        return responderActiveWorkload;
    }

    public void setResponderActiveWorkload(Long responderActiveWorkload) {
        this.responderActiveWorkload = responderActiveWorkload;
    }

    public List<ResourceType> getRecommendedResourceTypes() {
        return recommendedResourceTypes;
    }

    public void setRecommendedResourceTypes(List<ResourceType> recommendedResourceTypes) {
        this.recommendedResourceTypes = recommendedResourceTypes;
    }

    public List<ResourceResponseDTO> getCurrentlyDispatchedResources() {
        return currentlyDispatchedResources;
    }

    public void setCurrentlyDispatchedResources(List<ResourceResponseDTO> currentlyDispatchedResources) {
        this.currentlyDispatchedResources = currentlyDispatchedResources;
    }

    public List<NearbyResourceDTO> getNearbyAvailableResources() {
        return nearbyAvailableResources;
    }

    public void setNearbyAvailableResources(List<NearbyResourceDTO> nearbyAvailableResources) {
        this.nearbyAvailableResources = nearbyAvailableResources;
    }

    public Boolean getPrimaryResourceDispatched() {
        return primaryResourceDispatched;
    }

    public void setPrimaryResourceDispatched(Boolean primaryResourceDispatched) {
        this.primaryResourceDispatched = primaryResourceDispatched;
    }

    public Integer getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(Integer readinessScore) {
        this.readinessScore = readinessScore;
    }

    public Map<String, Integer> getReadinessScoreBreakdown() {
        return readinessScoreBreakdown;
    }

    public void setReadinessScoreBreakdown(Map<String, Integer> readinessScoreBreakdown) {
        this.readinessScoreBreakdown = readinessScoreBreakdown;
    }

    public List<String> getActionRecommendations() {
        return actionRecommendations;
    }

    public void setActionRecommendations(List<String> actionRecommendations) {
        this.actionRecommendations = actionRecommendations;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
