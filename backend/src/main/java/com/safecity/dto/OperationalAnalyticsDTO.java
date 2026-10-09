package com.safecity.dto;

import java.util.List;
import java.util.Map;

public class OperationalAnalyticsDTO {

    // 1. SLA & Response Performance
    private double slaComplianceRate;
    private long totalSlaBreachedIncidents;
    private Map<String, Long> slaBreachesByPriority;
    private double avgFirstResponseTimeMinutes;
    private double avgAssignmentTimeMinutes;
    private double avgResolutionTimeMinutes;

    // 2. Incident Distribution
    private long totalIncidents;
    private Map<String, Long> categoryCounts;
    private Map<String, Double> categoryPercentages;
    private Map<String, Long> priorityCounts;
    private Map<String, Double> priorityPercentages;

    // 3. Resource Utilization
    private long totalResources;
    private long availableResources;
    private long dispatchedResources;
    private long maintenanceResources;
    private long offlineResources;
    private double resourceUtilizationRate;
    private Map<String, ResourceTypeStatsDTO> resourceTypeBreakdown;

    // 4. Responder Statistics
    private long totalResponders;
    private long activeResponders;
    private long inactiveResponders;
    private long totalActiveAssignments;
    private double avgActiveReportsPerResponder;
    private List<ResponderStatDTO> responderStats;

    // 5. Duplicate / Master Incident Analytics
    private long totalReports;
    private long totalMasterIncidents;
    private long linkedReports;
    private long standaloneReports;
    private double deduplicationRatio;

    // 6. Escalation Analytics
    private long totalEscalatedIncidents;
    private double escalationRate;
    private Map<String, Long> escalationsByPriority;
    private Map<String, Long> escalationsByCategory;

    // 7. Time-Based Trends
    private List<DailyTrendDTO> dailyTrends;

    public OperationalAnalyticsDTO() {
    }

    public double getSlaComplianceRate() {
        return slaComplianceRate;
    }

    public void setSlaComplianceRate(double slaComplianceRate) {
        this.slaComplianceRate = slaComplianceRate;
    }

    public long getTotalSlaBreachedIncidents() {
        return totalSlaBreachedIncidents;
    }

    public void setTotalSlaBreachedIncidents(long totalSlaBreachedIncidents) {
        this.totalSlaBreachedIncidents = totalSlaBreachedIncidents;
    }

    public Map<String, Long> getSlaBreachesByPriority() {
        return slaBreachesByPriority;
    }

    public void setSlaBreachesByPriority(Map<String, Long> slaBreachesByPriority) {
        this.slaBreachesByPriority = slaBreachesByPriority;
    }

    public double getAvgFirstResponseTimeMinutes() {
        return avgFirstResponseTimeMinutes;
    }

    public void setAvgFirstResponseTimeMinutes(double avgFirstResponseTimeMinutes) {
        this.avgFirstResponseTimeMinutes = avgFirstResponseTimeMinutes;
    }

    public double getAvgAssignmentTimeMinutes() {
        return avgAssignmentTimeMinutes;
    }

    public void setAvgAssignmentTimeMinutes(double avgAssignmentTimeMinutes) {
        this.avgAssignmentTimeMinutes = avgAssignmentTimeMinutes;
    }

    public double getAvgResolutionTimeMinutes() {
        return avgResolutionTimeMinutes;
    }

    public void setAvgResolutionTimeMinutes(double avgResolutionTimeMinutes) {
        this.avgResolutionTimeMinutes = avgResolutionTimeMinutes;
    }

    public long getTotalIncidents() {
        return totalIncidents;
    }

    public void setTotalIncidents(long totalIncidents) {
        this.totalIncidents = totalIncidents;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Map<String, Long> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }

    public Map<String, Double> getCategoryPercentages() {
        return categoryPercentages;
    }

    public void setCategoryPercentages(Map<String, Double> categoryPercentages) {
        this.categoryPercentages = categoryPercentages;
    }

    public Map<String, Long> getPriorityCounts() {
        return priorityCounts;
    }

    public void setPriorityCounts(Map<String, Long> priorityCounts) {
        this.priorityCounts = priorityCounts;
    }

    public Map<String, Double> getPriorityPercentages() {
        return priorityPercentages;
    }

