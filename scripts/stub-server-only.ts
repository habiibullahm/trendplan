/**
 * Stub `server-only` for Node unit tests (tsx --test).
 * Next still enforces the real package when bundling Client Components.
 */
import Module from "node:module";

type Load = typeof Module._load;

const originalLoad: Load = Module._load;
Module._load = function (
  this: unknown,
  request: string,
  parent: Parameters<Load>[1],
  isMain: boolean,
) {
  if (request === "server-only") {
    return {};
  }
  return originalLoad(request, parent, isMain);
} as Load;
