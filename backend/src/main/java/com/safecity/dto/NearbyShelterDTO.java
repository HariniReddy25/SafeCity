package com.safecity.dto;

public class NearbyShelterDTO extends ShelterDTO {

    private Double distanceKm;

    public NearbyShelterDTO() {
    }

    public static NearbyShelterDTO fromShelterDTO(ShelterDTO baseDto, Double distanceKm) {
        if (baseDto == null) return null;
        NearbyShelterDTO dto = new NearbyShelterDTO();
        dto.setId(baseDto.getId());
        dto.setShelterCode(baseDto.getShelterCode());
        dto.setName(baseDto.getName());
        dto.setDescription(baseDto.getDescription());
        dto.setAddress(baseDto.getAddress());
        dto.setLatitude(baseDto.getLatitude());
        dto.setLongitude(baseDto.getLongitude());
        dto.setCapacity(baseDto.getCapacity());
        dto.setCurrentOccupancy(baseDto.getCurrentOccupancy());
        dto.setAvailableSlots(baseDto.getAvailableSlots());
        dto.setStatus(baseDto.getStatus());
        dto.setStatusDisplayName(baseDto.getStatusDisplayName());
        dto.setContactPhone(baseDto.getContactPhone());
        dto.setFacilities(baseDto.getFacilities());
        dto.setCreatedAt(baseDto.getCreatedAt());
        dto.setUpdatedAt(baseDto.getUpdatedAt());
        dto.setDistanceKm(distanceKm);
        return dto;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }
}
