package com.safecity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safecity.dto.AuthResponseDTO;
import com.safecity.dto.LoginRequestDTO;
import com.safecity.dto.UserDTO;
import com.safecity.entity.Role;
import com.safecity.exception.GlobalExceptionHandler;
import com.safecity.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Auth Controller -> POST /api/auth/login with valid credentials returns 200 OK and JWT token")
    void testLogin_Success() throws Exception {
        UserDTO userDTO = new UserDTO(1L, "Sarah Jenkins", "citizen@safecity.com", "+1-555-0101", Role.CITIZEN, LocalDateTime.now());
        AuthResponseDTO authResponseDTO = new AuthResponseDTO("mock-jwt-token-123", userDTO);

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(authResponseDTO);

        LoginRequestDTO loginRequest = new LoginRequestDTO("citizen@safecity.com", "Citizen123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token-123"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("citizen@safecity.com"))
                .andExpect(jsonPath("$.user.role").value("CITIZEN"));

        verify(authService, times(1)).login(any(LoginRequestDTO.class));
    }

    @Test
    @DisplayName("Auth Controller -> POST /api/auth/login with invalid credentials returns 401 Unauthorized")
    void testLogin_InvalidCredentials() throws Exception {
        when(authService.login(any(LoginRequestDTO.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        LoginRequestDTO loginRequest = new LoginRequestDTO("citizen@safecity.com", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));

        verify(authService, times(1)).login(any(LoginRequestDTO.class));
    }

    @Test
    @DisplayName("Auth Controller -> POST /api/auth/login with missing email returns 400 Bad Request")
    void testLogin_MissingEmail() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO("", "Citizen123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verify(authService, never()).login(any(LoginRequestDTO.class));
    }

    @Test
    @DisplayName("Auth Controller -> POST /api/auth/login with malformed JSON returns 400 Bad Request")
    void testLogin_MalformedJson() throws Exception {
        String malformedJson = "{email: \"citizen@safecity.com\", password: }";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Malformed JSON request body"));

        verify(authService, never()).login(any(LoginRequestDTO.class));
    }

    @Test
    @DisplayName("Auth Controller -> POST /api/auth/login when database is unavailable returns 503 Service Unavailable")
    void testLogin_DatabaseUnavailable() throws Exception {
        when(authService.login(any(LoginRequestDTO.class)))
                .thenThrow(new QueryTimeoutException("Database connection timed out"));

        LoginRequestDTO loginRequest = new LoginRequestDTO("citizen@safecity.com", "Citizen123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.message").value("Authentication service is temporarily unavailable. Please try again."));

        verify(authService, times(1)).login(any(LoginRequestDTO.class));
    }

    @Test
    @DisplayName("Auth Controller -> Repeated login attempts execute safely")
    void testLogin_RepeatedAttempts() throws Exception {
        UserDTO userDTO = new UserDTO(1L, "Sarah Jenkins", "citizen@safecity.com", "+1-555-0101", Role.CITIZEN, LocalDateTime.now());
        AuthResponseDTO authResponseDTO = new AuthResponseDTO("mock-jwt-token-123", userDTO);

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(authResponseDTO);

        LoginRequestDTO loginRequest = new LoginRequestDTO("citizen@safecity.com", "Citizen123!");

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("mock-jwt-token-123"));
        }

        verify(authService, times(5)).login(any(LoginRequestDTO.class));
    }
}
