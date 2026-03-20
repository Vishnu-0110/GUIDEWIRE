"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";

export default function ProtectedPage({ children }) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/auth");
    }
  }, [hydrated, token, router]);

  if (!hydrated) return null;
  if (!token) return null;
  return children;
}
