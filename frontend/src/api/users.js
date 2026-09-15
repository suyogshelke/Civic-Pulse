import client from './client';
import { USE_MOCK } from './flags';
import { mockService } from './mock/service';

export async function list(role) {
  if (USE_MOCK) return mockService.listUsers(role);
  return client.get('/users', { params: { role } });
}

export async function saveOfficer(form) {
  if (USE_MOCK) return mockService.saveOfficer(form);
  return form.id ? client.put(`/users/officers/${form.id}`, form) : client.post('/users/officers', form);
}

export async function toggleActive(userId) {
  if (USE_MOCK) return mockService.toggleUserActive(userId);
  return client.patch(`/users/${userId}/active`);
}
