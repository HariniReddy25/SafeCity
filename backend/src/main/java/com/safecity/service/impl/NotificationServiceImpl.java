package com.safecity.service.impl;

import com.safecity.dto.NotificationDTO;
import com.safecity.entity.Notification;
import com.safecity.entity.Role;
import com.safecity.entity.User;
import com.safecity.exception.ResourceNotFoundException;
import com.safecity.repository.NotificationRepository;
import com.safecity.repository.UserRepository;
import com.safecity.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return notifications.stream().map(NotificationDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    public NotificationDTO markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this notification.");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return NotificationDTO.fromEntity(updated);
    }

    @Override
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    public Notification createNotification(User recipient, String title, String message, String type, String relatedReportId) {
        if (recipient == null) return null;
        Notification notification = new Notification(recipient, title, message, type, relatedReportId);
        return notificationRepository.save(notification);
    }

    @Override
    public void notifyRole(Role role, String title, String message, String type, String relatedReportId) {
        List<User> targetUsers = userRepository.findByRole(role);
        for (User u : targetUsers) {
            createNotification(u, title, message, type, relatedReportId);
        }
    }

    @Override
    public void notifyAdminsAndResponders(String title, String message, String type, String relatedReportId) {
        notifyRole(Role.ADMIN, title, message, type, relatedReportId);
        notifyRole(Role.RESPONDER, title, message, type, relatedReportId);
    }
}
