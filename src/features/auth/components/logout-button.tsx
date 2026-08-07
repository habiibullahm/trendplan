"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="secondary"
      width="full"
      loading={pending}
      loadingText="Keluar..."
      className="rounded-2xl text-coral"
    >
      Keluar
    </Button>
  );
}
