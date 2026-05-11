import React, { createContext, useContext, useEffect, useState } from "react";
import { html } from "../lib/html.js";
import { getSupabaseClient, loadSupabase } from "../lib/supabase.js";

const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let authSubscription = null;

    async function initSession() {
      try {
        await loadSupabase();
      } catch (error) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setClient(supabase);
      }

      const lastActive = Number(localStorage.getItem("brightLastActive") || 0);
      if (lastActive && Date.now() - lastActive > SESSION_MAX_AGE_MS) {
        try {
          await supabase.auth.signOut();
        } finally {
          localStorage.clear();
          if (!cancelled) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }

      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);

      authSubscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
      }).data.subscription;
    }

    initSession();

    return () => {
      cancelled = true;
      authSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    const updateLastActive = () => {
      localStorage.setItem("brightLastActive", Date.now().toString());
    };

    updateLastActive();

    document.addEventListener("click", updateLastActive);
    document.addEventListener("keydown", updateLastActive);

    return () => {
      document.removeEventListener("click", updateLastActive);
      document.removeEventListener("keydown", updateLastActive);
    };
  }, [session]);

  async function logout() {
    if (client) {
      await client.auth.signOut();
    }
    localStorage.clear();
    setSession(null);
    setUser(null);
  }

  const value = {
    loading,
    session,
    user,
    client,
    isAuthenticated: Boolean(session),
    logout
  };

  return html`<${SessionContext.Provider} value=${value}>${children}</${SessionContext.Provider}>`;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider.");
  }
  return context;
}
