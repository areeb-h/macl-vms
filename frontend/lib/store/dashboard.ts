"use client";

import { create } from "zustand";
import { apiRequest } from "@/lib/apiClient";

interface VisitorByNationality {
  nationality: string;
  count: number;
}

interface VisitorStats {
  total_visitors: number;
  checked_in_visitors: number;
  pending_visitors: number;
  visitors_today: number;
  visitors_by_nationality: VisitorByNationality[];
}

interface DashboardState {
  stats: VisitorStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  lastUpdated: number;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  loading: false,
  error: null,
  lastUpdated: Date.now(),

  fetchStats: async () => {
    if (get().stats) {
      console.info("⚡ Dashboard stats already loaded. Skipping API call.");
      return;
    }

    set({ loading: true, error: null });

    try {
      console.info("📡 Fetching dashboard statistics...");

      const response = (await apiRequest(
        "get",
        "/api/dashboard/stats"
      )) as VisitorStats;

      if (!response) {
        throw new Error("Invalid API response structure.");
      }

      const stats: VisitorStats = {
        total_visitors: response.total_visitors ?? 0,
        checked_in_visitors: Number(response.checked_in_visitors) || 0,
        pending_visitors: Number(response.pending_visitors) || 0,
        visitors_today: Number(response.visitors_today) || 0,
        visitors_by_nationality: response.visitors_by_nationality ?? [],
      };

      console.info("✅ Dashboard stats loaded successfully:", stats);

      set({ stats, loading: false, lastUpdated: Date.now() });
    } catch (error) {
      set({ error: "Error fetching statistics", loading: false });
    }
  },
}));
