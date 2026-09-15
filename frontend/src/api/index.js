/**
 * API facade.
 *
 * Each domain module exposes the same function names whether it talks to the
 * real Spring Boot backend (via axios) or the in-browser mock service. The
 * VITE_USE_MOCK_API flag decides which implementation the app uses, so no
 * component ever needs to know where its data comes from.
 */

import * as authApi from './auth';
import * as complaintsApi from './complaints';
import * as departmentsApi from './departments';
import * as usersApi from './users';
import * as analyticsApi from './analytics';
import * as feedbackApi from './feedback';
import * as systemApi from './system';

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_API) === 'true';

export const api = {
  auth: authApi,
  complaints: complaintsApi,
  departments: departmentsApi,
  users: usersApi,
  analytics: analyticsApi,
  feedback: feedbackApi,
  system: systemApi,
};

export { ApiError } from './client';
