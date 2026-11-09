// Shared auth validation rules — used by both the client forms and the server
// routes so the checks stay in sync.
//
// A student is identified by first name + last name for login, and by a unique
// phone number as the account key. Passwords are checked server-side.

export const MIN_PASSWORD = 6;
export const MAX_NAME = 100;
export const MAX_PHONE = 30;

// Phone: digits with optional +, spaces, dashes and parentheses. 4–30 chars.
export const PHONE_RE = /^\+?[\d\s()-]{4,30}$/;

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= MAX_NAME;
}

export function isValidPhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD;
}

// Registration: all fields valid and the two passwords match.
export function isValidRegistration(
  firstName: string,
  lastName: string,
  phone: string,
  password: string,
  confirmPassword: string,
): boolean {
  return (
    isValidName(firstName) &&
    isValidName(lastName) &&
    isValidPhone(phone) &&
    isValidPassword(password) &&
    password === confirmPassword
  );
}

// Login: name present and a (non-empty) password. The real password check is on
// the server.
export function isValidLogin(
  firstName: string,
  lastName: string,
  password: string,
): boolean {
  return isValidName(firstName) && isValidName(lastName) && password.length > 0;
}
