package com.safecity.controller;

import com.safecity.dto.CommunityFeedItemDTO;
import com.safecity.dto.FeedbackRequestDTO;
import com.safecity.dto.FeedbackResponseDTO;
import com.safecity.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @GetMapping("/feed")
    public ResponseEntity<List<CommunityFeedItemDTO>> getCommunitySafetyFeed() {
        List<CommunityFeedItemDTO> feed = communityService.getCommunitySafetyFeed();
        return ResponseEntity.ok(feed);
    }

    @PostMapping("/feedback")
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FeedbackRequestDTO request) {

        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        FeedbackResponseDTO response = communityService.submitFeedback(userEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/feedback/my")
    public ResponseEntity<List<FeedbackResponseDTO>> getMyFeedback(@AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails.getUsername();
        List<FeedbackResponseDTO> myFeedback = communityService.getMyFeedback(userEmail);
        return ResponseEntity.ok(myFeedback);
    }

    @GetMapping("/feedback/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedbackForAdmin() {
        List<FeedbackResponseDTO> allFeedback = communityService.getAllFeedbackForAdmin();
        return ResponseEntity.ok(allFeedback);
    }
}
