import client from './client';
import { USE_MOCK } from './flags';
import { mockService } from './mock/service';

export async function list() {
  if (USE_MOCK) return mockService.listDepartments();
  return client.get('/departments');
}

export async function save(form) {
  if (USE_MOCK) return mockService.saveDepartment(form);
  return form.id ? client.put(`/departments/${form.id}`, form) : client.post('/departments', form);
}
