/**
 * Modal/Dialog UI smoke (behavior contracts).
 * Run: npm run smoke:modal
 *
 * Covers residual risks after Button/Modal → shadcn Dialog:
 * 1) Escape / backdrop while form loading must cancel Dialog close
 * 2) Avatar file-picker restoreFocus / finalFocus mapping
 * 3) Mobile bottom-sheet vs desktop centered class tokens
 *
 * Manual browser checks still useful after this passes:
 * - Akun → Ubah password / niche / goal: submit → Escape + backdrop
 * - Avatar → Ubah → OS file picker
 * - Resize 375 / 768: sheet vs centered panel
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Running modal UI smoke contracts…\n");

const result = spawnSync(
  "npx",
  [
    "tsx",
    "--import",
    "./scripts/stub-server-only.ts",
    "--test",
    "src/components/ui/modal-behavior.test.ts",
  ],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("\nSMOKE OK — modal UI contracts passed");
console.log(
  "Manual (optional): password/niche/goal dismiss while loading; avatar Ubah → picker; 375 vs 768 sheet",
);
