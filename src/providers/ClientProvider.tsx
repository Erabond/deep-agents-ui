"use client";

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Client } from "@langchain/langgraph-sdk";
import { useAuth } from "@/providers/AuthProvider";

interface ClientContextValue {
  client: Client;
}

const ClientContext = createContext<ClientContextValue | null>(null);

/**
 * Provides a LangGraph Client that routes all requests through /api/langgraph.
 * The Firebase ID token is added to every request as `Authorization: Bearer <token>`
 * and automatically refreshed every 50 minutes (tokens expire after 60).
 */
export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState<string>("");

  useEffect(() => {
    if (!user) {
      setIdToken("");
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      const token = await user.getIdToken();
      if (!cancelled) setIdToken(token);
    };

    refresh();
    const interval = setInterval(refresh, 50 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const client = useMemo(
    () =>
      new Client({
        apiUrl: `${window.location.origin}/api/langgraph`,
        defaultHeaders: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      }),
    [idToken]
  );

  const value = useMemo(() => ({ client }), [client]);

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}

export function useClient(): Client {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context.client;
}
