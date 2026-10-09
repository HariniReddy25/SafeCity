package com.safecity.service.impl;

import com.safecity.dto.UpdateProfileRequestDTO;
import com.safecity.dto.UserDTO;
import com.safecity.entity.User;
import com.safecity.repository.UserRepository;
import com.safecity.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Override
    public UserDTO getUserProfile(String email) {
        User user = findByEmail(email);
        return UserDTO.fromEntity(user);
    }

    @Override
    public UserDTO updateUserProfile(String email, UpdateProfileRequestDTO updateDto) {
        User user = findByEmail(email);

        if (updateDto.getFullName() != null && !updateDto.getFullName().isBlank()) {
            user.setFullName(updateDto.getFullName().trim());
        }

        if (updateDto.getPhoneNumber() != null && !updateDto.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(updateDto.getPhoneNumber().trim());
        }

        User updatedUser = userRepository.save(user);
        return UserDTO.fromEntity(updatedUser);
    }
}
