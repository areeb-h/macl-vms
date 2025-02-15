"use client";

import { useAuthStore } from "@/lib/store/auth";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const result = await authAPI.login(email, password);
      if (!result) {
        return;
      }

      const { token, user } = result; // ✅ Safe destructuring
      setAuth(token, user);
      console.log("✅ User stored in Zustand:", user);
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = () => user?.role === "admin";
  const isStaff = () => user?.role === "staff";

  return { login, logout, user, token, isAdmin, isStaff };
};
