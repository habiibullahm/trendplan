"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChipButton } from "@/components/ui/chip-button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function getExistingSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export function PushReminderToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      toast.error("Pengingat belum dikonfigurasi (VAPID).");
      return;
    }
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      toast.error("Browser ini tidak mendukung notifikasi push.");
      return;
    }

    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Izin notifikasi ditolak.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await reg.update();
      const ready = await navigator.serviceWorker.ready;

      const subscription = await ready.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!endpoint || !p256dh || !auth) {
        toast.error("Gagal membuat langganan push.");
        return;
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          keys: { p256dh, auth },
        }),
      });
      if (!res.ok) {
        toast.error("Gagal menyimpan pengingat.");
        return;
      }

      setEnabled(true);
      toast.success("Pengingat plan diaktifkan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengaktifkan pengingat.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const subscription = await getExistingSubscription();
      const endpoint = subscription?.endpoint;

      if (subscription) {
        try {
          await subscription.unsubscribe();
        } catch {
          // continue to delete server row
        }
      }

      const res = await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endpoint ? { endpoint } : {}),
      });
      if (!res.ok) {
        toast.error("Gagal menonaktifkan pengingat.");
        return;
      }

      setEnabled(false);
      toast.success("Pengingat plan dimatikan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menonaktifkan pengingat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">Pengingat plan</p>
          <p className="text-xs text-ink-muted">
            H-1 jam 20:00 WIB dan kabar update aplikasi (satu izin).
          </p>
        </div>
        <ChipButton
          variant="ghost"
          disabled={busy}
          onClick={() => {
            void (enabled ? disable() : enable());
          }}
        >
          {busy ? "…" : enabled ? "Nonaktifkan" : "Aktifkan"}
        </ChipButton>
      </div>
    </div>
  );
}
