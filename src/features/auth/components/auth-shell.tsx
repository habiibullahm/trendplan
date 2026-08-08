import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/** Centered auth/onboarding shell — Card on brand background. */
export function AuthShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
      <Card
        className={cn(
          "w-full max-w-md gap-0 rounded-2xl py-6 text-card-foreground ring-border",
          className,
        )}
      >
        <CardContent className="px-6">{children}</CardContent>
      </Card>
    </main>
  );
}
