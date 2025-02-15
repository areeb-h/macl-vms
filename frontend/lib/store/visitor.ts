import { create } from "zustand";
import { apiRequest, paginatedApiRequest } from "@/lib/apiClient";

export interface Visitor {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  purpose_of_visit: string;
  expected_check_in_date: string;
  nationality: string;
  checked_in_at: string | null;
  unique_code: string;
  created_at: string;
}

interface FilterState {
  search: string | null;
  nationality: string | null;
  checkedInAt: string | null;
  checkedInStart: string | null;
  checkedInEnd: string | null;
  page: string;
  perPage: string;
  sort_field?: string | null;
  sort_direction?: "asc" | "desc" | null;
}

interface PaginationState {
  perPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMorePages: boolean;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
}

interface VisitorResponse {
  success: boolean;
  message: string;
  data: Visitor[];
  pagination: PaginationState;
}

interface VisitorState {
  visitors: Visitor[];
  visitorDetails: Visitor | null;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  fetchVisitors: (url?: string | null) => Promise<void>;
  fetchVisitorByCode: (
    uniqueCode: string
  ) => Promise<{ success: boolean; error?: string }>;
  checkInVisitor: (
    uniqueCode: string
  ) => Promise<{ success: boolean; error?: string }>;
  createVisitor: (
    visitorData: Partial<Visitor>
  ) => Promise<{ success: boolean; error?: string }>;
  updateVisitor: (
    visitorData: Partial<Visitor>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteVisitor: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_FILTERS: FilterState = {
  search: null,
  nationality: null,
  checkedInAt: null,
  checkedInStart: null,
  checkedInEnd: null,
  page: "1",
  perPage: "5",
};

const DEFAULT_PAGINATION: PaginationState = {
  perPage: 5,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasMorePages: false,
  nextPageUrl: null,
  prevPageUrl: null,
};

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitors: [],
  visitorDetails: null,
  pagination: { ...DEFAULT_PAGINATION },
  loading: false,
  error: null,
  filters: { ...DEFAULT_FILTERS },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
    get().fetchVisitors();
  },

  resetFilters: () => {
    set({
      filters: DEFAULT_FILTERS,
      pagination: DEFAULT_PAGINATION,
    });
    get().fetchVisitors();
  },

  fetchVisitors: async (url = "/api/visitors") => {
    set({ loading: true, error: null });

    try {
      const { filters } = get();
      const params = new URLSearchParams({
        per_page: filters.perPage || "10",
        page: filters.page || "1",
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.nationality ? { nationality: filters.nationality } : {}),
        ...(filters.checkedInAt ? { checked_in_at: filters.checkedInAt } : {}),
        ...(filters.checkedInStart
          ? { checked_in_start: filters.checkedInStart }
          : {}),
        ...(filters.checkedInEnd
          ? { checked_in_end: filters.checkedInEnd }
          : {}),
      });

      const fullUrl = `${url}?${params.toString()}`;
      const response = await paginatedApiRequest<VisitorResponse>(
        "get",
        fullUrl
      );

      if (response.success && Array.isArray(response.data)) {
        set({
          visitors: response.data,
          pagination: {
            perPage: response.pagination?.per_page || 10,
            currentPage: (response.pagination as any)?.current_page || 1,
            totalPages: (response.pagination as any)?.total_pages || 1,
            totalItems: (response.pagination as any)?.total_items || 0,
            hasMorePages: response.pagination?.has_more_pages ?? false,
            nextPageUrl: (response.pagination as any)?.next_page || null,
            prevPageUrl: (response.pagination as any)?.prev_page || null,
          },
          error: null,
        });
      } else {
        set({
          error: `Failed to fetch visitors: ${response.message || "Unknown error"}`,
        });
      }
    } catch (error) {
      set({
        error: "Failed to fetch visitors",
        visitors: [],
        pagination: DEFAULT_PAGINATION,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchVisitorByCode: async (uniqueCode) => {
    set({ loading: true, visitorDetails: null, error: null });

    try {
      const response = await apiRequest<Visitor>(
        "get",
        `/api/visitors/${uniqueCode}`
      );

      if (response && "id" in response) {
        set({
          visitorDetails: response as unknown as Visitor,
          loading: false,
        });
        return { success: true };
      } else {
        set({ error: "Visitor not found.", loading: false });
        return { success: false, error: "Visitor not found." };
      }
    } catch (error) {
      set({ error: "Error fetching visitor details.", loading: false });
      return { success: false, error: "Error fetching visitor details." };
    }
  },

  checkInVisitor: async (uniqueCode) => {
    set({ error: null });

    try {
      const response = await apiRequest<{ success: boolean; data?: Visitor }>(
        "post",
        "/api/visitors/check-in",
        { unique_code: uniqueCode }
      );

      if (response && "id" in response) {
        set({ visitorDetails: response as unknown as Visitor, loading: false });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.message || "Check-in failed.",
        };
      }
    } catch (error) {
      return { success: false, error: "Error during check-in." };
    }
  },

  createVisitor: async (visitorData) => {
    set({ error: null });

    try {
      const response = await apiRequest<{ success: boolean; data: Visitor }>(
        "post",
        "/api/visitors",
        visitorData
      );

      if (response.success && response.data) {
        set((state) => ({
          filters: {
            ...state.filters,
            page: "1",
          },
        }));
        await get().fetchVisitors();
        return { success: true };
      }

      set({ error: response.message });
      return { success: false, error: response.message };
    } catch (error) {
      set({ error: "Failed to create visitor" });
      return { success: false, error: "Failed to create visitor" };
    }
  },

  updateVisitor: async (visitorData) => {
    set({ error: null });

    try {
      const response = await apiRequest<{ success: boolean; data: Visitor }>(
        "put",
        `/api/visitors/${visitorData.id}`,
        visitorData
      );

      if (response.success && response.data) {
        await get().fetchVisitors();
        return { success: true };
      }

      set({ error: response.message });
      return { success: false, error: response.message };
    } catch (error) {
      set({ error: "Failed to update visitor" });
      return { success: false, error: "Failed to update visitor" };
    }
  },

  deleteVisitor: async (id: string) => {
    set({ error: null });

    try {
      const response = await apiRequest<{ success: boolean }>(
        "delete",
        `/api/visitors/${id}`
      );

      if (response.success) {
        await get().fetchVisitors();
        return { success: true };
      }

      return { success: false, error: response.message };
    } catch (error) {
      set({ error: "Failed to delete visitor" });
      return { success: false, error: "Failed to delete visitor" };
    }
  },
}));
