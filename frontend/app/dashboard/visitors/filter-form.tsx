"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  search: string;
  nationality: string;
  dateRange: { from: Date | null; to: Date | null } | null;
  singleDate: Date | null;
}

interface VisitorFilterFormProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  nationalities: string[];
  resetFilters: () => void;
  activeFilterCount: number;
}

export function VisitorFilterForm({
  isOpen,
  onClose,
  filters,
  setFilters,
  nationalities,
  resetFilters,
  activeFilterCount,
}: VisitorFilterFormProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        showClose={false}
        className="w-[450px] h-fit p-8 rounded-bl-xl sm:w-[600px]"
      >
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Filter Visitors
            </SheetTitle>
            <SheetClose className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400">
              <X className="h-5 w-5" />
            </SheetClose>
          </div>
          <Separator className="mt-4" />
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Nationality Filter */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Nationality</Label>
            <div className="flex items-center">
              <Combobox
                options={nationalities}
                placeholder="Select nationality"
                value={filters.nationality}
                onChange={(value) =>
                  setFilters({ ...filters, nationality: value })
                }
              />
              {filters.nationality && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-8"
                  onClick={() => setFilters({ ...filters, nationality: "" })}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Date Filters with Tabs */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Checked-In Date Filter
            </Label>
            <Tabs
              defaultValue={filters.singleDate ? "single" : "range"}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Date</TabsTrigger>
                <TabsTrigger value="range">Date Range</TabsTrigger>
              </TabsList>

              {/* Single Date Picker */}
              <TabsContent value="single" className="mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.singleDate
                        ? filters.singleDate.toLocaleDateString()
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.singleDate || undefined}
                      onSelect={(date) =>
                        setFilters({
                          ...filters,
                          singleDate: date ?? null,
                          dateRange: null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TabsContent>

              {/* Date Range Picker */}
              <TabsContent value="range" className="mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from
                        ? `${filters.dateRange.from.toLocaleDateString()} - ${
                            filters.dateRange.to?.toLocaleDateString() || "..."
                          }`
                        : "Select date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={
                        filters.dateRange
                          ? {
                              from: filters.dateRange.from || undefined,
                              to: filters.dateRange.to || undefined,
                            }
                          : undefined
                      }
                      onSelect={(range) =>
                        setFilters({
                          ...filters,
                          dateRange: range
                            ? { from: range.from ?? null, to: range.to ?? null }
                            : null,
                          singleDate: null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
          >
            Reset Filters
          </Button>
          <Button
            onClick={() => {
              const sheet = document.querySelector('[data-state="open"]');
              if (sheet) {
                (sheet as HTMLElement).click();
              }
            }}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
