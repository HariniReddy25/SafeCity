import api from './api';

/**
 * Fetch anonymized public community safety feed
 */
export const getCommunitySafetyFeedApi = async () => {
  try {
    const response = await api.get('/community/feed');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch community safety feed:', error);
    throw error;
  }
};

/**
 * Submit user feedback
 */
export const submitFeedbackApi = async (feedbackData) => {
  try {
    const response = await api.post('/community/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit user feedback:', error);
    throw error;
  }
};

/**
 * Fetch feedback submitted by current user
 */
export const getMyFeedbackApi = async () => {
  try {
    const response = await api.get('/community/feedback/my');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user feedback:', error);
    throw error;
  }
};

/**
 * Fetch all feedback for admin overview
 */
export const getAllFeedbackForAdminApi = async () => {
  try {
    const response = await api.get('/community/feedback/all');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all feedback for admin:', error);
    throw error;
  }
};
