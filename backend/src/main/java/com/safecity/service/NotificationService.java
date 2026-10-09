package com.safecity.service;

import com.safecity.dto.NotificationDTO;
import com.safecity.entity.Notification;
import com.safecity.entity.Role;
import com.safecity.entity.User;

import java.util.List;

public interface NotificationService {

    List<NotificationDTO> getUserNotifications(String userEmail);

    long getUnreadCount(String userEmail);

    NotificationDTO markAsRead(Long notificationId, String userEmail);

    void markAllAsRead(String userEmail);

    Notification createNotification(User recipient, String title, String message, String type, String relatedReportId);

    void notifyRole(Role role, String title, String message, String type, String relatedReportId);

    void notifyAdminsAndResponders(String title, String message, String type, String relatedReportId);
}
