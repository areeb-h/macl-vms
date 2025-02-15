// // lib/store/auth.ts
// "use client"; // Important for Next.js client-side storage

// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { User } from "@/lib/types";

// /**
//  * Shape of our auth store's state
//  */
// interface AuthState {
//   token: string | null;
//   user: User | null;
//   setAuth: (token: string, user: User) => void;
//   clearAuth: () => void;
//   isAdmin: () => boolean; // ✅ Converted to functions
//   isStaff: () => boolean;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       token: null,
//       user: null,

//       setAuth: (token, user) => {
//         console.log("🟢 Storing in Zustand:", { token, user });
//         set({ token, user });
//         console.log("✅ Zustand User:", get().user);
//       },

//       clearAuth: () => {
//         console.log("🔴 Clearing Zustand Auth");
//         set({ token: null, user: null });
//       },

//       // ✅ Converted to functions (correct way for Zustand)
//       isAdmin: () => get().user?.role === "admin",
//       isStaff: () => get().user?.role === "staff",
//     }),
//     {
//       name: "auth-storage", // Key in localStorage
//       storage: createJSONStorage(() => localStorage), // Explicitly using localStorage
//     }
//   )
// );

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: Cookies.get("auth_token") || null,
      user: null,

      setAuth: (token, user) => {
        Cookies.set("auth_token", token, { expires: 7, secure: true });
        set({ token, user });
      },

      clearAuth: () => {
        Cookies.remove("auth_token");
        set({ token: null, user: null });
      },

      isAdmin: () => get().user?.role === "admin",
      isStaff: () => get().user?.role === "staff",
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
