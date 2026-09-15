import client from './client';
import { USE_MOCK } from './flags';
import { mockService } from './mock/service';
import { getCurrentUser } from '../auth/session';

export async function list(filters = {}) {
  if (USE_MOCK) return mockService.listComplaints(filters);
  return client.get('/complaints', { params: filters });
}

export async function get(id) {
  if (USE_MOCK) return mockService.getComplaint(id);
  return client.get(`/complaints/${id}`);
}

export async function create(form) {
  if (USE_MOCK) return mockService.createComplaint(getCurrentUser(), form);
  const data = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (k === 'files' && v) v.forEach((f) => data.append('files', f));
    else if (v !== undefined && v !== null) data.append(k, v);
  });
  return client.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function transition(id, payload) {
  if (USE_MOCK) return mockService.transitionComplaint(getCurrentUser(), id, payload);
  const data = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (k === 'files' && v) v.forEach((f) => data.append('files', f));
    else if (v !== undefined && v !== null) data.append(k, v);
  });
  return client.patch(`/complaints/${id}/status`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function setPriority(id, priority) {
  if (USE_MOCK) return mockService.setPriority(getCurrentUser(), id, priority);
  return client.patch(`/complaints/${id}/priority`, { priority });
}

export async function assign(id, officerId, remark) {
  if (USE_MOCK) return mockService.transitionComplaint(getCurrentUser(), id, { toStatus: 'ASSIGNED', officerId, remark });
  return client.patch(`/complaints/${id}/assign`, { officerId, remark });
}
