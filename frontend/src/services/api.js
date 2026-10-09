import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safecity_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('safecity_token');
      localStorage.removeItem('safecity_user');
      window.dispatchEvent(
        new CustomEvent('safecity:auth-expired', {
          detail: {
            message: 'Your session has expired or the backend database was restarted. Please log in again.',
          },
        })
      );
    }
    return Promise.reject(error);
  }
);

/**
 * Health Check API Call
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unable to connect to SafeCity Backend',
    };
  }
};

/**
 * Auth API Calls
 */
export const loginApi = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (formData) => {
  const response = await apiClient.post('/auth/register', formData);
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await apiClient.put('/users/me', profileData);
  return response.data;
};

/**
 * Emergency Report API Calls (Citizen Phase 3 & 5B)
 */
export const submitReportApi = async (reportData, evidenceFile) => {
  const formData = new FormData();

  const reportBlob = new Blob([JSON.stringify(reportData)], { type: 'application/json' });
  formData.append('report', reportBlob);

  if (evidenceFile) {
    formData.append('evidence', evidenceFile);
  }

  const response = await apiClient.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getMyReportsApi = async () => {
  const response = await apiClient.get('/reports/my');
  return response.data;
};

export const getMyReportSummaryApi = async () => {
  const response = await apiClient.get('/reports/my/summary');
  return response.data;
};

export const getReportByIdApi = async (id) => {
  const response = await apiClient.get(`/reports/${id}`);
  return response.data;
};

export const getStatusHistoryApi = async (id) => {
  const response = await apiClient.get(`/reports/${id}/status-history`);
  return response.data;
};

export const getMapMarkersApi = async () => {
  const response = await apiClient.get('/reports/map');
  return response.data;
};

export const getEvidenceUrl = (fileName) => {
  if (!fileName) return null;
  return `${API_BASE_URL}/reports/evidence/${fileName}`;
};

/**
 * Admin Management API Calls (Phase 4A & 4B)
 */
export const getAdminDashboardSummaryApi = async () => {
  const response = await apiClient.get('/admin/dashboard/summary');
  return response.data;
};

export const getAllReportsAdminApi = async () => {
  const response = await apiClient.get('/admin/reports');
  return response.data;
};

export const getAdminReportByIdApi = async (id) => {
  const response = await apiClient.get(`/admin/reports/${id}`);
  return response.data;
};

export const updateReportStatusAdminApi = async (id, status) => {
  const response = await apiClient.put(`/admin/reports/${id}/status`, { status });
  return response.data;
};

export const updateReportPriorityAdminApi = async (id, priority) => {
  const response = await apiClient.put(`/admin/reports/${id}/priority`, { priority });
  return response.data;
};

export const getAdminRespondersApi = async () => {
  const response = await apiClient.get('/admin/responders');
  return response.data;
};

export const getResponderWorkloadApi = async (id) => {
  const response = await apiClient.get(`/admin/responders/${id}/workload`);
  return response.data;
};

export const assignResponderAdminApi = async (reportId, responderId) => {
  const response = await apiClient.put(`/admin/reports/${reportId}/assign`, { responderId });
  return response.data;
};

export const getPotentialDuplicatesAdminApi = async () => {
  const response = await apiClient.get('/admin/duplicates/candidates');
  return response.data;
};

export const mergeReportsAdminApi = async (masterReportId, duplicateReportIds) => {
  const response = await apiClient.post('/admin/incidents/merge', { masterReportId, duplicateReportIds });
  return response.data;
};

export const getMasterIncidentByIdAdminApi = async (masterId) => {
  const response = await apiClient.get(`/admin/incidents/${masterId}`);
  return response.data;
};

export const unmergeReportAdminApi = async (masterId, reportId) => {
  const response = await apiClient.post(`/admin/incidents/${masterId}/unmerge/${reportId}`);
  return response.data;
};

/**
 * Resource Coordination API Calls (Feature 4 Phase 2 & 3)
 */
export const createResourceAdminApi = async (resourceData) => {
  const response = await apiClient.post('/admin/resources', resourceData);
  return response.data;
};

export const getAllResourcesAdminApi = async (status, type) => {
  const params = {};
  if (status && status !== 'ALL') params.status = status;
  if (type && type !== 'ALL') params.type = type;
  const response = await apiClient.get('/admin/resources', { params });
  return response.data;
};

export const getAvailableResourcesAdminApi = async () => {
  const response = await apiClient.get('/admin/resources/available');
  return response.data;
};

export const getReportResourcesAdminApi = async (reportId) => {
  const response = await apiClient.get(`/admin/reports/${reportId}/resources`);
  return response.data;
};

export const dispatchResourceAdminApi = async (reportId, resourceId, operatorId) => {
  const body = operatorId ? { operatorId } : {};
  const response = await apiClient.post(`/admin/reports/${reportId}/resources/${resourceId}/dispatch`, body);
  return response.data;
};

export const releaseResourceAdminApi = async (reportId, resourceId) => {
  const response = await apiClient.post(`/admin/reports/${reportId}/resources/${resourceId}/release`);
  return response.data;
};

/**
 * Feature 5: Emergency Response Intelligence API Calls
 */
export const getReportIntelligenceAdminApi = async (reportId) => {
  const response = await apiClient.get(`/admin/reports/${reportId}/intelligence`);
  return response.data;
};

export const getReportIntelligenceResponderApi = async (reportId) => {
  const response = await apiClient.get(`/responder/emergencies/${reportId}/intelligence`);
  return response.data;
};

/**
 * Responder Portal API Calls (Phase 4C)
 */
export const getResponderDashboardSummaryApi = async () => {
  const response = await apiClient.get('/responder/dashboard/summary');
  return response.data;
};

export const getAssignedEmergenciesApi = async () => {
  const response = await apiClient.get('/responder/emergencies');
  return response.data;
};

export const getResponderEmergencyByIdApi = async (id) => {
  const response = await apiClient.get(`/responder/emergencies/${id}`);
  return response.data;
};

export const acceptEmergencyApi = async (id) => {
  const response = await apiClient.put(`/responder/emergencies/${id}/accept`);
  return response.data;
};

export const startEmergencyResponseApi = async (id) => {
  const response = await apiClient.put(`/responder/emergencies/${id}/start`);
  return response.data;
};

export const resolveEmergencyApi = async (id) => {
  const response = await apiClient.put(`/responder/emergencies/${id}/resolve`);
  return response.data;
};

export const addResponseNoteApi = async (id, noteText) => {
  const response = await apiClient.post(`/responder/emergencies/${id}/notes`, { noteText });
  return response.data;
};

/**
 * Role Test API Calls
 */
export const testRoleApi = async (role) => {
  const endpoint = `/test/${role.toLowerCase()}`;
  const response = await apiClient.get(endpoint);
  return response.data;
};

/**
 * Feature 6 — Civil Defense Emergency Broadcast API Calls
 */
export const createBroadcastAdminApi = async (broadcastData) => {
  const response = await apiClient.post('/admin/broadcasts', broadcastData);
  return response.data;
};

export const getAllBroadcastsAdminApi = async () => {
  const response = await apiClient.get('/admin/broadcasts');
  return response.data;
};

export const getBroadcastByIdAdminApi = async (id) => {
  const response = await apiClient.get(`/admin/broadcasts/${id}`);
  return response.data;
};

export const cancelBroadcastAdminApi = async (id) => {
  const response = await apiClient.put(`/admin/broadcasts/${id}/cancel`);
  return response.data;
};

export const getActiveBroadcastsPublicApi = async () => {
  const response = await apiClient.get('/broadcasts/active');
  return response.data;
};

export const getNearbyBroadcastsPublicApi = async (lat, lon) => {
  const params = {};
  if (lat !== undefined && lat !== null) params.lat = lat;
  if (lon !== undefined && lon !== null) params.lon = lon;
  const response = await apiClient.get('/broadcasts/nearby', { params });
  return response.data;
};

/**
 * Feature 7 — Operations Analytics API Call
 */
export const getOperationalAnalyticsAdminApi = async () => {
  const response = await apiClient.get('/admin/analytics/overview');
  return response.data;
};

/**
 * Feature 8 — Evacuation & Emergency Shelter Management API Calls
 */
export const createShelterAdminApi = async (shelterData) => {
  const response = await apiClient.post('/admin/shelters', shelterData);
  return response.data;
};

export const getAllSheltersAdminApi = async () => {
  const response = await apiClient.get('/admin/shelters');
  return response.data;
};

export const getShelterByIdAdminApi = async (id) => {
  const response = await apiClient.get(`/admin/shelters/${id}`);
  return response.data;
};

export const updateShelterAdminApi = async (id, shelterData) => {
  const response = await apiClient.put(`/admin/shelters/${id}`, shelterData);
  return response.data;
};

export const updateShelterStatusAdminApi = async (id, status) => {
  const response = await apiClient.put(`/admin/shelters/${id}/status`, { status });
  return response.data;
};

export const updateShelterOccupancyAdminApi = async (id, currentOccupancy) => {
  const response = await apiClient.put(`/admin/shelters/${id}/occupancy`, { currentOccupancy });
  return response.data;
};

export const getAvailableSheltersPublicApi = async () => {
  const response = await apiClient.get('/shelters/available');
  return response.data;
};

export const getNearbySheltersPublicApi = async (lat, lon) => {
  const params = {};
  if (lat !== undefined && lat !== null) params.lat = lat;
  if (lon !== undefined && lon !== null) params.lon = lon;
  const response = await apiClient.get('/shelters/nearby', { params });
  return response.data;
};

/**
 * Feature 9 — Community Volunteer & First-Responder Coordination API Calls
 */
export const registerVolunteerApi = async (data) => {
  const response = await apiClient.post('/volunteers/register', data);
  return response.data;
};

export const getMyVolunteerProfileApi = async () => {
  const response = await apiClient.get('/volunteers/me');
  return response.data;
};

export const updateMyVolunteerProfileApi = async (data) => {
  const response = await apiClient.put('/volunteers/me', data);
  return response.data;
};

export const updateVolunteerAvailabilityApi = async (availability) => {
  const response = await apiClient.put('/volunteers/me/availability', { availability });
  return response.data;
};

export const withdrawVolunteerProfileApi = async () => {
  const response = await apiClient.delete('/volunteers/me');
  return response.data;
};

export const getAvailableOpportunitiesApi = async () => {
  const response = await apiClient.get('/volunteers/opportunities');
  return response.data;
};

export const expressWillingnessApi = async (taskId) => {
  const response = await apiClient.post(`/volunteers/opportunities/${taskId}/express-willingness`);
  return response.data;
};

export const markVolunteerTaskCompleteApi = async (taskId) => {
  const response = await apiClient.post(`/volunteers/tasks/${taskId}/complete`);
  return response.data;
};

export const getMyVolunteerTaskHistoryApi = async () => {
  const response = await apiClient.get('/volunteers/my-tasks');
  return response.data;
};

// Admin Volunteer Management APIs
export const getAllVolunteersAdminApi = async (approvalStatus, availability) => {
  const params = {};
  if (approvalStatus) params.approvalStatus = approvalStatus;
  if (availability) params.availability = availability;
  const response = await apiClient.get('/admin/volunteers', { params });
  return response.data;
};

export const getVolunteerByIdAdminApi = async (id) => {
  const response = await apiClient.get(`/admin/volunteers/${id}`);
  return response.data;
};

export const updateVolunteerApprovalAdminApi = async (id, approvalStatus, reason) => {
  const response = await apiClient.put(`/admin/volunteers/${id}/approval`, { approvalStatus, reason });
  return response.data;
};

export const createVolunteerOpportunityAdminApi = async (data) => {
  const response = await apiClient.post('/admin/volunteers/opportunities', data);
  return response.data;
};

export const getAllVolunteerTasksAdminApi = async (status) => {
  const params = {};
  if (status) params.status = status;
  const response = await apiClient.get('/admin/volunteers/tasks', { params });
  return response.data;
};

export const reviewVolunteerTaskAdminApi = async (taskId, status, notes) => {
  const response = await apiClient.put(`/admin/volunteers/tasks/${taskId}/review`, { status, notes });
  return response.data;
};

export default apiClient;
