import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Copy, Check, MoreVertical } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/toast";

export type Visitor = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  nationality: string;
  purpose_of_visit: string;
  expected_check_in_date: string;
  checked_in_at: string | null;
  created_at: string;
  unique_code: string;
};

// Visitor Details Modal Component
const VisitorDetailsModal = ({
  visitor,
  isOpen,
  onClose,
}: {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!visitor) return null;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(visitor.unique_code);
    setCopied(true);
    showToast("Unique code copied to clipboard!", { type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Visitor Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{visitor.full_name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{visitor.email}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{visitor.phone_number}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Nationality</p>
            <p className="font-medium">{visitor.nationality}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Purpose of Visit</p>
            <p className="font-medium">{visitor.purpose_of_visit}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Expected Check-in Date</p>
            <p className="font-medium">
              {format(new Date(visitor.expected_check_in_date), "PPP")}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-500">Check-in Status</p>
            <p className="font-medium">
              {visitor.checked_in_at ? (
                <span className="inline-flex items-center rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Checked in: {format(new Date(visitor.checked_in_at), "PPP")}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-lg bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                  Pending
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <div>
              <p className="text-sm text-gray-500">Unique Code</p>
              <div className="flex space-x-2 items-center">
                <p className="font-medium">{visitor.unique_code}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ColumnOptions {
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
  onView?: (visitor: Visitor) => void;
}

export const getColumns = (
  { onEdit, onDelete }: ColumnOptions,
  isAdmin: boolean // ✅ Pass isAdmin as a parameter
): ColumnDef<Visitor>[] => [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("full_name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    enableSorting: false,
  },
  {
    accessorKey: "nationality",
    header: "Nationality",
  },
  {
    accessorKey: "expected_check_in_date",
    header: "Expected Check-in",
    cell: ({ row }) => {
      const date = row.getValue("expected_check_in_date");
      return date ? format(new Date(date as string), "PPP") : "-";
    },
  },
  {
    accessorKey: "checked_in_at",
    header: "Check-in Status",
    cell: ({ row }) => {
      const date = row.getValue("checked_in_at");
      return date ? (
        <span className="inline-flex items-center rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Checked in: {format(new Date(date as string), "dd/MM/yyyy")}
        </span>
      ) : (
        <span className="inline-flex items-center rounded-lg bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
          Pending
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const visitor = row.original;
      const [copied, setCopied] = useState(false);
      const [isViewModalOpen, setIsViewModalOpen] = useState(false);

      const copyToClipboard = () => {
        navigator.clipboard.writeText(visitor.unique_code);
        setCopied(true);
        showToast("Unique code copied to clipboard!", { type: "success" });
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsViewModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Code
              </DropdownMenuItem>

              {isAdmin && ( // ✅ Show Edit & Delete buttons only for Admins
                <>
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(visitor)}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Visitor
                    </DropdownMenuItem>
                  )}

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(visitor)}
                        className="flex items-center gap-2 text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Visitor
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <VisitorDetailsModal
            visitor={visitor}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
          />
        </>
      );
    },
  },
];
