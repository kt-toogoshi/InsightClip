"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify/configureAmplify";

type AppAmplifyState = {
  ready: boolean;
  hasBackend: boolean;
  userEmail: string | null;
  refreshUser: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AppAmplifyContext = createContext<AppAmplifyState | null>(null);

export function AppAmplifyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasBackend, setHasBackend] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!hasBackend) {
      setUserEmail(null);
      return;
    }
    try {
      const u = await getCurrentUser();
      setUserEmail(u.signInDetails?.loginId ?? u.username);
    } catch {
      setUserEmail(null);
    }
  }, [hasBackend]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ok = await configureAmplify();
      if (cancelled) return;
      setHasBackend(ok);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !hasBackend) return;
    void refreshUser();
  }, [ready, hasBackend, refreshUser]);

  const signOutUser = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setUserEmail(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      hasBackend,
      userEmail,
      refreshUser,
      signOutUser,
    }),
    [ready, hasBackend, userEmail, refreshUser, signOutUser],
  );

  return (
    <AppAmplifyContext.Provider value={value}>
      {children}
    </AppAmplifyContext.Provider>
  );
}

export function useAppAmplify() {
  const ctx = useContext(AppAmplifyContext);
  if (!ctx) {
    throw new Error("useAppAmplify must be used within AppAmplifyProvider");
  }
  return ctx;
}
