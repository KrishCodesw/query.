// lib/auth.utils.ts file

import * as bcrypt from 'bcrypt';

// --- Constants ---
export const COOKIE_NAME = "app_session_token";

// --- Password Hashing ---

/**
 * Hashes a plaintext password.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plaintext password to a stored hash.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- Session Management ---

/**
 * Returns a new Date object set to 7 days from now.
 */
export function getSessionExpiry(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7-day session
  return expiryDate;
}