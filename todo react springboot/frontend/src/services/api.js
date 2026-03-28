import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * API Service
 *
 * Centralized Axios instance for making HTTP requests.
 * Automatically adds JWT token to requests and handles errors.
 */

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} data - { username, email, password, confirmPassword }
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login with username/email and password
   * @param {Object} data - { username, password }
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Get current user info
   */
  getCurrentUser: () => api.get('/auth/me'),
};

/**
 * Task API calls
 */
export const taskAPI = {
  /**
   * Get all tasks (optionally filtered)
   * @param {Object} params - { completed: true/false } or {}
   */
  getTasks: (params = {}) => api.get('/tasks', { params }),

  /**
   * Get a single task by ID
   * @param {number} id - Task ID
   */
  getTask: (id) => api.get(`/tasks/${id}`),

  /**
   * Create a new task
   * @param {Object} data - { title, description, priority, dueDate }
   */
  createTask: (data) => api.post('/tasks', data),

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} data - Updated task data
   */
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),

  /**
   * Delete a task
   * @param {number} id - Task ID
   */
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  /**
   * Toggle task completion status
   * @param {number} id - Task ID
   */
  toggleComplete: (id) => api.patch(`/tasks/${id}/complete`),

  /**
   * Get overdue tasks
   */
  getOverdueTasks: () => api.get('/tasks/overdue'),

  /**
   * Get task count
   * @param {Object} params - { completed: true/false } or {}
   */
  getTaskCount: (params = {}) => api.get('/tasks/count', { params }),
};

export default api;
