import { z } from "zod";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 12;
/** Login only — keep legacy passwords working; still cap bcrypt DoS. */
export const LOGIN_PASSWORD_MAX = 128;

/** Register: 8–12 chars, upper, lower, digit, symbol. */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password minimal ${PASSWORD_MIN} karakter`)
  .max(PASSWORD_MAX, `Password maksimal ${PASSWORD_MAX} karakter`)
  .regex(/[A-Z]/, "Password wajib ada minimal 1 huruf besar")
  .regex(/[a-z]/, "Password wajib ada huruf kecil")
  .regex(/[0-9]/, "Password wajib ada angka")
  .regex(/[^A-Za-z0-9]/, "Password wajib ada simbol");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(80),
  email: z.email("Email tidak valid"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .max(
      LOGIN_PASSWORD_MAX,
      `Password maksimal ${LOGIN_PASSWORD_MAX} karakter`,
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
