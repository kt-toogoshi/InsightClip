"use client";

import { AppAmplifyProvider } from "@/contexts/AppAmplifyContext";
import { AppShell } from "@/components/layout/AppShell";

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppAmplifyProvider>
      <AppShell>{children}</AppShell>
    </AppAmplifyProvider>
  );
}
