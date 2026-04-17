"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  gmailConnected: boolean;
  recheckGmail: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  gmailConnected: false,
  recheckGmail: () => {},
});

async function checkGmailConnected(user: User): Promise<boolean> {
  try {
    const res = await fetch(`/api/gmail-status?uid=${user.uid}`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.connected;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);

  const recheckGmail = useCallback(async () => {
    if (!user) return;
    const connected = await checkGmailConnected(user);
    setGmailConnected(connected);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const connected = await checkGmailConnected(firebaseUser);
        setGmailConnected(connected);
      } else {
        setGmailConnected(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, gmailConnected, recheckGmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
