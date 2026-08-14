import { z } from "zod";

/** Optional hook on create — keep short for feed cards. */
export const hookSchema = z.string().trim().max(280);
export const captionSchema = z.string().trim().max(2000);
export const hashtagsSchema = z.string().trim().max(500);