    public void setPriorityPercentages(Map<String, Double> priorityPercentages) {
        this.priorityPercentages = priorityPercentages;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getAvailableResources() {
        return availableResources;
    }

    public void setAvailableResources(long availableResources) {
        this.availableResources = availableResources;
    }

    public long getDispatchedResources() {
        return dispatchedResources;
    }

    public void setDispatchedResources(long dispatchedResources) {
        this.dispatchedResources = dispatchedResources;
    }

    public long getMaintenanceResources() {
        return maintenanceResources;
    }

    public void setMaintenanceResources(long maintenanceResources) {
        this.maintenanceResources = maintenanceResources;
    }

    public long getOfflineResources() {
        return offlineResources;
    }

    public void setOfflineResources(long offlineResources) {
        this.offlineResources = offlineResources;
    }

    public double getResourceUtilizationRate() {
        return resourceUtilizationRate;
    }

    public void setResourceUtilizationRate(double resourceUtilizationRate) {
        this.resourceUtilizationRate = resourceUtilizationRate;
    }

    public Map<String, ResourceTypeStatsDTO> getResourceTypeBreakdown() {
        return resourceTypeBreakdown;
    }

    public void setResourceTypeBreakdown(Map<String, ResourceTypeStatsDTO> resourceTypeBreakdown) {
        this.resourceTypeBreakdown = resourceTypeBreakdown;
    }

    public long getTotalResponders() {
        return totalResponders;
    }

    public void setTotalResponders(long totalResponders) {
        this.totalResponders = totalResponders;
    }

    public long getActiveResponders() {
        return activeResponders;
    }

    public void setActiveResponders(long activeResponders) {
        this.activeResponders = activeResponders;
    }

    public long getInactiveResponders() {
        return inactiveResponders;
    }

    public void setInactiveResponders(long inactiveResponders) {
        this.inactiveResponders = inactiveResponders;
    }

    public long getTotalActiveAssignments() {
        return totalActiveAssignments;
    }

    public void setTotalActiveAssignments(long totalActiveAssignments) {
        this.totalActiveAssignments = totalActiveAssignments;
    }

    public double getAvgActiveReportsPerResponder() {
        return avgActiveReportsPerResponder;
    }

    public void setAvgActiveReportsPerResponder(double avgActiveReportsPerResponder) {
        this.avgActiveReportsPerResponder = avgActiveReportsPerResponder;
    }

    public List<ResponderStatDTO> getResponderStats() {
        return responderStats;
    }

    public void setResponderStats(List<ResponderStatDTO> responderStats) {
        this.responderStats = responderStats;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getTotalMasterIncidents() {
        return totalMasterIncidents;
    }

    public void setTotalMasterIncidents(long totalMasterIncidents) {
        this.totalMasterIncidents = totalMasterIncidents;
    }

    public long getLinkedReports() {
        return linkedReports;
    }

    public void setLinkedReports(long linkedReports) {
        this.linkedReports = linkedReports;
    }

    public long getStandaloneReports() {
        return standaloneReports;
    }

    public void setStandaloneReports(long standaloneReports) {
        this.standaloneReports = standaloneReports;
    }

    public double getDeduplicationRatio() {
        return deduplicationRatio;
    }

    public void setDeduplicationRatio(double deduplicationRatio) {
        this.deduplicationRatio = deduplicationRatio;
    }

    public long getTotalEscalatedIncidents() {
        return totalEscalatedIncidents;
    }

    public void setTotalEscalatedIncidents(long totalEscalatedIncidents) {
        this.totalEscalatedIncidents = totalEscalatedIncidents;
    }

    public double getEscalationRate() {
        return escalationRate;
    }

    public void setEscalationRate(double escalationRate) {
        this.escalationRate = escalationRate;
    }

    public Map<String, Long> getEscalationsByPriority() {
        return escalationsByPriority;
    }

    public void setEscalationsByPriority(Map<String, Long> escalationsByPriority) {
        this.escalationsByPriority = escalationsByPriority;
    }

    public Map<String, Long> getEscalationsByCategory() {
        return escalationsByCategory;
    }

    public void setEscalationsByCategory(Map<String, Long> escalationsByCategory) {
        this.escalationsByCategory = escalationsByCategory;
    }

    public List<DailyTrendDTO> getDailyTrends() {
        return dailyTrends;
    }

    public void setDailyTrends(List<DailyTrendDTO> dailyTrends) {
        this.dailyTrends = dailyTrends;
    }

    public static class ResourceTypeStatsDTO {
        private String resourceType;
        private String displayName;
        private long total;
        private long available;
        private long dispatched;
        private long maintenance;
        private long offline;
        private double utilizationRate;

        public ResourceTypeStatsDTO() {
        }

        public ResourceTypeStatsDTO(String resourceType, String displayName, long total, long available,
                                   long dispatched, long maintenance, long offline, double utilizationRate) {
            this.resourceType = resourceType;
            this.displayName = displayName;
            this.total = total;
            this.available = available;
            this.dispatched = dispatched;
            this.maintenance = maintenance;
            this.offline = offline;
            this.utilizationRate = utilizationRate;
        }

        public String getResourceType() {
            return resourceType;
        }

        public void setResourceType(String resourceType) {
            this.resourceType = resourceType;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public long getAvailable() {
            return available;
        }

        public void setAvailable(long available) {
            this.available = available;
        }

        public long getDispatched() {
            return dispatched;
        }

        public void setDispatched(long dispatched) {
            this.dispatched = dispatched;
        }

        public long getMaintenance() {
            return maintenance;
        }

        public void setMaintenance(long maintenance) {
            this.maintenance = maintenance;
        }

        public long getOffline() {
            return offline;
        }

        public void setOffline(long offline) {
            this.offline = offline;
        }

        public double getUtilizationRate() {
            return utilizationRate;
        }

        public void setUtilizationRate(double utilizationRate) {
            this.utilizationRate = utilizationRate;
        }
    }

    public static class ResponderStatDTO {
        private Long responderId;
        private String fullName;
        private String email;
        private boolean enabled;
        private long activeAssignedCount;
        private long resolvedCount;

        public ResponderStatDTO() {
        }

        public ResponderStatDTO(Long responderId, String fullName, String email, boolean enabled,
                               long activeAssignedCount, long resolvedCount) {
            this.responderId = responderId;
            this.fullName = fullName;
            this.email = email;
            this.enabled = enabled;
            this.activeAssignedCount = activeAssignedCount;
            this.resolvedCount = resolvedCount;
        }

        public Long getResponderId() {
            return responderId;
        }

        public void setResponderId(Long responderId) {
            this.responderId = responderId;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public long getActiveAssignedCount() {
            return activeAssignedCount;
        }

        public void setActiveAssignedCount(long activeAssignedCount) {
            this.activeAssignedCount = activeAssignedCount;
        }

        public long getResolvedCount() {
            return resolvedCount;
        }

        public void setResolvedCount(long resolvedCount) {
            this.resolvedCount = resolvedCount;
        }
    }

    public static class DailyTrendDTO {
        private String date;
        private long count;

        public DailyTrendDTO() {
        }

        public DailyTrendDTO(String date, long count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }
}
