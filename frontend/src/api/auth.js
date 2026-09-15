import client, { TOKEN_KEY, USER_KEY } from './client';
import { USE_MOCK } from './flags';
import { mockService } from './mock/service';
import { getCurrentUser } from '../auth/session';

export async function login(credentials) {
  const res = USE_MOCK ? await mockService.login(credentials) : await client.post('/auth/login', credentials);
  return res;
}

export async function register(form) {
  const res = USE_MOCK ? await mockService.register(form) : await client.post('/auth/register', form);
  return res;
}

export async function me() {
  if (USE_MOCK) return mockService.me(getCurrentUser()?.id);
  return client.get('/auth/me');
}

export async function updateProfile(patch) {
  if (USE_MOCK) return mockService.updateProfile(getCurrentUser()?.id, patch);
  return client.put('/users/me', patch);
}

export async function changePassword(payload) {
  if (USE_MOCK) return mockService.changePassword(getCurrentUser()?.id, payload);
  return client.put('/users/me/password', payload);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
