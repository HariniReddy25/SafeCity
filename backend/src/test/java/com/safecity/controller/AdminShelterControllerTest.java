package com.safecity.controller;

import com.safecity.dto.CreateShelterRequestDTO;
import com.safecity.dto.ShelterDTO;
import com.safecity.entity.ShelterStatus;
import com.safecity.service.ShelterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminShelterControllerTest {

    @Mock
    private ShelterService shelterService;

    @InjectMocks
    private AdminShelterController adminShelterController;

    private ShelterDTO mockShelterDto;

    @BeforeEach
    void setUp() {
        mockShelterDto = new ShelterDTO();
        mockShelterDto.setId(10L);
        mockShelterDto.setShelterCode("SH-001");
        mockShelterDto.setName("Central Emergency Shelter");
        mockShelterDto.setCapacity(200);
        mockShelterDto.setCurrentOccupancy(50);
        mockShelterDto.setAvailableSlots(150);
        mockShelterDto.setStatus(ShelterStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Admin Controller -> POST /api/admin/shelters returns 201 Created")
    void testCreateShelter_Success() {
        CreateShelterRequestDTO req = new CreateShelterRequestDTO();
        req.setShelterCode("SH-001");
        req.setName("Central Emergency Shelter");
        req.setCapacity(200);

        when(shelterService.createShelter(any(CreateShelterRequestDTO.class))).thenReturn(mockShelterDto);

        ResponseEntity<ShelterDTO> response = adminShelterController.createShelter(req);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SH-001", response.getBody().getShelterCode());
        verify(shelterService).createShelter(any(CreateShelterRequestDTO.class));
    }

    @Test
    @DisplayName("Admin Controller -> GET /api/admin/shelters returns 200 OK")
    void testGetAllShelters_Success() {
        when(shelterService.getAllSheltersForAdmin()).thenReturn(Arrays.asList(mockShelterDto));

        ResponseEntity<List<ShelterDTO>> response = adminShelterController.getAllShelters();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(shelterService).getAllSheltersForAdmin();
    }
}
