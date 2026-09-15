import client from './client';
import { USE_MOCK } from './flags';
import { mockService } from './mock/service';
import { getCurrentUser } from '../auth/session';

export async function overview() {
  if (USE_MOCK) return mockService.analytics();
  return client.get('/analytics/overview');
}

export async function officer() {
  if (USE_MOCK) return mockService.officerStats(getCurrentUser()?.id);
  return client.get('/analytics/officer');
}

export async function citizen() {
  if (USE_MOCK) return mockService.citizenStats(getCurrentUser()?.id);
  return client.get('/analytics/citizen');
}
