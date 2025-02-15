"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check, Search, Loader2, User, Mail, Phone, Globe } from "lucide-react";
import { useVisitorStore } from "@/lib/store/visitor";

const CheckInPage = () => {
  const [uniqueCode, setUniqueCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { visitorDetails, loading, fetchVisitorByCode, checkInVisitor } =
    useVisitorStore();

  useEffect(() => {
    if (visitorDetails) {
      console.log("✅ Visitor Updated:", visitorDetails);
    }
  }, [visitorDetails]); // ✅ React to Zustand state changes

  const handleFetchVisitor = async () => {
    if (!uniqueCode.trim()) {
      setStatusMessage("Please enter a valid unique code.");
      return;
    }
    setStatusMessage(null);
    const { success, error } = await fetchVisitorByCode(uniqueCode);
    if (!success) setStatusMessage("Visitor not found.");
  };

  const handleCheckIn = async () => {
    if (!visitorDetails) return;
    setStatusMessage(null);

    const { success, error } = await checkInVisitor(uniqueCode);

    if (success) {
      setStatusMessage("Check-in successful!");

      // ✅ Directly update Zustand store to reflect checked-in status
      useVisitorStore.setState((state) => ({
        visitorDetails: state.visitorDetails
          ? { ...state.visitorDetails, checked_in_at: new Date().toISOString() }
          : null,
      }));

      console.log(
        "✅ Zustand Updated - Visitor Checked In:",
        useVisitorStore.getState().visitorDetails
      );
    } else {
      setStatusMessage(error || "Check-in failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-medium text-gray-900">
            Visitor Check-in
          </h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-700">
              Enter Check-in Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="unique_code"
                className="text-xs font-medium text-gray-600"
              >
                Unique Code
              </Label>
              <div className="relative">
                <Input
                  id="unique_code"
                  type="text"
                  placeholder="Enter code..."
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value)}
                  className="pr-10 h-9 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFetchVisitor();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleFetchVisitor}
                  disabled={loading || !uniqueCode.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-2 rounded text-xs ${statusMessage.includes("successful") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
              >
                {statusMessage}
              </div>
            )}

            {/* Visitor Details Section */}
            {visitorDetails && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Visitor Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-gray-700">
                        {visitorDetails.full_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-700">{visitorDetails.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-700">
                        {visitorDetails.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="text-gray-700">
                        {visitorDetails.nationality}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      {visitorDetails.checked_in_at ? (
                        <p className="text-green-600 text-sm">Checked In</p>
                      ) : (
                        <p className="text-amber-600 text-sm">Pending</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ Only show check-in button if visitor is still "Pending" */}
                {!visitorDetails.checked_in_at && (
                  <Button
                    className="w-full mt-4 h-9 text-sm"
                    onClick={handleCheckIn}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1">
                        Check In <Check className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInPage;
