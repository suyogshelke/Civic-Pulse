/**
 * Axios instance shared by every real-backend API module.
 *
 * - Injects the JWT bearer token from localStorage on each request.
 * - Normalises backend errors into a consistent ApiError shape.
 * - On 401 responses, clears the session and bounces to /login.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const TOKEN_KEY = 'civicpulse.token';
export const USER_KEY = 'civicpulse.user';

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.assign('/login');
      }
      const message = data?.message || data?.error || 'Something went wrong. Please try again.';
      return Promise.reject(new ApiError(status, message, data?.details || null));
    }
    if (error.request) {
      return Promise.reject(new ApiError(0, 'Unable to reach the server. Check your connection.'));
    }
    return Promise.reject(new ApiError(0, error.message));
  },
);

export default client;
