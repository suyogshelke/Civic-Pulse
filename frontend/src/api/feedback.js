import client from './client';
import { USE_MOCK } from './flags';
import { mockService } from './mock/service';
import { getCurrentUser } from '../auth/session';

export async function submit(complaintId, payload) {
  if (USE_MOCK) return mockService.submitFeedback(getCurrentUser(), complaintId, payload);
  return client.post(`/complaints/${complaintId}/feedback`, payload);
}
