// Shared auth validation rules — used by both the client forms and the server
// routes so the checks stay in sync.

export const MIN_PASSWORD = 6;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD;
}

export function isValidCredentials(email: string, password: string): boolean {
  return isValidEmail(email) && isValidPassword(password);
}
