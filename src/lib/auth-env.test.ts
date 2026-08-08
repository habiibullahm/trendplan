import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { appBaseUrl, isEmailVerificationRequired } from "./auth-env";

const original = {
  EMAIL_VERIFICATION_REQUIRED: process.env.EMAIL_VERIFICATION_REQUIRED,
  AUTH_URL: process.env.AUTH_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  VERCEL_URL: process.env.VERCEL_URL,
  NODE_ENV: process.env.NODE_ENV,
};

function setNodeEnv(value: string | undefined) {
  const env = process.env as { NODE_ENV?: string };
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}

afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (key === "NODE_ENV") {
      setNodeEnv(value);
      continue;
    }
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("isEmailVerificationRequired", () => {
  it("respects explicit true/false", () => {
    process.env.EMAIL_VERIFICATION_REQUIRED = "false";
    setNodeEnv("production");
    assert.equal(isEmailVerificationRequired(), false);

    process.env.EMAIL_VERIFICATION_REQUIRED = "true";
    setNodeEnv("development");
    assert.equal(isEmailVerificationRequired(), true);
  });

  it("defaults to production-only when unset", () => {
    delete process.env.EMAIL_VERIFICATION_REQUIRED;
    setNodeEnv("production");
    assert.equal(isEmailVerificationRequired(), true);

    setNodeEnv("development");
    assert.equal(isEmailVerificationRequired(), false);
  });
});

describe("appBaseUrl", () => {
  it("prefers AUTH_URL then NEXT_PUBLIC_APP_URL", () => {
    process.env.AUTH_URL = "https://app.example.com/";
    process.env.NEXT_PUBLIC_APP_URL = "https://ignored.example.com";
    assert.equal(appBaseUrl(), "https://app.example.com");

    delete process.env.AUTH_URL;
    assert.equal(appBaseUrl(), "https://ignored.example.com");
  });

  it("uses VERCEL_URL when no AUTH_URL", () => {
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "trendplan.vercel.app";
    setNodeEnv("production");
    assert.equal(appBaseUrl(), "https://trendplan.vercel.app");
  });

  it("falls back to localhost in non-production", () => {
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    setNodeEnv("development");
    assert.equal(appBaseUrl(), "http://localhost:3000");
  });

  it("throws in production without a configured origin", () => {
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    setNodeEnv("production");
    assert.throws(() => appBaseUrl(), /AUTH_URL/);
  });
});
