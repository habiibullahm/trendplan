"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_BOOTSTRAP = `(function(){try{var k="trendplan-theme";var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t="system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

/**
 * Injects the pre-hydration theme bootstrap outside the React client tree
 * via useServerInsertedHTML — avoids React 19's "script in component" warning
 * while still preventing FOUC.
 */
export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
  ));
  return null;
}
