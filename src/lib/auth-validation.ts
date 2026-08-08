import { z } from "zod";

/** Length-based policy: easy to use, resistant to short guesses. */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;
/** Login only — keep legacy short passwords working; still cap bcrypt DoS. */
export const LOGIN_PASSWORD_MAX = 128;

/** New passwords: min length only (no composition rules). */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password minimal ${PASSWORD_MIN} karakter`)
  .max(PASSWORD_MAX, `Password maksimal ${PASSWORD_MAX} karakter`);

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

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Password saat ini wajib diisi")
      .max(LOGIN_PASSWORD_MAX),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const requestPasswordResetSchema = z.object({
  email: z.email("Email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token tidak valid"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const verifyEmailTokenSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
