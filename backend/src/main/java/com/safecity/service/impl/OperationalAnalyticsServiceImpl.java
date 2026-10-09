package com.safecity.service.impl;

import com.safecity.dto.OperationalAnalyticsDTO;
import com.safecity.entity.*;
import com.safecity.repository.*;
import com.safecity.service.OperationalAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OperationalAnalyticsServiceImpl implements OperationalAnalyticsService {

    @Autowired
    private EmergencyReportRepository emergencyReportRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private MasterIncidentRepository masterIncidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public OperationalAnalyticsDTO getOperationalAnalytics() {
        OperationalAnalyticsDTO analytics = new OperationalAnalyticsDTO();

        List<EmergencyReport> allReports = emergencyReportRepository.findAll();
        List<StatusHistory> allHistories = statusHistoryRepository.findAll();
        List<Resource> allResources = resourceRepository.findAll();
        List<User> allResponders = userRepository.findByRole(Role.RESPONDER);
        long totalMasterIncidents = masterIncidentRepository.count();

        // Group status histories by report ID for fast lookup
        Map<Long, List<StatusHistory>> historiesByReportId = allHistories.stream()
                .filter(h -> h.getReport() != null)
                .collect(Collectors.groupingBy(h -> h.getReport().getId()));

        // 1. SLA & Response Performance
        calculateSlaAndResponsePerformance(analytics, allReports, historiesByReportId);

        // 2. Incident Distribution
        calculateIncidentDistribution(analytics, allReports);

        // 3. Resource Utilization
        calculateResourceUtilization(analytics, allResources);

        // 4. Responder Statistics
        calculateResponderStatistics(analytics, allResponders, allReports);

        // 5. Duplicate / Master Incident Analytics
        calculateDuplicateAnalytics(analytics, allReports, totalMasterIncidents);

        // 6. Escalation Analytics
        calculateEscalationAnalytics(analytics, allReports);

        // 7. Time-Based Trends
        calculateTimeBasedTrends(analytics, allReports);

        return analytics;
    }

    private void calculateSlaAndResponsePerformance(OperationalAnalyticsDTO analytics,
                                                    List<EmergencyReport> reports,
                                                    Map<Long, List<StatusHistory>> historiesByReportId) {
        long totalReports = reports.size();
        long breachedCount = 0;
        Map<String, Long> breachesByPriority = new LinkedHashMap<>();
        for (ReportPriority p : ReportPriority.values()) {
            breachesByPriority.put(p.name(), 0L);
        }

        long firstResponseSumMinutes = 0;
        long firstResponseCount = 0;

        long assignmentSumMinutes = 0;
        long assignmentCount = 0;

        long resolutionSumMinutes = 0;
        long resolutionCount = 0;

        for (EmergencyReport report : reports) {
            boolean isBreached = report.getEscalatedAt() != null;
            if (isBreached) {
                breachedCount++;
                String pName = report.getPriority() != null ? report.getPriority().name() : "MEDIUM";
                breachesByPriority.put(pName, breachesByPriority.getOrDefault(pName, 0L) + 1);
            }

            LocalDateTime createdAt = report.getCreatedAt();
            if (createdAt == null) continue;

            List<StatusHistory> histories = historiesByReportId.getOrDefault(report.getId(), Collections.emptyList());
            histories.sort(Comparator.comparing(BaseEntity::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));

            // First Response Time: earliest transition to UNDER_REVIEW, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED
            Optional<StatusHistory> firstRespHistory = histories.stream()
                    .filter(h -> h.getNewStatus() != null && h.getNewStatus() != ReportStatus.SUBMITTED)
                    .findFirst();

            if (firstRespHistory.isPresent() && firstRespHistory.get().getCreatedAt() != null) {
                long minutes = Math.max(0, Duration.between(createdAt, firstRespHistory.get().getCreatedAt()).toMinutes());
                firstResponseSumMinutes += minutes;
                firstResponseCount++;
            }

            // Assignment Time: earliest transition to ASSIGNED
            Optional<StatusHistory> assignHistory = histories.stream()
                    .filter(h -> h.getNewStatus() == ReportStatus.ASSIGNED)
                    .findFirst();

            if (assignHistory.isPresent() && assignHistory.get().getCreatedAt() != null) {
                long minutes = Math.max(0, Duration.between(createdAt, assignHistory.get().getCreatedAt()).toMinutes());
                assignmentSumMinutes += minutes;
                assignmentCount++;
            } else if (report.getAssignedResponder() != null) {
                LocalDateTime updated = report.getUpdatedAt() != null ? report.getUpdatedAt() : LocalDateTime.now();
                long minutes = Math.max(0, Duration.between(createdAt, updated).toMinutes());
                assignmentSumMinutes += minutes;
                assignmentCount++;
            }

            // Resolution Time: earliest transition to RESOLVED or CLOSED
            Optional<StatusHistory> resolveHistory = histories.stream()
                    .filter(h -> h.getNewStatus() == ReportStatus.RESOLVED || h.getNewStatus() == ReportStatus.CLOSED)
                    .findFirst();

            if (resolveHistory.isPresent() && resolveHistory.get().getCreatedAt() != null) {
                long minutes = Math.max(0, Duration.between(createdAt, resolveHistory.get().getCreatedAt()).toMinutes());
                resolutionSumMinutes += minutes;
                resolutionCount++;
            } else if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.CLOSED) {
                LocalDateTime updated = report.getUpdatedAt() != null ? report.getUpdatedAt() : LocalDateTime.now();
                long minutes = Math.max(0, Duration.between(createdAt, updated).toMinutes());
                resolutionSumMinutes += minutes;
                resolutionCount++;
            }
        }

        double complianceRate = totalReports > 0 ? round(((double) (totalReports - breachedCount) / totalReports) * 100.0) : 100.0;
        analytics.setSlaComplianceRate(complianceRate);
        analytics.setTotalSlaBreachedIncidents(breachedCount);
        analytics.setSlaBreachesByPriority(breachesByPriority);

        analytics.setAvgFirstResponseTimeMinutes(firstResponseCount > 0 ? round((double) firstResponseSumMinutes / firstResponseCount) : 0.0);
        analytics.setAvgAssignmentTimeMinutes(assignmentCount > 0 ? round((double) assignmentSumMinutes / assignmentCount) : 0.0);
        analytics.setAvgResolutionTimeMinutes(resolutionCount > 0 ? round((double) resolutionSumMinutes / resolutionCount) : 0.0);
    }

    private void calculateIncidentDistribution(OperationalAnalyticsDTO analytics, List<EmergencyReport> reports) {
        long total = reports.size();
        analytics.setTotalIncidents(total);

        Map<String, Long> categoryCounts = new LinkedHashMap<>();
        Map<String, Double> categoryPercentages = new LinkedHashMap<>();
        for (IncidentCategory c : IncidentCategory.values()) {
            categoryCounts.put(c.name(), 0L);
            categoryPercentages.put(c.name(), 0.0);
        }

        Map<String, Long> priorityCounts = new LinkedHashMap<>();
        Map<String, Double> priorityPercentages = new LinkedHashMap<>();
        for (ReportPriority p : ReportPriority.values()) {
            priorityCounts.put(p.name(), 0L);
            priorityPercentages.put(p.name(), 0.0);
        }

        for (EmergencyReport report : reports) {
            if (report.getCategory() != null) {
                String cat = report.getCategory().name();
                categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1);
            }
            if (report.getPriority() != null) {
                String prio = report.getPriority().name();
                priorityCounts.put(prio, priorityCounts.getOrDefault(prio, 0L) + 1);
            }
        }

        if (total > 0) {
            categoryCounts.forEach((cat, count) -> categoryPercentages.put(cat, round(((double) count / total) * 100.0)));
            priorityCounts.forEach((prio, count) -> priorityPercentages.put(prio, round(((double) count / total) * 100.0)));
        }

        analytics.setCategoryCounts(categoryCounts);
        analytics.setCategoryPercentages(categoryPercentages);
        analytics.setPriorityCounts(priorityCounts);
        analytics.setPriorityPercentages(priorityPercentages);
    }

    private void calculateResourceUtilization(OperationalAnalyticsDTO analytics, List<Resource> resources) {
        long total = resources.size();
        long available = 0;
        long dispatched = 0;
        long maintenance = 0;
        long offline = 0;

        Map<String, OperationalAnalyticsDTO.ResourceTypeStatsDTO> typeMap = new LinkedHashMap<>();
        for (ResourceType t : ResourceType.values()) {
            typeMap.put(t.name(), new OperationalAnalyticsDTO.ResourceTypeStatsDTO(t.name(), t.getDisplayName(), 0, 0, 0, 0, 0, 0.0));
        }

        for (Resource res : resources) {
            ResourceStatus status = res.getStatus();
            ResourceType type = res.getType();

            if (status == ResourceStatus.AVAILABLE) available++;
            else if (status == ResourceStatus.DISPATCHED) dispatched++;
            else if (status == ResourceStatus.MAINTENANCE) maintenance++;
            else if (status == ResourceStatus.OFFLINE) offline++;

            if (type != null) {
                OperationalAnalyticsDTO.ResourceTypeStatsDTO typeStats = typeMap.get(type.name());
                if (typeStats != null) {
                    typeStats.setTotal(typeStats.getTotal() + 1);
                    if (status == ResourceStatus.AVAILABLE) typeStats.setAvailable(typeStats.getAvailable() + 1);
                    else if (status == ResourceStatus.DISPATCHED) typeStats.setDispatched(typeStats.getDispatched() + 1);
                    else if (status == ResourceStatus.MAINTENANCE) typeStats.setMaintenance(typeStats.getMaintenance() + 1);
                    else if (status == ResourceStatus.OFFLINE) typeStats.setOffline(typeStats.getOffline() + 1);
                }
            }
        }

        typeMap.values().forEach(stats -> {
            if (stats.getTotal() > 0) {
                stats.setUtilizationRate(round(((double) stats.getDispatched() / stats.getTotal()) * 100.0));
            }
        });

        analytics.setTotalResources(total);
        analytics.setAvailableResources(available);
        analytics.setDispatchedResources(dispatched);
        analytics.setMaintenanceResources(maintenance);
        analytics.setOfflineResources(offline);
        analytics.setResourceUtilizationRate(total > 0 ? round(((double) dispatched / total) * 100.0) : 0.0);
        analytics.setResourceTypeBreakdown(typeMap);
    }

    private void calculateResponderStatistics(OperationalAnalyticsDTO analytics, List<User> responders, List<EmergencyReport> reports) {
        long totalResponders = responders.size();
        long activeResponders = responders.stream().filter(User::isEnabled).count();
        long inactiveResponders = totalResponders - activeResponders;

        long totalActiveAssignments = 0;
        List<OperationalAnalyticsDTO.ResponderStatDTO> responderStatsList = new ArrayList<>();

        for (User responder : responders) {
            long activeAssigned = reports.stream()
                    .filter(r -> r.getAssignedResponder() != null
                            && r.getAssignedResponder().getId().equals(responder.getId())
                            && r.getStatus() != ReportStatus.RESOLVED
                            && r.getStatus() != ReportStatus.CLOSED)
                    .count();

            long resolvedCount = reports.stream()
                    .filter(r -> r.getAssignedResponder() != null
                            && r.getAssignedResponder().getId().equals(responder.getId())
                            && (r.getStatus() == ReportStatus.RESOLVED || r.getStatus() == ReportStatus.CLOSED))
                    .count();

            totalActiveAssignments += activeAssigned;

            responderStatsList.add(new OperationalAnalyticsDTO.ResponderStatDTO(
                    responder.getId(),
                    responder.getFullName(),
                    responder.getEmail(),
                    responder.isEnabled(),
                    activeAssigned,
                    resolvedCount
            ));
        }

        analytics.setTotalResponders(totalResponders);
        analytics.setActiveResponders(activeResponders);
        analytics.setInactiveResponders(inactiveResponders);
        analytics.setTotalActiveAssignments(totalActiveAssignments);
        analytics.setAvgActiveReportsPerResponder(totalResponders > 0 ? round((double) totalActiveAssignments / totalResponders) : 0.0);
        analytics.setResponderStats(responderStatsList);
    }

    private void calculateDuplicateAnalytics(OperationalAnalyticsDTO analytics, List<EmergencyReport> reports, long totalMasterIncidents) {
        long totalReports = reports.size();
        long linkedReports = reports.stream().filter(r -> r.getMasterIncident() != null).count();
        long standaloneReports = totalReports - linkedReports;
        double deduplicationRatio = totalReports > 0 ? round(((double) linkedReports / totalReports) * 100.0) : 0.0;

        analytics.setTotalReports(totalReports);
        analytics.setTotalMasterIncidents(totalMasterIncidents);
        analytics.setLinkedReports(linkedReports);
        analytics.setStandaloneReports(standaloneReports);
        analytics.setDeduplicationRatio(deduplicationRatio);
    }

    private void calculateEscalationAnalytics(OperationalAnalyticsDTO analytics, List<EmergencyReport> reports) {
        long totalReports = reports.size();
        List<EmergencyReport> escalatedReports = reports.stream().filter(r -> r.getEscalatedAt() != null).collect(Collectors.toList());
        long totalEscalated = escalatedReports.size();
        double escalationRate = totalReports > 0 ? round(((double) totalEscalated / totalReports) * 100.0) : 0.0;

        Map<String, Long> escalationsByPriority = new LinkedHashMap<>();
        for (ReportPriority p : ReportPriority.values()) {
            escalationsByPriority.put(p.name(), 0L);
        }

        Map<String, Long> escalationsByCategory = new LinkedHashMap<>();
        for (IncidentCategory c : IncidentCategory.values()) {
            escalationsByCategory.put(c.name(), 0L);
        }

        for (EmergencyReport r : escalatedReports) {
            if (r.getPriority() != null) {
                String p = r.getPriority().name();
                escalationsByPriority.put(p, escalationsByPriority.getOrDefault(p, 0L) + 1);
            }
            if (r.getCategory() != null) {
                String c = r.getCategory().name();
                escalationsByCategory.put(c, escalationsByCategory.getOrDefault(c, 0L) + 1);
            }
        }

        analytics.setTotalEscalatedIncidents(totalEscalated);
        analytics.setEscalationRate(escalationRate);
        analytics.setEscalationsByPriority(escalationsByPriority);
        analytics.setEscalationsByCategory(escalationsByCategory);
    }

    private void calculateTimeBasedTrends(OperationalAnalyticsDTO analytics, List<EmergencyReport> reports) {
        List<OperationalAnalyticsDTO.DailyTrendDTO> dailyTrends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate targetDate = today.minusDays(i);
            String dateStr = targetDate.format(formatter);

            long count = reports.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().equals(targetDate))
                    .count();

            dailyTrends.add(new OperationalAnalyticsDTO.DailyTrendDTO(dateStr, count));
        }

        analytics.setDailyTrends(dailyTrends);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
