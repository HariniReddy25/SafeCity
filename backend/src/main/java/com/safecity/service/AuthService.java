package com.safecity.service;

import com.safecity.dto.AuthResponseDTO;
import com.safecity.dto.LoginRequestDTO;
import com.safecity.dto.RegisterRequestDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO registerRequest);

    AuthResponseDTO login(LoginRequestDTO loginRequest);
}
