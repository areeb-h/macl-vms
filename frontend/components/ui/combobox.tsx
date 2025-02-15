"use client";

import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "cmdk";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  options: string[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export function Combobox({
  options,
  placeholder = "Select",
  value,
  onChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value || placeholder}{" "}
          {/* ✅ Ensure placeholder displays if no value is selected */}
          <ChevronsUpDown className="opacity-50 w-4 h-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="cursor-pointer flex justify-between items-center"
              >
                {option}
                {/* ✅ Correct checkmark visibility */}
                <Check
                  className={cn(
                    "ml-auto w-4 h-4 opacity-0",
                    value === option ? "opacity-100" : ""
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
