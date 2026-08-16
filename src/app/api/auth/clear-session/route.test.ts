import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isClearSessionRequestAllowed } from "@/app/api/auth/clear-session/route";

/** `process.env.NODE_ENV` is typed read-only; mutate via Reflect for test stubs. */
function setNodeEnv(value: string | undefined) {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, "NODE_ENV");
  } else {
    Reflect.set(process.env, "NODE_ENV", value);
  }
}

describe("isClearSessionRequestAllowed", () => {
  const prevAuth = process.env.AUTH_URL;

  it("allows requests with no Origin or Referer", () => {
    process.env.AUTH_URL = "https://trendplan.vercel.app";
    try {
      const req = new Request("https://trendplan.vercel.app/api/auth/clear-session");
      assert.equal(isClearSessionRequestAllowed(req), true);
    } finally {
      if (prevAuth === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prevAuth;
    }
  });

  it("allows same-origin Origin and rejects cross-site Origin", () => {
    process.env.AUTH_URL = "https://trendplan.vercel.app";
    try {
      const ok = new Request("https://trendplan.vercel.app/api/auth/clear-session", {
        headers: { Origin: "https://trendplan.vercel.app" },
      });
      assert.equal(isClearSessionRequestAllowed(ok), true);

      const bad = new Request("https://trendplan.vercel.app/api/auth/clear-session", {
        headers: { Origin: "https://evil.example" },
      });
      assert.equal(isClearSessionRequestAllowed(bad), false);
    } finally {
      if (prevAuth === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prevAuth;
    }
  });

  it("checks Referer when Origin is absent", () => {
    process.env.AUTH_URL = "https://trendplan.vercel.app";
    try {
      const ok = new Request("https://trendplan.vercel.app/api/auth/clear-session", {
        headers: { Referer: "https://trendplan.vercel.app/dashboard" },
      });
      assert.equal(isClearSessionRequestAllowed(ok), true);

      const bad = new Request("https://trendplan.vercel.app/api/auth/clear-session", {
        headers: { Referer: "https://evil.example/phish" },
      });
      assert.equal(isClearSessionRequestAllowed(bad), false);
    } finally {
      if (prevAuth === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prevAuth;
    }
  });

  it("denies when Origin is present but appBaseUrl cannot be resolved", () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevVercelUrl = process.env.VERCEL_URL;
    const prevPublic = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    setNodeEnv("production");
    try {
      const req = new Request("https://trendplan.vercel.app/api/auth/clear-session", {
        headers: { Origin: "https://evil.example" },
      });
      assert.equal(isClearSessionRequestAllowed(req), false);
    } finally {
      if (prevAuth === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prevAuth;
      if (prevVercelUrl === undefined) delete process.env.VERCEL_URL;
      else process.env.VERCEL_URL = prevVercelUrl;
      if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = prevPublic;
      setNodeEnv(prevNodeEnv);
    }
  });
});
