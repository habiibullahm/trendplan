import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    onboardingComplete?: boolean;
    emailVerified?: Date | string | null;
    passwordNeedsUpgrade?: boolean;
    passwordVersion?: number;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      onboardingComplete: boolean;
      /** ISO string when verified; null when not. */
      emailVerified: string | null;
      passwordNeedsUpgrade: boolean;
      passwordVersion: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    onboardingComplete?: boolean;
    emailVerified?: string | null;
    passwordNeedsUpgrade?: boolean;
    passwordVersion?: number;
  }
}
