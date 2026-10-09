import api from './api';

/**
 * Fetch notifications for authenticated user
 */
export const getNotificationsApi = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

/**
 * Fetch unread notification count
 */
export const getUnreadNotificationCountApi = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsReadApi = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error(`Failed to mark notification #${notificationId} as read:`, error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsReadApi = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

/**
 * Trigger Citizen Emergency SOS distress signal
 */
export const triggerSosApi = async (sosData = {}) => {
  try {
    const response = await api.post('/reports/sos', sosData);
    return response.data;
  } catch (error) {
    console.error('Failed to trigger SOS distress signal:', error);
    throw error;
  }
};
