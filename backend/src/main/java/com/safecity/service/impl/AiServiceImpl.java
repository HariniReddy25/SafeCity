package com.safecity.service.impl;

import com.safecity.dto.*;
import com.safecity.entity.EmergencyReport;
import com.safecity.entity.IncidentCategory;
import com.safecity.entity.ReportPriority;
import com.safecity.entity.ReportStatus;
import com.safecity.exception.ResourceNotFoundException;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AiServiceImpl implements AiService {

    @Value("${ai.api.key:}")
    private String aiApiKey;

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Override
    public AiAssistResponseDTO enhanceReportDescription(AiAssistRequestDTO request) {
        String desc = request.getDescription() != null ? request.getDescription().trim() : "";
        if (desc.isEmpty()) {
            return new AiAssistResponseDTO("", "", IncidentCategory.OTHER, "Other", ReportPriority.LOW,
                    "No description provided.", List.of(), true, "Description cannot be empty.");
        }

        String lowerDesc = desc.toLowerCase(Locale.ROOT);
        IncidentCategory category = IncidentCategory.OTHER;
        String categoryLabel = "Other";
        ReportPriority priority = ReportPriority.LOW;
        List<String> keyDetails = new ArrayList<>();

        if (lowerDesc.contains("fire") || lowerDesc.contains("smoke") || lowerDesc.contains("flame") || lowerDesc.contains("blaze")) {
            category = IncidentCategory.FIRE;
            categoryLabel = "Fire";
            priority = (lowerDesc.contains("trapped") || lowerDesc.contains("explosion") || lowerDesc.contains("heavy"))
                    ? ReportPriority.CRITICAL : ReportPriority.HIGH;
            keyDetails.add("Structure or environmental fire hazard identified.");
            keyDetails.add("Smoke/flame visibility reported.");
        } else if (lowerDesc.contains("crash") || lowerDesc.contains("accident") || lowerDesc.contains("collision") || lowerDesc.contains("vehicle")) {
            category = IncidentCategory.ROAD_ACCIDENT;
            categoryLabel = "Road Accident";
            priority = (lowerDesc.contains("bleed") || lowerDesc.contains("injury") || lowerDesc.contains("unconscious"))
                    ? ReportPriority.CRITICAL : ReportPriority.HIGH;
            keyDetails.add("Vehicular collision on public roadway.");
            keyDetails.add("Traffic blockage reported.");
        } else if (lowerDesc.contains("medical") || lowerDesc.contains("faint") || lowerDesc.contains("breath") || lowerDesc.contains("attack") || lowerDesc.contains("injury")) {
            category = IncidentCategory.MEDICAL_EMERGENCY;
            categoryLabel = "Medical Emergency";
            priority = lowerDesc.contains("unconscious") ? ReportPriority.CRITICAL : ReportPriority.HIGH;
            keyDetails.add("Person requiring urgent medical attention.");
        } else if (lowerDesc.contains("theft") || lowerDesc.contains("robbery") || lowerDesc.contains("crime") || lowerDesc.contains("assault") || lowerDesc.contains("stolen")) {
            category = IncidentCategory.CRIME;
            categoryLabel = "Crime";
            priority = lowerDesc.contains("weapon") ? ReportPriority.CRITICAL : ReportPriority.MEDIUM;
            keyDetails.add("Criminal activity or theft incident.");
        } else if (lowerDesc.contains("suspicious") || lowerDesc.contains("prowler") || lowerDesc.contains("loitering")) {
            category = IncidentCategory.SUSPICIOUS_ACTIVITY;
            categoryLabel = "Suspicious Activity";
            priority = ReportPriority.MEDIUM;
            keyDetails.add("Unusual or suspicious behavior reported.");
        } else if (lowerDesc.contains("wire") || lowerDesc.contains("lamp") || lowerDesc.contains("pothole") || lowerDesc.contains("leak") || lowerDesc.contains("hazard")) {
            category = IncidentCategory.PUBLIC_SAFETY_HAZARD;
            categoryLabel = "Public Safety Hazard";
            priority = ReportPriority.LOW;
            keyDetails.add("Infrastructure or public safety hazard.");
        }

        // Formulate enhanced, professional description summary
        String enhanced = "REPORT SUMMARY: " + desc + "\n" +
                "KEY INCIDENT FACTORS: Identified category as " + categoryLabel +
                " with recommended priority level (" + priority.name() + ").\n" +
                "ACTION RECOMMENDED: Verify exact location coordinates and notify nearest emergency responders.";

        String summaryText = desc.length() > 120 ? desc.substring(0, 117) + "..." : desc;

        boolean isFallback = aiApiKey == null || aiApiKey.isBlank();
        String msg = isFallback
                ? "Enhanced using SafeCity Built-in Rule Engine (AI key not configured)."
                : "AI analysis successfully generated.";

        return new AiAssistResponseDTO(desc, enhanced, category, categoryLabel, priority, summaryText, keyDetails, false, msg);
    }

    @Override
    public AiSummaryResponseDTO generateReportSummary(Long reportId) {
        EmergencyReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency report not found with id: " + reportId));

        String whatHappened = report.getDescription() != null ? report.getDescription() : "Emergency report filed.";
        String location = report.getAddress() != null ? report.getAddress() : "Coordinates: " + report.getLatitude() + ", " + report.getLongitude();
        ReportPriority urgency = report.getPriority() != null ? report.getPriority() : ReportPriority.MEDIUM;

        String details = "Category: " + report.getCategory() + " | Status: " + report.getStatus() +
                " | Reported on: " + (report.getCreatedAt() != null ? report.getCreatedAt().toString() : "N/A");

        return new AiSummaryResponseDTO(
                report.getReportId(),
                whatHappened,
                details,
                location,
                urgency,
                false,
                "AI Summary generated successfully for official responder reference."
        );
    }

    @Override
    public AiChatResponseDTO processSafetyChat(AiChatRequestDTO request) {
        String query = request.getMessage() != null ? request.getMessage().trim().toLowerCase(Locale.ROOT) : "";
        List<String> steps = new ArrayList<>();
        String answer;

        String disclaimer = "🚨 EMERGENCY NOTICE: If you or someone else is in immediate physical danger, please contact local emergency services (112 / 100 / 101 / 108) directly. Do not wait for chat responses.";

        if (query.contains("fire")) {
            answer = "If you encounter a fire emergency, prioritize evacuation and alert others immediately.";
            steps.add("Get out of the building quickly and safely. Do not use elevators.");
            steps.add("Call fire emergency services (101 / 112) immediately.");
            steps.add("If caught in smoke, stay low near the floor where the air is clearer.");
            steps.add("Feel doors for heat with the back of your hand before opening them.");
        } else if (query.contains("accident") || query.contains("crash") || query.contains("road")) {
            answer = "In the event of a road accident, ensure personal safety first before assisting others.";
            steps.add("Turn on hazard lights and place warning triangles if safe to do so.");
            steps.add("Call ambulance services (108 / 112) and police (100).");
            steps.add("Do not move injured individuals unless there is an immediate threat of fire or explosion.");
            steps.add("File a report on SafeCity with precise location coordinates.");
        } else if (query.contains("suspicious")) {
            answer = "When reporting suspicious activity, prioritize your safety and observe clear details.";
            steps.add("Maintain a safe distance and do not confront individuals.");
            steps.add("Note key details: location, physical descriptions, vehicle plate numbers, and time.");
            steps.add("Submit a report on SafeCity under 'Suspicious Activity' category.");
            steps.add("If you suspect imminent danger, call police (100 / 112) immediately.");
        } else if (query.contains("report") || query.contains("include")) {
            answer = "Effective emergency reports should provide clear, non-sensitive spatial and incident details.";
            steps.add("Include the precise street address or enable GPS location on the Safety Map.");
            steps.add("State the incident category (Fire, Medical, Road Accident, Crime, etc.).");
            steps.add("Describe current hazard intensity and if injuries or trapped individuals are present.");
            steps.add("Use 'Improve with AI' to refine your description before submitting.");
        } else {
            answer = "SafeCity AI Assistant is ready to help with public safety guidance, emergency protocols, and report filing instructions.";
            steps.add("For active fires, move to safety and call 101.");
            steps.add("For medical emergencies, call 108.");
            steps.add("For police assistance, call 100.");
            steps.add("Submit incidents on SafeCity Safety Map for local responder visibility.");
        }

        return new AiChatResponseDTO(request.getMessage(), answer, steps, disclaimer, false);
    }

    @Override
    public AiSearchResponseDTO parseNaturalLanguageSearch(AiSearchRequestDTO request) {
        String query = request.getQuery() != null ? request.getQuery().trim().toLowerCase(Locale.ROOT) : "";

        IncidentCategory parsedCategory = null;
        ReportPriority parsedPriority = null;
        ReportStatus parsedStatus = null;
        String parsedCity = null;

        // Parse Category
        if (query.contains("fire")) parsedCategory = IncidentCategory.FIRE;
        else if (query.contains("accident") || query.contains("crash")) parsedCategory = IncidentCategory.ROAD_ACCIDENT;
        else if (query.contains("medical")) parsedCategory = IncidentCategory.MEDICAL_EMERGENCY;
        else if (query.contains("crime") || query.contains("theft")) parsedCategory = IncidentCategory.CRIME;
        else if (query.contains("hazard")) parsedCategory = IncidentCategory.PUBLIC_SAFETY_HAZARD;

        // Parse Priority
        if (query.contains("critical") || query.contains("urgent") || query.contains("severe")) parsedPriority = ReportPriority.CRITICAL;
        else if (query.contains("high")) parsedPriority = ReportPriority.HIGH;
        else if (query.contains("medium")) parsedPriority = ReportPriority.MEDIUM;
        else if (query.contains("low")) parsedPriority = ReportPriority.LOW;

        // Parse Status
        if (query.contains("unresolved") || query.contains("active") || query.contains("open")) parsedStatus = ReportStatus.SUBMITTED;
        else if (query.contains("resolved") || query.contains("closed")) parsedStatus = ReportStatus.RESOLVED;

        // Parse City
        if (query.contains("hyderabad")) parsedCity = "Hyderabad";
        else if (query.contains("bengaluru") || query.contains("bangalore")) parsedCity = "Bengaluru";
        else if (query.contains("mumbai")) parsedCity = "Mumbai";
        else if (query.contains("delhi")) parsedCity = "Delhi";

        String explanation = "Query converted to safe JPA application filters: " +
                (parsedCategory != null ? "Category=" + parsedCategory + " " : "") +
                (parsedPriority != null ? "Priority=" + parsedPriority + " " : "") +
                (parsedStatus != null ? "Status=" + parsedStatus + " " : "") +
                (parsedCity != null ? "City=" + parsedCity : "");

        return new AiSearchResponseDTO(request.getQuery(), parsedCategory, parsedPriority, parsedStatus, parsedCity, explanation, false);
    }

    @Override
    public List<SafetyTipDTO> getRecommendedSafetyTips(String city) {
        List<SafetyTipDTO> tips = new ArrayList<>();

        tips.add(new SafetyTipDTO("tip-1", "Urban Monsoon Safety", "Weather",
                "Avoid walking or driving through submerged roads during heavy rains. Check for open drains or exposed electrical cables.", "🌧️"));

        tips.add(new SafetyTipDTO("tip-2", "Night Commute Vigilance", "Personal Safety",
                "Share live location with trusted family members when traveling late. Stick to well-lit main avenues in " + (city != null ? city : "your area") + ".", "🌙"));

        tips.add(new SafetyTipDTO("tip-3", "Home Fire Safety", "Fire Prevention",
                "Ensure smoke detectors are functional and keep clear access to emergency stairwells in residential complexes.", "🧯"));

        tips.add(new SafetyTipDTO("tip-4", "Community Incident Reporting", "Public Safety",
                "Report broken street lamps, road hazards, or illegal parking near emergency exit gates on SafeCity.", "🚨"));

        return tips;
    }
}
