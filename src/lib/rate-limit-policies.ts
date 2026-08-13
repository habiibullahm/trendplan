/** Non-auth rate-limit windows (avatar, push, etc.). */

export const AVATAR_UPLOAD_USER_LIMIT = {
  limit: 10,
  windowMs: 60 * 60 * 1000,
} as const;

export const AVATAR_UPLOAD_IP_LIMIT = {
  limit: 20,
  windowMs: 60 * 60 * 1000,
} as const;

export const PUSH_SUBSCRIBE_USER_LIMIT = {
  limit: 30,
  windowMs: 60 * 60 * 1000,
} as const;

export const PUSH_UNSUBSCRIBE_USER_LIMIT = {
  limit: 30,
  windowMs: 60 * 60 * 1000,
} as const;
