"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  X,
  User,
  Mail,
  Phone,
  FileText,
  Globe,
  Clock,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";

const visitorSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  purpose_of_visit: z.string().min(1, "Purpose of visit is required"),
  expected_check_in_date: z.date().optional(),
  nationality: z.string().min(1, "Nationality is required"),
});

type VisitorFormProps = {
  visitor?: any;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
};

export function VisitorForm({
  visitor,
  onSubmit,
  onClose,
  isOpen,
}: VisitorFormProps) {
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    visitor?.expected_check_in_date
      ? new Date(visitor.expected_check_in_date)
      : undefined
  );

  const form = useForm({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      full_name: visitor?.full_name || "",
      email: visitor?.email || "",
      phone_number: visitor?.phone_number || "",
      purpose_of_visit: visitor?.purpose_of_visit || "",
      expected_check_in_date: visitor?.expected_check_in_date
        ? new Date(visitor.expected_check_in_date)
        : undefined,
      nationality: visitor?.nationality || "",
    },
  });

  useEffect(() => {
    if (visitor) {
      form.reset({
        full_name: visitor.full_name,
        email: visitor.email,
        phone_number: visitor.phone_number,
        purpose_of_visit: visitor.purpose_of_visit,
        expected_check_in_date: visitor.expected_check_in_date
          ? new Date(visitor.expected_check_in_date)
          : undefined,
        nationality: visitor.nationality,
      });
      setSelectedDate(
        visitor.expected_check_in_date
          ? new Date(visitor.expected_check_in_date)
          : undefined
      );
    }
  }, [visitor, form]);

  useEffect(() => {
    async function fetchNations() {
      setIsLoading(true);
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all");
        const data = await resp.json();
        const sorted = data.map((c: any) => c.name.common).sort();
        setNationalities(sorted);
      } catch (err) {
        console.error("Failed to fetch nationalities", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNations();
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      await onSubmit({
        ...formData,
        id: visitor?.id,
        expected_check_in_date: selectedDate
          ? selectedDate.toISOString().split("T")[0]
          : "",
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        showClose={false}
        className="w-[400px] sm:w-[600px] overflow-y-auto p-8"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="flex-none">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">
                {visitor ? "Edit Visitor" : "New Visitor"}
              </SheetTitle>
              <SheetClose className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
            <Separator className="mt-4" />
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex-1 space-y-6 mt-6 overflow-y-auto"
            >
              <div className="space-y-6 px-1">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose_of_visit"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex space-x-2 items-center">
                        <FormLabel className="text-sm font-medium">
                          Purpose of Visit
                        </FormLabel>
                        <FileText className=" h-4 w-4 text-gray-500" />
                      </div>

                      <FormControl>
                        <div className="relative">
                          <Textarea
                            {...field}
                            rows={4} // Adjust number of rows as needed
                            placeholder="Describe the purpose of your visit"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_check_in_date"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Expected Check-in Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal relative h-10"
                          >
                            {selectedDate
                              ? format(selectedDate, "MMM dd, yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-4 justify-between">
                      <FormLabel className="text-sm font-medium">
                        Nationality
                      </FormLabel>
                      <FormControl className="w-full">
                        <Combobox
                          // options={nationalities}
                          options={isLoading ? ["Loading..."] : nationalities}
                          placeholder="Select Nationality"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          <div className="flex-none mt-6 border-t pt-4">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4"
              >
                Cancel
              </Button>
              <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
                {visitor ? "Update Visitor" : "Register Visitor"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
