import { USE_MOCK } from './flags';
import { mockService } from './mock/service';

/**
 * System / maintenance operations.
 * `reset` restores the deterministic demo seed — only meaningful when the
 * in-browser mock backend is active.
 */
export async function reset() {
  if (USE_MOCK) return mockService.resetDb();
  throw new Error('Demo data can only be reset while the mock backend is enabled.');
}
