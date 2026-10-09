package com.safecity.dto;

public class DuplicateCandidatePairDTO {

    private EmergencyReportResponseDTO reportA;
    private EmergencyReportResponseDTO reportB;
    private double distanceMeters;
    private long timeDifferenceMinutes;
    private String matchReason;

    public DuplicateCandidatePairDTO() {
    }

    public DuplicateCandidatePairDTO(EmergencyReportResponseDTO reportA, EmergencyReportResponseDTO reportB,
                                    double distanceMeters, long timeDifferenceMinutes, String matchReason) {
        this.reportA = reportA;
        this.reportB = reportB;
        this.distanceMeters = Math.round(distanceMeters * 10.0) / 10.0;
        this.timeDifferenceMinutes = timeDifferenceMinutes;
        this.matchReason = matchReason;
    }

    public EmergencyReportResponseDTO getReportA() {
        return reportA;
    }

    public void setReportA(EmergencyReportResponseDTO reportA) {
        this.reportA = reportA;
    }

    public EmergencyReportResponseDTO getReportB() {
        return reportB;
    }

    public void setReportB(EmergencyReportResponseDTO reportB) {
        this.reportB = reportB;
    }

    public double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public long getTimeDifferenceMinutes() {
        return timeDifferenceMinutes;
    }

    public void setTimeDifferenceMinutes(long timeDifferenceMinutes) {
        this.timeDifferenceMinutes = timeDifferenceMinutes;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }
}
