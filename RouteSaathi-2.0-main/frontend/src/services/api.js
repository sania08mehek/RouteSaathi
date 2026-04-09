import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) return '/api';
    // Ensure the URL ends with /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getUsers: () => api.get('/auth/users'),
    getConductors: () => api.get('/auth/conductors'),
};

// Buses API
export const busesAPI = {
    getAll: () => api.get('/buses'),
    getStats: () => api.get('/buses/stats'),
    getById: (busId) => api.get(`/buses/${busId}`),
    getByRoute: (routeId) => api.get(`/buses/by-route/${routeId}`),
    updateStatus: (busId, status) => api.patch(`/buses/${busId}/status`, { status }),
    updateOccupancy: (busId, occupancy) => api.patch(`/buses/${busId}/occupancy`, { occupancy_percent: occupancy }),
    simulateMovement: () => api.post('/buses/simulate-movement'),
};

// Routes API
export const routesAPI = {
    getAll: () => api.get('/routes'),
    getStats: () => api.get('/routes/stats'),
    getById: (routeId) => api.get(`/routes/${routeId}`),
    search: (query) => api.get(`/routes/search/${query}`),
};

// Tickets API
export const ticketsAPI = {
    getAll: () => api.get('/tickets'),
    getStats: () => api.get('/tickets/stats'),
    issue: (ticketData) => api.post('/tickets/issue', ticketData),
    getByBus: (busId) => api.get(`/tickets/by-bus/${busId}`),
    getHourlyDemand: (routeId) => api.get(`/tickets/hourly-demand/${routeId}`),
};

// Notifications API
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    getRecent: (limit = 10) => api.get(`/notifications/recent?limit=${limit}`),
    getUnread: () => api.get('/notifications/unread'),
    getByType: (type) => api.get(`/notifications/by-type/${type}`),
    broadcast: (message, priority = "MEDIUM", type = "BROADCAST") =>
        api.post('/notifications/broadcast', { message, priority, type }),
    sendSOS: (busId, location, message) => api.post('/notifications/sos', { bus_id: busId, location, message }),
    reportTraffic: (busId, location, message) => api.post('/notifications/traffic', { bus_id: busId, location, message }),
    resolve: (alertId) => api.patch(`/notifications/${alertId}/resolve`),
    getStats: () => api.get('/notifications/stats'),
};

// AI Engine API
export const aiAPI = {
    getRecommendations: () => api.get('/ai/recommendations'),
    getHighPriority: () => api.get('/ai/recommendations/high-priority'),
    getAnalytics: () => api.get('/ai/analytics'),
    applyAllocation: (routeId, action, busesChange) =>
        api.post('/ai/apply-allocation', { route_id: routeId, action, buses_change: busesChange }),
    predictDemand: (routeId) => api.get(`/ai/predict-demand/${routeId}`),
    getCongestionAlerts: () => api.get('/ai/congestion-alerts'),
    getMLSuggestionsCount: () => api.get('/ai/ml-suggestions-count'),
};

// Conductors API
export const conductorsAPI = {
    getAssignment: (conductorId) => api.get(`/conductors/assignment/${conductorId}`),
    getNotifications: (conductorId) => api.get(`/conductors/notifications/${conductorId}`),
    updateStatus: (conductorId, status) => api.patch(`/conductors/status/${conductorId}`, { status }),
    reportBreakdown: (busId, location, issue) =>
        api.post('/conductors/breakdown-report', { bus_id: busId, location, issue }),
    getQuickActions: () => api.get('/conductors/quick-actions'),
    getAll: () => api.get('/conductors/all'),
};

export default api;
