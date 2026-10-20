import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, use, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

import { get } from "@/api/client";
import { clearToken, useToken } from "@/auth/token";
import type { CurrentResponse } from "@/bindings/CurrentResponse";

interface SessionContextValue {
  user: CurrentResponse | null;
  token: string | null;
  isLoading: boolean;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useToken();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["session", token],
    queryFn: () => get<CurrentResponse>("/api/auth/current"),
    enabled: token !== null,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const signOut = useCallback(() => {
    clearToken();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: token === null ? null : (data ?? null),
      token,
      isLoading: token !== null && isPending,
      signOut,
    }),
    [token, data, isPending, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const context = use(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used inside <AuthProvider>");
  }
  return context;
}
