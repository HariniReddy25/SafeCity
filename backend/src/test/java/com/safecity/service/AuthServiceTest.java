package com.safecity.service;

import com.safecity.dto.AuthResponseDTO;
import com.safecity.dto.LoginRequestDTO;
import com.safecity.entity.Role;
import com.safecity.entity.User;
import com.safecity.repository.UserRepository;
import com.safecity.security.jwt.JwtTokenProvider;
import com.safecity.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("Sarah Jenkins", "citizen@safecity.com", "+1-555-0101", "encoded_password", Role.CITIZEN);
        testUser.setId(1L);
    }

    @Test
    @DisplayName("Auth Service -> Login with valid credentials returns AuthResponseDTO with JWT token")
    void testLogin_Success() {
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail("citizen@safecity.com")).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateToken(auth)).thenReturn("valid.jwt.token");

        LoginRequestDTO request = new LoginRequestDTO("citizen@safecity.com", "Citizen123!");
        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("citizen@safecity.com", response.getUser().getEmail());
        assertEquals(Role.CITIZEN, response.getUser().getRole());
    }

    @Test
    @DisplayName("Auth Service -> Login with invalid password throws BadCredentialsException")
    void testLogin_InvalidPassword_ThrowsException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequestDTO request = new LoginRequestDTO("citizen@safecity.com", "WrongPassword!");

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Auth Service -> Login with null email or password throws BadCredentialsException")
    void testLogin_NullFields_ThrowsException() {
        LoginRequestDTO nullEmail = new LoginRequestDTO(null, "Citizen123!");
        LoginRequestDTO nullPassword = new LoginRequestDTO("citizen@safecity.com", null);

        assertThrows(BadCredentialsException.class, () -> authService.login(nullEmail));
        assertThrows(BadCredentialsException.class, () -> authService.login(nullPassword));
    }
}
