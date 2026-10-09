package com.safecity.service;

import com.safecity.dto.UpdateProfileRequestDTO;
import com.safecity.dto.UserDTO;
import com.safecity.entity.User;

public interface UserService {

    User findByEmail(String email);

    UserDTO getUserProfile(String email);

    UserDTO updateUserProfile(String email, UpdateProfileRequestDTO updateDto);
}
