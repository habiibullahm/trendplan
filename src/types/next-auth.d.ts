import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    onboardingComplete?: boolean;
  }

  interface Session {
    user: {
      id: string;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    onboardingComplete?: boolean;
  }
}
