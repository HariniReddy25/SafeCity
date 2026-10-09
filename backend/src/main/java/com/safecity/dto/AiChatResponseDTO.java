package com.safecity.dto;

import java.util.List;

public class AiChatResponseDTO {

    private String userMessage;
    private String aiAnswer;
    private List<String> actionSteps;
    private String emergencyDisclaimer;
    private boolean fallback;

    public AiChatResponseDTO() {}

    public AiChatResponseDTO(String userMessage, String aiAnswer, List<String> actionSteps, String emergencyDisclaimer, boolean fallback) {
        this.userMessage = userMessage;
        this.aiAnswer = aiAnswer;
        this.actionSteps = actionSteps;
        this.emergencyDisclaimer = emergencyDisclaimer;
        this.fallback = fallback;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getAiAnswer() {
        return aiAnswer;
    }

    public void setAiAnswer(String aiAnswer) {
        this.aiAnswer = aiAnswer;
    }

    public List<String> getActionSteps() {
        return actionSteps;
    }

    public void setActionSteps(List<String> actionSteps) {
        this.actionSteps = actionSteps;
    }

    public String getEmergencyDisclaimer() {
        return emergencyDisclaimer;
    }

    public void setEmergencyDisclaimer(String emergencyDisclaimer) {
        this.emergencyDisclaimer = emergencyDisclaimer;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
