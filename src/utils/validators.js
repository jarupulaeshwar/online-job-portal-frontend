export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());

/** Same rule as the backend: 8-72 characters with at least one letter and one number. */
export const isStrongPassword = (value) => /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(value || '');

export const isPhone = (value) => !value || /^[0-9+()\-\s]{7,30}$/.test(value);

export const PASSWORD_HINT = 'At least 8 characters with a letter and a number.';

export function validateRegistration({ fullName, email, password, companyName }, isRecruiter) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = 'Enter your full name.';
  if (!email?.trim()) errors.email = 'Enter your email address.';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Choose a password.';
  else if (!isStrongPassword(password)) errors.password = PASSWORD_HINT;
  if (isRecruiter && !companyName?.trim()) errors.companyName = 'Enter your company name.';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = 'Enter your email address.';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}
