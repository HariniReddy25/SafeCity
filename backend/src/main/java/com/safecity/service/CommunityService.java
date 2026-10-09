package com.safecity.service;

import com.safecity.dto.CommunityFeedItemDTO;
import com.safecity.dto.FeedbackRequestDTO;
import com.safecity.dto.FeedbackResponseDTO;

import java.util.List;

public interface CommunityService {

    List<CommunityFeedItemDTO> getCommunitySafetyFeed();

    FeedbackResponseDTO submitFeedback(String userEmail, FeedbackRequestDTO request);

    List<FeedbackResponseDTO> getMyFeedback(String userEmail);

    List<FeedbackResponseDTO> getAllFeedbackForAdmin();
}
