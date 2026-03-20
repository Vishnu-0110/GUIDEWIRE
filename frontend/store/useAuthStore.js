"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setSession: ({ token, user }) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("gigshield_token", token);
        }
        set({ token, user });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("gigshield_token");
        }
        set({ token: null, user: null });
      },
      setUser: (user) => set({ user })
    }),
    {
      name: "gigshield-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);

export default useAuthStore;
