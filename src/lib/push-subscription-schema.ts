import { z } from "zod";

/** Web Push subscription body bounds (browser keys are short base64). */
export const PUSH_ENDPOINT_MAX = 2048;
export const PUSH_KEY_MAX = 512;

const httpsEndpointSchema = z
  .string()
  .trim()
  .min(1)
  .max(PUSH_ENDPOINT_MAX)
  .refine((v) => /^https:\/\//i.test(v), { message: "endpoint must be https" });

export const pushSubscribeBodySchema = z.object({
  endpoint: httpsEndpointSchema,
  keys: z.object({
    p256dh: z.string().trim().min(1).max(PUSH_KEY_MAX),
    auth: z.string().trim().min(1).max(PUSH_KEY_MAX),
  }),
});

export const pushUnsubscribeBodySchema = z.object({
  endpoint: httpsEndpointSchema.optional(),
});

export type PushSubscribeBody = z.infer<typeof pushSubscribeBodySchema>;
