package com.safecity.dto;

public class SosRequestDTO {

    private Double latitude;
    private Double longitude;
    private String address;
    private String note;

    public SosRequestDTO() {}

    public SosRequestDTO(Double latitude, Double longitude, String address, String note) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.note = note;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
