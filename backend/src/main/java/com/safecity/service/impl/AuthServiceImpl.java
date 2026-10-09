package com.safecity.service.impl;

import com.safecity.dto.AuthResponseDTO;
import com.safecity.dto.LoginRequestDTO;
import com.safecity.dto.RegisterRequestDTO;
import com.safecity.dto.UserDTO;
import com.safecity.entity.Role;
import com.safecity.entity.User;
import com.safecity.repository.UserRepository;
import com.safecity.security.jwt.JwtTokenProvider;
import com.safecity.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password cannot be null");
        }

        String email = request.getEmail().toLowerCase().trim();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered: " + email);
        }

        // Security Enforcement: Public registration ALWAYS assigns CITIZEN role
        Role assignedRole = Role.CITIZEN;

        User user = new User(
                request.getFullName() != null ? request.getFullName().trim() : "",
                email,
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "",
                passwordEncoder.encode(request.getPassword()),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        logger.info("New citizen registered successfully: {}", email);

        // Generate JWT Token
        String token = tokenProvider.generateTokenForUser(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponseDTO(token, UserDTO.fromEntity(savedUser));
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String email = request.getEmail().toLowerCase().trim();
        logger.info("Attempting authentication for email: {}", email);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

            String token = tokenProvider.generateToken(authentication);

            logger.info("Authentication successful for email: {}", email);

            return new AuthResponseDTO(token, UserDTO.fromEntity(user));
        } catch (BadCredentialsException ex) {
            logger.warn("Authentication failed for email: {} - Bad credentials", email);
            throw new BadCredentialsException("Invalid email or password");
        }
    }
}
