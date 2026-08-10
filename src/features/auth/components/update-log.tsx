"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { ChipButton } from "@/components/ui/chip-button";
import { Modal } from "@/components/ui/modal";
import {
  APP_VERSION,
  UPDATE_LOG,
  UPDATE_STORAGE_KEY,
} from "@/lib/updates";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSeenSnapshot() {
  try {
    return localStorage.getItem(UPDATE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return APP_VERSION;
}

export function UpdateLog() {
  const [open, setOpen] = useState(false);
  const seen = useSyncExternalStore(
    subscribe,
    getSeenSnapshot,
    getServerSnapshot,
  );
  const hasNew = seen !== APP_VERSION;

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(UPDATE_STORAGE_KEY, APP_VERSION);
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* ignore */
    }
  }, []);

  function openLog() {
    setOpen(true);
    markSeen();
  }

  return (
    <>
      <button
        type="button"
        onClick={openLog}
        className="min-touch flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-coral/40"
      >
        <span>
          <span className="flex items-center gap-2">
            <span className="block text-sm font-semibold text-ink">Update</span>
            {hasNew ? (
              <span className="rounded-full bg-coral/15 px-1.5 py-0.5 text-[10px] font-semibold text-coral">
                Baru
              </span>
            ) : null}
          </span>
          <span className="text-xs text-ink-muted">
            Catatan rilis untuk creator
          </span>
        </span>
        <span className="text-ink-muted">→</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Update"
        description={`TrendPlan v${APP_VERSION} — perubahan terbaru untuk creator.`}
        size="sm"
      >
        <ul className="max-h-[min(24rem,60vh)] space-y-4 overflow-y-auto">
          {UPDATE_LOG.map((entry) => (
            <li
              key={entry.id}
              className="border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                <span>{entry.date}</span>
                <span
                  className="rounded-full border border-border px-1.5 py-0.5 font-semibold text-ink-muted"
                  aria-label={`Versi ${entry.version}`}
                >
                  v{entry.version}
                </span>
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{entry.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{entry.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <ChipButton type="button" onClick={() => setOpen(false)}>
            Tutup
          </ChipButton>
        </div>
      </Modal>
    </>
  );
}
