/**
 * Form validation. Each validator returns an object of
 * { fieldName: 'error message' } — empty means the form is valid.
 */

import { UPLOAD_RULES } from './constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile numbers
const PIN_RE = /^[1-9]\d{5}$/;

export const isEmail = (v) => EMAIL_RE.test((v || '').trim());
export const isPhone = (v) => PHONE_RE.test((v || '').trim());
export const isPincode = (v) => PIN_RE.test((v || '').trim());

/**
 * Password policy: at least 8 characters with one letter and one digit.
 * Deliberately matches the rule enforced in the backend so a password that
 * passes here can never be rejected server-side.
 */
export function passwordProblem(pw = '') {
  if (pw.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter';
  if (!/\d/.test(pw)) return 'Password must contain at least one number';
  return null;
}

/** 0–4 strength score for the meter shown on the registration form. */
export function passwordStrength(pw = '') {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email address is required';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateRegistration(form) {
  const errors = {};
  if (!form.fullName?.trim()) errors.fullName = 'Full name is required';
  else if (form.fullName.trim().length < 3) errors.fullName = 'Name must be at least 3 characters';

  if (!form.email?.trim()) errors.email = 'Email address is required';
  else if (!isEmail(form.email)) errors.email = 'Enter a valid email address';

  if (!form.phone?.trim()) errors.phone = 'Mobile number is required';
  else if (!isPhone(form.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number';

  if (!form.address?.trim()) errors.address = 'Address is required';

  if (!form.ward) errors.ward = 'Please select your ward';

  if (form.pincode && !isPincode(form.pincode)) errors.pincode = 'Enter a valid 6-digit PIN code';

  const pwProblem = passwordProblem(form.password || '');
  if (pwProblem) errors.password = pwProblem;

  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (!form.acceptTerms) errors.acceptTerms = 'You must accept the terms to continue';

  return errors;
}

export function validateComplaint(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'A short title is required';
  else if (form.title.trim().length < 10) errors.title = 'Title should be at least 10 characters';
  else if (form.title.length > 120) errors.title = 'Title must be 120 characters or fewer';

  if (!form.category) errors.category = 'Select the issue category';

  if (!form.description?.trim()) errors.description = 'Description is required';
  else if (form.description.trim().length < 25)
    errors.description = 'Please describe the issue in at least 25 characters';
  else if (form.description.length > 2000)
    errors.description = 'Description must be 2000 characters or fewer';

  if (!form.ward) errors.ward = 'Select the ward where the issue is located';
  if (!form.landmark?.trim()) errors.landmark = 'A nearby landmark helps officers locate the issue';
  if (!form.priority) errors.priority = 'Select a priority';
  if (form.pincode && !isPincode(form.pincode)) errors.pincode = 'Enter a valid 6-digit PIN code';

  return errors;
}

export function validateDepartment(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Department name is required';
  if (!form.code?.trim()) errors.code = 'Department code is required';
  else if (!/^[A-Z]{2,6}$/.test(form.code.trim()))
    errors.code = 'Code must be 2–6 uppercase letters';
  if (form.email && !isEmail(form.email)) errors.email = 'Enter a valid email address';
  if (form.phone && !isPhone(form.phone)) errors.phone = 'Enter a valid 10-digit mobile number';
  return errors;
}

export function validateOfficer(form, { requirePassword = true } = {}) {
  const errors = {};
  if (!form.fullName?.trim()) errors.fullName = 'Full name is required';
  if (!form.email?.trim()) errors.email = 'Email address is required';
  else if (!isEmail(form.email)) errors.email = 'Enter a valid email address';
  if (!form.phone?.trim()) errors.phone = 'Mobile number is required';
  else if (!isPhone(form.phone)) errors.phone = 'Enter a valid 10-digit mobile number';
  if (!form.departmentId) errors.departmentId = 'Assign the officer to a department';
  if (!form.designation?.trim()) errors.designation = 'Designation is required';
  if (requirePassword) {
    const pwProblem = passwordProblem(form.password || '');
    if (pwProblem) errors.password = pwProblem;
  }
  return errors;
}

/** Validates a single evidence file against the upload rules. */
export function validateFile(file) {
  if (!UPLOAD_RULES.acceptedTypes.includes(file.type)) {
    return `"${file.name}" is not a supported image (use JPG, PNG or WebP)`;
  }
  if (file.size > UPLOAD_RULES.maxSizeMb * 1024 * 1024) {
    return `"${file.name}" is larger than ${UPLOAD_RULES.maxSizeMb} MB`;
  }
  return null;
}

export const hasErrors = (errors) => Object.keys(errors || {}).length > 0;
