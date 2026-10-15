import { describe, expect, it } from 'vitest';
import { isEmail, isPhone, isStrongPassword, validateLogin, validateRegistration } from '../utils/validators.js';

describe('validators', () => {
  it('accepts and rejects email addresses', () => {
    expect(isEmail('student@example.com')).toBe(true);
    expect(isEmail('  student@example.com  ')).toBe(true);
    expect(isEmail('student@')).toBe(false);
    expect(isEmail('not an email')).toBe(false);
  });

  it('requires a letter, a number and 8 characters in passwords', () => {
    expect(isStrongPassword('Passw0rd1')).toBe(true);
    expect(isStrongPassword('short1')).toBe(false);
    expect(isStrongPassword('onlyletters')).toBe(false);
    expect(isStrongPassword('12345678')).toBe(false);
  });

  it('validates phone numbers but allows empty', () => {
    expect(isPhone('')).toBe(true);
    expect(isPhone('+91 98765 43210')).toBe(true);
    expect(isPhone('abc')).toBe(false);
  });

  it('reports every registration problem', () => {
    const errors = validateRegistration({ fullName: '', email: 'bad', password: 'x', companyName: '' }, true);
    expect(Object.keys(errors).sort()).toEqual(['companyName', 'email', 'fullName', 'password']);
    expect(validateRegistration({ fullName: 'A', email: 'a@b.co', password: 'Passw0rd1' }, false)).toEqual({});
  });

  it('validates the login form', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Enter your email address.',
      password: 'Enter your password.',
    });
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({});
  });
});
