import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { isPrismaUniqueConflict } from "./prisma-errors";

describe("isPrismaUniqueConflict", () => {
  it("is true for Prisma P2002", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique failed", {
      code: "P2002",
      clientVersion: "0.0.0",
    });
    assert.equal(isPrismaUniqueConflict(error), true);
  });

  it("is false for other Prisma codes and plain errors", () => {
    const other = new Prisma.PrismaClientKnownRequestError("Missing", {
      code: "P2025",
      clientVersion: "0.0.0",
    });
    assert.equal(isPrismaUniqueConflict(other), false);
    assert.equal(isPrismaUniqueConflict(new Error("P2002")), false);
  });
});
