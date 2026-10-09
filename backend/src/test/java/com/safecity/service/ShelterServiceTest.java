package com.safecity.service;

import com.safecity.dto.CreateShelterRequestDTO;
import com.safecity.dto.NearbyShelterDTO;
import com.safecity.dto.ShelterDTO;
import com.safecity.entity.Shelter;
import com.safecity.entity.ShelterStatus;
import com.safecity.exception.ResourceNotFoundException;
import com.safecity.repository.ShelterRepository;
import com.safecity.service.impl.ShelterServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShelterServiceTest {

    @Mock
    private ShelterRepository shelterRepository;

    @InjectMocks
    private ShelterServiceImpl shelterService;

    private Shelter testShelter;

    @BeforeEach
    void setUp() {
        testShelter = new Shelter(
                "SH-001", "Abids Central Community Hall", "Primary emergency shelter",
                "Abids Main Road, Hyderabad", 17.3850, 78.4867, 200, 50,
                ShelterStatus.AVAILABLE, "+1-555-0199", "Medical, Food, Water, Power"
        );
        testShelter.setId(10L);
    }

    @Test
    @DisplayName("Create Shelter -> Success")
    void testCreateShelter_Success() {
        CreateShelterRequestDTO req = new CreateShelterRequestDTO();
        req.setShelterCode("SH-002");
        req.setName("Banjara Hills Relief Camp");
        req.setAddress("Road No 1, Banjara Hills");
        req.setLatitude(17.4156);
        req.setLongitude(78.4347);
        req.setCapacity(150);
        req.setCurrentOccupancy(10);
        req.setStatus(ShelterStatus.AVAILABLE);

        when(shelterRepository.findByShelterCode("SH-002")).thenReturn(Optional.empty());
        when(shelterRepository.save(any(Shelter.class))).thenAnswer(i -> {
            Shelter s = i.getArgument(0);
            s.setId(20L);
            return s;
        });

        ShelterDTO created = shelterService.createShelter(req);

        assertNotNull(created);
        assertEquals("SH-002", created.getShelterCode());
        assertEquals("Banjara Hills Relief Camp", created.getName());
        assertEquals(140, created.getAvailableSlots());
        verify(shelterRepository).save(any(Shelter.class));
    }

    @Test
    @DisplayName("Create Shelter -> Duplicate Code Throws IllegalArgumentException")
    void testCreateShelter_DuplicateCodeThrows() {
        CreateShelterRequestDTO req = new CreateShelterRequestDTO();
        req.setShelterCode("SH-001");
        req.setName("Duplicate Shelter");
        req.setAddress("Address");
        req.setCapacity(100);

        when(shelterRepository.findByShelterCode("SH-001")).thenReturn(Optional.of(testShelter));

        assertThrows(IllegalArgumentException.class, () -> shelterService.createShelter(req));
    }

    @Test
    @DisplayName("Create Shelter -> Occupancy Exceeding Capacity Throws IllegalArgumentException")
    void testCreateShelter_OccupancyExceedingCapacityThrows() {
        CreateShelterRequestDTO req = new CreateShelterRequestDTO();
        req.setShelterCode("SH-003");
        req.setName("Invalid Shelter");
        req.setAddress("Address");
        req.setCapacity(50);
        req.setCurrentOccupancy(60);

        when(shelterRepository.findByShelterCode("SH-003")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> shelterService.createShelter(req));
    }

    @Test
    @DisplayName("Update Occupancy -> Reaching Capacity Auto-Sets Status to FULL")
    void testUpdateOccupancy_AutoFullStatus() {
        when(shelterRepository.findById(10L)).thenReturn(Optional.of(testShelter));
        when(shelterRepository.save(any(Shelter.class))).thenAnswer(i -> i.getArgument(0));

        ShelterDTO updated = shelterService.updateShelterOccupancy(10L, 200);

        assertNotNull(updated);
        assertEquals(200, updated.getCurrentOccupancy());
        assertEquals(ShelterStatus.FULL, updated.getStatus());
        assertEquals(0, updated.getAvailableSlots());
    }

    @Test
    @DisplayName("Get Nearby Shelters -> Returns Shelters Sorted by Haversine Distance")
    void testGetNearbyShelters_SortedByDistance() {
        Shelter shelterNear = new Shelter("SH-101", "Near Hall", "Desc", "Abids", 17.3850, 78.4867, 100, 10, ShelterStatus.AVAILABLE, null, null);
        shelterNear.setId(101L);

        Shelter shelterFar = new Shelter("SH-102", "Far Hall", "Desc", "Secunderabad", 17.4400, 78.5000, 100, 10, ShelterStatus.AVAILABLE, null, null);
        shelterFar.setId(102L);

        when(shelterRepository.findByStatusInOrderByCreatedAtDesc(anyList())).thenReturn(Arrays.asList(shelterFar, shelterNear));

        List<NearbyShelterDTO> nearby = shelterService.getNearbySheltersForPublic(17.3850, 78.4867);

        assertNotNull(nearby);
        assertEquals(2, nearby.size());
        assertEquals("SH-101", nearby.get(0).getShelterCode()); // Nearest first
        assertEquals(0.0, nearby.get(0).getDistanceKm());
    }
}
