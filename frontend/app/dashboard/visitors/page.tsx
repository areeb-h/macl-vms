"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useVisitorStore, Visitor } from "@/lib/store/visitor";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { VisitorForm } from "./visitor-form";
import { useAuth } from "@/hooks/useAuth";
import { DeleteDialog } from "./delete-dialog";
import {
  X,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { VisitorFilterForm } from "./filter-form";

interface FilterState {
  search: string;
  nationality: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  } | null;
  singleDate: Date | null;
}

export default function VisitorsPage() {
  const { isAdmin } = useAuth();

  // Store state
  const {
    visitors,
    loading,
    pagination,
    fetchVisitors,
    setFilters,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    resetFilters: resetStoreFilters,
  } = useVisitorStore();

  // Local state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [deletingVisitor, setDeletingVisitor] = useState<Visitor | null>(null);

  const [filters, setLocalFilters] = useState<FilterState>(() => {
    if (typeof window !== "undefined") {
      const savedFilters = localStorage.getItem("visitorFilters");
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);

        return {
          search: parsedFilters.search || "",
          nationality: parsedFilters.nationality || "",
          dateRange: parsedFilters.dateRange
            ? {
                from: parsedFilters.dateRange.from
                  ? new Date(parsedFilters.dateRange.from)
                  : null,
                to: parsedFilters.dateRange.to
                  ? new Date(parsedFilters.dateRange.to)
                  : null,
              }
            : null,
          singleDate: parsedFilters.singleDate
            ? new Date(parsedFilters.singleDate)
            : null,
        };
      }
    }
    return {
      search: "",
      nationality: "",
      dateRange: null,
      singleDate: null,
    };
  });

  const [nationalities, setNationalities] = useState<string[]>([]);
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("visitorFilters", JSON.stringify(filters));
    }
  }, [filters, mounted]);

  // Active filter count
  const activeFilterCount = [
    filters.search,
    filters.nationality,
    filters.dateRange?.from || filters.singleDate,
  ].filter(Boolean).length;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchVisitors();
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [fetchVisitors]);

  useEffect(() => {
    const apiFilters: Record<string, string | null> = {
      search: debouncedSearch || null,
      nationality: filters.nationality || null,
    };

    if (filters.singleDate) {
      apiFilters.checkedInAt =
        filters.singleDate instanceof Date
          ? filters.singleDate.toISOString().split("T")[0]
          : null;

      apiFilters.checkedInStart = null;
      apiFilters.checkedInEnd = null;
    } else if (filters.dateRange?.from) {
      apiFilters.checkedInAt = null;

      if (
        filters.dateRange.from instanceof Date &&
        !isNaN(filters.dateRange.from.getTime())
      ) {
        apiFilters.checkedInStart = filters.dateRange.from
          .toISOString()
          .split("T")[0];
      }

      if (
        filters.dateRange.to instanceof Date &&
        !isNaN(filters.dateRange.to.getTime())
      ) {
        apiFilters.checkedInEnd = filters.dateRange.to
          .toISOString()
          .split("T")[0];
      } else {
        apiFilters.checkedInEnd = null;
      }
    } else {
      apiFilters.checkedInAt = null;
      apiFilters.checkedInStart = null;
      apiFilters.checkedInEnd = null;
    }

    setFilters(apiFilters);
  }, [
    debouncedSearch,
    filters.nationality,
    filters.dateRange,
    filters.singleDate,
    setFilters,
  ]);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [
    debouncedFilters,
    pagination.currentPage,
    pagination.perPage,
    fetchData,
    mounted,
  ]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error("Failed to fetch nationalities");
        const data = await response.json();
        setNationalities(data.map((c: any) => c.name.common).sort());
      } catch (error) {
        console.error("Failed to fetch nationalities", error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchCountries, 1000 * retryCount);
        }
      }
    };
    fetchCountries();
  }, []);

  const resetFilters = useCallback(() => {
    if (activeFilterCount > 0) {
      setLocalFilters({
        search: "",
        nationality: "",
        dateRange: null,
        singleDate: null,
      });
      resetStoreFilters();
      localStorage.removeItem("visitorFilters");
    }
  }, [activeFilterCount, resetStoreFilters]);

  const handleCreateVisitor = async (data: any) => {
    setIsLoading(true);
    try {
      await createVisitor(data);
      setIsAddOpen(false);
      await fetchData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVisitor = async (data: any) => {
    setIsLoading(true);
    try {
      await updateVisitor(data);
      setIsEditOpen(false);
      setEditingVisitor(null);
      await fetchData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVisitor) return;

    setIsLoading(true);
    try {
      await deleteVisitor(deletingVisitor.id);
      setIsDeleteOpen(false);
      setDeletingVisitor(null);
      await fetchData();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback(
    (page: number) => {
      if (page !== pagination.currentPage) {
        setFilters({ page: page.toString() });
      }
    },
    [pagination.currentPage, setFilters]
  );

  const handlePerPageChange = useCallback(
    (value: string) => {
      setFilters({ perPage: value, page: "1" });
    },
    [setFilters]
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!mounted) return null;

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track visitor registrations
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Visitor
        </Button>
      </div>

      {/* Main Filters Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 /max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search visitors..."
            value={filters.search}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-9 pr-8"
          />
          {filters.search && (
            <button
              onClick={() =>
                setLocalFilters((prev) => ({ ...prev, search: "" }))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex space-x-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              Reset all
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <VisitorFilterForm
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setLocalFilters}
            nationalities={nationalities}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.nationality && (
            <Badge variant="secondary" className="h-6">
              Nationality: {filters.nationality}
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, nationality: "" }))
                }
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(filters.dateRange?.from || filters.singleDate) && (
            <Badge variant="secondary" className="h-6">
              Date:{" "}
              {filters.singleDate instanceof Date &&
              !isNaN(filters.singleDate.getTime())
                ? filters.singleDate.toLocaleDateString("en-GB") // ✅ Format as dd/mm/yyyy
                : filters.dateRange?.from instanceof Date &&
                    !isNaN(filters.dateRange.from.getTime())
                  ? `${filters.dateRange.from.toLocaleDateString("en-GB")} - ${
                      filters.dateRange.to instanceof Date &&
                      !isNaN(filters.dateRange.to.getTime())
                        ? filters.dateRange.to.toLocaleDateString("en-GB")
                        : "..."
                    }`
                  : "Invalid date"}
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    dateRange: null,
                    singleDate: null,
                  }))
                }
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={getColumns(
          {
            onEdit: (visitor) => {
              setEditingVisitor(visitor);
              setIsEditOpen(true);
            },
            onDelete: (visitor) => {
              setDeletingVisitor(visitor);
              setIsDeleteOpen(true);
            },
          },
          isAdmin() // ✅ Pass `isAdmin` to `getColumns`
        )}
        data={visitors}
        onSort={(field, direction) => {
          setFilters({
            sort_field: field,
            sort_direction: direction,
          });
        }}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min(
              (pagination.currentPage - 1) * pagination.perPage + 1,
              pagination.totalItems
            )}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </span>
          <Select
            value={pagination.perPage.toString()}
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={
                    page === pagination.currentPage ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasMorePages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <VisitorForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateVisitor}
      />

      <VisitorForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingVisitor(null);
        }}
        onSubmit={handleUpdateVisitor}
        visitor={editingVisitor}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingVisitor(null);
        }}
        onConfirm={handleDeleteConfirm}
        visitorName={deletingVisitor?.full_name}
      />
    </div>
  );
}
