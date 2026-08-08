/** Shared login/register rate-limit windows (actions + Auth.js authorize). */

export const LOGIN_IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
export const LOGIN_EMAIL_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
export const REGISTER_IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
export const REGISTER_EMAIL_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
