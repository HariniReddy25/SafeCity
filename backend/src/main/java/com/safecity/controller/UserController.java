package com.safecity.controller;

import com.safecity.dto.UpdateProfileRequestDTO;
import com.safecity.dto.UserDTO;
import com.safecity.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserDTO userProfile = userService.getUserProfile(email);
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(Authentication authentication,
                                                @Valid @RequestBody UpdateProfileRequestDTO updateDto) {
        String email = authentication.getName();
        UserDTO updatedProfile = userService.updateUserProfile(email, updateDto);
        return ResponseEntity.ok(updatedProfile);
    }
}
