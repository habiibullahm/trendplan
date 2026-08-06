"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(80),
  email: z.email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar. Silakan masuk." };
  }

  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      niche: "Couple Date Ideas",
      weeklyGoal: 3,
      onboardingComplete: false,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Akun dibuat, tapi gagal masuk otomatis. Coba masuk manual." };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw error;
  }

  return {};
}
