import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  APP_UPDATE_ID,
  APP_VERSION,
  UPDATE_LOG,
} from "@/lib/updates";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const packageJson = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
) as { version: string };

describe("update log versioning", () => {
  it("APP_VERSION matches package.json version", () => {
    assert.equal(APP_VERSION, packageJson.version);
  });

  it("every entry has a non-empty version and id", () => {
    for (const entry of UPDATE_LOG) {
      assert.ok(entry.id.length > 0, "entry id required");
      assert.ok(entry.version.length > 0, `version required for ${entry.id}`);
      assert.match(entry.version, /^\d+\.\d+\.\d+$/, entry.id);
    }
  });

  it("latest entry id is APP_UPDATE_ID and uses current APP_VERSION", () => {
    assert.equal(UPDATE_LOG[0]!.id, APP_UPDATE_ID);
    assert.equal(UPDATE_LOG[0]!.version, APP_VERSION);
  });
});
