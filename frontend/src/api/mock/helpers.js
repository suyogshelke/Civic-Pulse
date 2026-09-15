/** Shared utilities for the mock service layer. */

const LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY ?? 350);

/** Simulate network latency so spinners and loading states are exercised. */
export const delay = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mirror the ApiError shape thrown by the real axios client. */
export class MockApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
    this.details = details;
  }
}

/** A base64url-ish fake JWT so the token looks realistic in devtools. */
export function signFakeToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: String(user.id),
      email: user.email,
      role: user.role,
      name: user.fullName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    }),
  );
  return `${header}.${payload}.mock-signature`;
}

export function decodeFakeToken(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/** Strip the password before any user object leaves the mock layer. */
export function sanitiseUser(user) {
  if (!user) return null;
  const clone = { ...user };
  delete clone.password;
  return clone;
}

/** Read a File into a data URL so uploaded evidence previews in the browser. */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
