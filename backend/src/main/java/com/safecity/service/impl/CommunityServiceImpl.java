package com.safecity.service.impl;

import com.safecity.dto.CommunityFeedItemDTO;
import com.safecity.dto.FeedbackRequestDTO;
import com.safecity.dto.FeedbackResponseDTO;
import com.safecity.entity.EmergencyReport;
import com.safecity.entity.Feedback;
import com.safecity.entity.User;
import com.safecity.exception.ResourceNotFoundException;
import com.safecity.repository.EmergencyReportRepository;
import com.safecity.repository.FeedbackRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.CommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommunityServiceImpl implements CommunityService {

    @Autowired
    private EmergencyReportRepository reportRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CommunityFeedItemDTO> getCommunitySafetyFeed() {
        // Fetch valid reports and convert to anonymized public-safe DTOs (omitting citizen PII, notes, etc.)
        List<EmergencyReport> reports = reportRepository.findAll();
        return reports.stream()
                .map(CommunityFeedItemDTO::fromReport)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackResponseDTO submitFeedback(String userEmail, FeedbackRequestDTO request) {
        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        Feedback feedback = new Feedback(
                user,
                request.getRating(),
                request.getCategory() != null ? request.getCategory().trim() : "General Experience",
                request.getComment() != null ? request.getComment().trim() : ""
        );

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackResponseDTO.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> getMyFeedback(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        List<Feedback> list = feedbackRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return list.stream().map(FeedbackResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> getAllFeedbackForAdmin() {
        List<Feedback> list = feedbackRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(FeedbackResponseDTO::fromEntity).collect(Collectors.toList());
    }
}
