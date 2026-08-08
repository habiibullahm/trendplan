import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  appBaseUrl,
  isEmailVerificationRequired,
  isTransactionalEmailEnabled,
} from "./env";

const original = {
  EMAIL_VERIFICATION_REQUIRED: process.env.EMAIL_VERIFICATION_REQUIRED,
  TRANSACTIONAL_EMAIL_ENABLED: process.env.TRANSACTIONAL_EMAIL_ENABLED,
  NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED:
    process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED,
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
  it("respects explicit false", () => {
    process.env.EMAIL_VERIFICATION_REQUIRED = "false";
    process.env.TRANSACTIONAL_EMAIL_ENABLED = "true";
    delete process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED;
    setNodeEnv("production");
    assert.equal(isEmailVerificationRequired(), false);
  });

  it("requires transactional email when verification is opted in", () => {
    process.env.EMAIL_VERIFICATION_REQUIRED = "true";
    delete process.env.TRANSACTIONAL_EMAIL_ENABLED;
    delete process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED;
    setNodeEnv("development");
    assert.equal(isEmailVerificationRequired(), false);

    process.env.TRANSACTIONAL_EMAIL_ENABLED = "true";
    assert.equal(isEmailVerificationRequired(), true);
  });

  it("defaults to off when unset (until domain / opt-in)", () => {
    delete process.env.EMAIL_VERIFICATION_REQUIRED;
    delete process.env.TRANSACTIONAL_EMAIL_ENABLED;
    delete process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED;
    setNodeEnv("production");
    assert.equal(isEmailVerificationRequired(), false);

    setNodeEnv("development");
    assert.equal(isEmailVerificationRequired(), false);
  });
});

describe("isTransactionalEmailEnabled", () => {
  it("defaults to off", () => {
    delete process.env.TRANSACTIONAL_EMAIL_ENABLED;
    delete process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED;
    assert.equal(isTransactionalEmailEnabled(), false);
  });

  it("respects TRANSACTIONAL_EMAIL_ENABLED", () => {
    delete process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED;
    process.env.TRANSACTIONAL_EMAIL_ENABLED = "true";
    assert.equal(isTransactionalEmailEnabled(), true);

    process.env.TRANSACTIONAL_EMAIL_ENABLED = "false";
    assert.equal(isTransactionalEmailEnabled(), false);
  });

  it("prefers NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED when set", () => {
    process.env.TRANSACTIONAL_EMAIL_ENABLED = "false";
    process.env.NEXT_PUBLIC_TRANSACTIONAL_EMAIL_ENABLED = "true";
    assert.equal(isTransactionalEmailEnabled(), true);
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
